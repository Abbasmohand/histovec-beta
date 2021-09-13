import Boom from '@hapi/boom'
import { appLogger, syslogLogger } from '../../../util/logger.js'
import { base64Decode, decryptJson, hash, base64Encode, urlSafeBase64Encode } from '../../../util/crypto.js'
import { getDepartement } from '../../../util/codePostal.js'
import { buildReportId, buildReportKey, buildIdAndKey } from '../util/report.js'
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
          // report by code payload
          code,

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
          } = {},
        },
        options: {
          controles_techniques: askTechnicalControls,
        } = {},
      } = request.payload

      const { id, key, isInvalidCode } = buildIdAndKey(code)

      syslogLogger.debug({ key: 'payload_code', tag: logLabel, value: { isInvalidCode, id, key, code } })

      if (isInvalidCode) {
        throw Boom.badRequest('Malformed HistoVec code')
      }

      const alreadyHasIdAndKey = Boolean(id) && Boolean(key)
      syslogLogger.debug({ key: 'payload_data', tag: logLabel, value: { alreadyHasIdAndKey, nom, prenoms, raisonSociale, siren, numeroImmatriculation, numeroFormule, dateEmissionCertificatImmatriculation, id, key } })

      // If id param is present, it has been generated by frontend :
      // => it already has been Base64Encoded as needed
      let base64EncodedReportId = id

      // If key param is present, it has been generated by frontend :
      // => it already has been Base64Encoded as needed
      let base64EncodedReportKeyBuffer = key && Buffer.from(key, 'base64')

      if (!alreadyHasIdAndKey) {
        // As far as I know, Joi don't permit to validate as needed in this custom function
        checkPayload({ nom, prenoms, raisonSociale, siren, numeroImmatriculation, numeroFormule, dateEmissionCertificatImmatriculation })

        const typeImmatriculation = NUMERO_IMMATRICULATION_SIV_REGEX.test(numeroImmatriculation) ? TYPE_IMMATRICULATION.SIV : TYPE_IMMATRICULATION.FNI
        const typePersonne = nom ? TYPE_PERSONNE.PARTICULIER : TYPE_PERSONNE.PRO

        const reportIdBuffer = buildReportId(
          { nom, prenoms, raisonSociale, siren, numeroImmatriculation, numeroFormule, dateEmissionCertificatImmatriculation },
          { typeImmatriculation, typePersonne }
        )
        base64EncodedReportId = base64Encode(reportIdBuffer)

        base64EncodedReportKeyBuffer = buildReportKey(
          { numeroImmatriculation, numeroFormule, dateEmissionCertificatImmatriculation },
          { typeImmatriculation }
        )

        syslogLogger.debug({
          key: 'sub_payload',
          tag: logLabel,
          value: {
            base64EncodedReportId: base64EncodedReportId,
            base64EncodedReportKey: base64EncodedReportKeyBuffer.toString('base64'),
          }
        })
      }

      const { privateApiReportUrl } = request.server.plugins.publicApi

      const { statusCode, result } = await request.server.inject({
        method: 'POST',
        url: privateApiReportUrl,
        payload: {
          id: base64EncodedReportId,
          uuid: config.apiUuid,
          options: {
            ignoreTechnicalControls: !askTechnicalControls,
          },
        },
        allowInternals: true,
      })

      const { sivData, utacData, utacDataKey, error, message } = result

      if (statusCode !== 200) {
        const errorResponse = { success: false, message }
        switch (statusCode) {
          case 404:
            throw Boom.notFound(message, errorResponse)
          case 502:
            throw Boom.badGateway(message, errorResponse)
          case 503:
            throw Boom.serverUnavailable(message, errorResponse)
          case 500:
          default:
            throw Boom.badImplementation(message, errorResponse)
        }
      }

      syslogLogger.debug({ key: 'encrypted_raw_report', tag: logLabel, value: { sivData, utacData, utacDataKey, base64EncodedReportKeyBuffer } })

      const report = decryptJson(sivData, base64EncodedReportKeyBuffer)
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
      const anonymizedReportId = urlSafeBase64Encode(hash(base64EncodedReportId))

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
