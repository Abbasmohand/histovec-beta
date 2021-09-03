import { appLogger, syslogLogger } from '../../../util/logger.js'
import { base64Decode, decryptJson, hash, urlSafeBase64Encode } from '../../../util/crypto.js'
import { getDepartement } from '../../../util/codePostal.js'
import { buildReportId, buildReportKey } from '../util/report.js'
import { normalizeReport, normalizeControlesTechniques } from '../util/normalizeData.js'
import { vehiculeMapping, controlesTechniquesMapping } from '../util/mapping.js'
import { processControlesTechniques } from '../../../util/controlesTechniques.js'
import { checkPayload } from '../util/check/reportByData.js'
import { reportResponseSchema } from '../../schemas/report.js'

import { NUMERO_IMMATRICULATION_SIV_REGEX } from '../../../constant/regex.js'
import { TYPE_IMMATRICULATION, TYPE_PERSONNE } from '../../../constant/type.js'

import config from '../../../config.js'


export const generateReportRoute = ({ path, logLabel, payloadSchema }) => {
  return {
    method: 'POST',
    path,
    options: {
      tags: ['api'],
      validate: {
        payload: payloadSchema,
      },
      response: {
        schema: reportResponseSchema,
      }
    },
    handler: async (request, h) => {
      const {
        vehicule: {
          // report by id payload
          id,
          key,

          // report by data payload
          certificat_immatriculation: {
            titulaire: {
              particulier: {
                nom,
                prenoms,
              } = {},
              personne_morale: {
                raison_sociale: raisonSociale,
                siren,
              } = {},
            } = {},
            numero_immatriculation: numeroImmatriculation,
            date_emission_certificat_immatriculation: dateEmissionCertificatImmatriculation,
            numero_formule: numeroFormule,
          },
        },
        options: {
          controles_techniques: askTechnicalControls,
        } = {},
      } = request.payload

      const alreadyHasIdAndKey = Boolean(id) && Boolean(key)
      syslogLogger.debug({ key: 'payload', tag: logLabel, value: { nom, prenoms, raisonSociale, siren, numeroImmatriculation, numeroFormule, dateEmissionCertificatImmatriculation, id, key } })

      // If id param is present, it has been generated by frontend :
      // => it already has been urlSafeBaseEncoded as needed
      let urlSafeBase64EncodedReportId = id

      // If key param is present, it has been generated by frontend :
      // => it already has been Base64ncoded as needed
      let reportKey = key

      if (!alreadyHasIdAndKey) {
        // As far as I know, Joi don't permit to validate as needed in this custom function
        checkPayload({ nom, prenoms, raisonSociale, siren, numeroImmatriculation, numeroFormule, dateEmissionCertificatImmatriculation })

        const typeImmatriculation = NUMERO_IMMATRICULATION_SIV_REGEX.test(numeroImmatriculation) ? TYPE_IMMATRICULATION.SIV : TYPE_IMMATRICULATION.FNI
        const typePersonne = nom ? TYPE_PERSONNE.PARTICULIER : TYPE_PERSONNE.PRO

        const reportId = buildReportId(
          { nom, prenoms, raisonSociale, siren, numeroImmatriculation, numeroFormule, dateEmissionCertificatImmatriculation },
          { typeImmatriculation, typePersonne }
        )
        urlSafeBase64EncodedReportId = urlSafeBase64Encode(reportId)

        reportKey = buildReportKey(
          { numeroImmatriculation, numeroFormule, dateEmissionCertificatImmatriculation },
          { typeImmatriculation }
        )

        syslogLogger.debug({
          key: 'sub_payload',
          tag: logLabel,
          value: {
            urlSafeBase64EncodedReportId: urlSafeBase64EncodedReportId.toString('base64'),
            reportKey: reportKey.toString('base64'),
          }
        })
      }

      const { privateApiReportUrl } = request.server.plugins.publicApi

      const { result } = await request.server.inject({
        method: 'POST',
        url: privateApiReportUrl,
        payload: {
          id: urlSafeBase64EncodedReportId,
          uuid: config.apiUuid,
          options: {
            ignoreTechnicalControls: !askTechnicalControls,
          },
        },
        allowInternals: true,
      })

      if (statusCode != 200) {
        syslogLogger.debug({ key: 'ERROR AT GET REPORT', tag: logLabel, value: { result } })
        // @todo: do better error management
        return result
      }

      const { sivData, statusCode, utacData, utacDataKey, error, message } = result

      syslogLogger.debug({ key: 'encrypted_raw_report', tag: logLabel, value: { sivData, utacData, utacDataKey } })

      const report = decryptJson(sivData, reportKey)
      syslogLogger.debug({ key: 'decrypted_raw_report', tag: logLabel, value: { ...report } })

      const normalizedReport = normalizeReport(report)
      syslogLogger.debug({ key: 'normalized_report', tag: logLabel, value: { ...normalizedReport } })

      const {
        adr_code_postal_tit = '',
        age_certificat,
        couleur,
        CTEC_RLIB_ENERGIE,
        CTEC_RLIB_CATEGORIE,
        CTEC_RLIB_GENRE,
        date_premiere_immat,
        is_apte_a_circuler,
        is_fni,
        marque,
        nom_commercial,
        nb_titulaires,
        tvv,
      } = report

      const departement = adr_code_postal_tit ? getDepartement(adr_code_postal_tit) : undefined
      const anonymizedReportId = urlSafeBase64Encode(hash(urlSafeBase64EncodedReportId))

      appLogger.info(`[Demande] ${anonymizedReportId} age_certificat ${age_certificat}`)
      appLogger.info(`[Demande] ${anonymizedReportId} couleur ${couleur}`)
      appLogger.info(`[Demande] ${anonymizedReportId} CTEC_RLIB_ENERGIE ${CTEC_RLIB_ENERGIE}`)
      appLogger.info(`[Demande] ${anonymizedReportId} CTEC_RLIB_CATEGORIE ${CTEC_RLIB_CATEGORIE}`)
      appLogger.info(`[Demande] ${anonymizedReportId} CTEC_RLIB_GENRE ${CTEC_RLIB_GENRE}`)
      appLogger.info(`[Demande] ${anonymizedReportId} date_premiere_immat ${date_premiere_immat}`)
      appLogger.info(`[Demande] ${anonymizedReportId} departement ${departement}`)
      appLogger.info(`[Demande] ${anonymizedReportId} is_apte_a_circuler ${is_apte_a_circuler}`)
      appLogger.info(`[Demande] ${anonymizedReportId} is_fni ${is_fni}`)
      appLogger.info(`[Demande] ${anonymizedReportId} marque ${marque}`)
      appLogger.info(`[Demande] ${anonymizedReportId} nom_commercial ${nom_commercial}`)
      appLogger.info(`[Demande] ${anonymizedReportId} nb_titulaires ${nb_titulaires}`)
      appLogger.info(`[Demande] ${anonymizedReportId} tvv ${tvv}`)

      const mappedVehicule = vehiculeMapping(normalizedReport)
      syslogLogger.debug({ key: 'mapped_report', tag: logLabel, value: { ...mappedVehicule } })

      if (!askTechnicalControls) {
        const reportWithoutControlesTechniques = {
          vehicule: mappedVehicule,
        }
        syslogLogger.debug({ key: 'report_with_controles_techniques', tag: logLabel, value: { ...reportWithoutControlesTechniques } })

        return reportWithoutControlesTechniques
      }

      // We ask private api (used by frontend) to get utacDataKey :
      // => it already has been Base64Encoded as needed
      const rawUtacDataKey = base64Decode(utacDataKey)
      const rawControlesTechniques = decryptJson(utacData, rawUtacDataKey)
      syslogLogger.debug({ key: 'raw_controles_techniques', tag: logLabel, value: { ...rawControlesTechniques } })

      const normalizedControlesTechniques = normalizeControlesTechniques(rawControlesTechniques)
      syslogLogger.debug({ key: 'normalized_controles_techniques', tag: logLabel, value: { ...normalizedControlesTechniques } })

      const labeledControlesTechniques = processControlesTechniques(normalizedControlesTechniques)
      syslogLogger.debug({ key: 'labeled_controles_techniques', tag: logLabel, value: { ...labeledControlesTechniques } })

      const mappedControlesTechniques = controlesTechniquesMapping(labeledControlesTechniques)
      syslogLogger.debug({ key: 'mapped_controles_techniques', tag: logLabel, value: { ...mappedControlesTechniques } })

      const reportWithControlesTechniques = {
        vehicule: mappedVehicule,
        controles_techniques: mappedControlesTechniques,
      }
      syslogLogger.debug({ key: 'report_with_controles_techniques', tag: logLabel, value: { ...reportWithControlesTechniques } })

      return reportWithControlesTechniques
    },
  }
}
