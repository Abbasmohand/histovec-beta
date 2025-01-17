import Boom from '@hapi/boom'
import { appLogger } from '../../../../util/logger.js'

import { NUMERO_IMMATRICULATION_FNI_REGEX, NUMERO_IMMATRICULATION_SIV_REGEX } from '../../../../constant/regex.js'


const TITULAIRE_PATH = 'vehicule.titulaire'
const TITULAIRE_PARTICULIER_PATH = 'vehicule.titulaire.particulier'
const NOM = `${TITULAIRE_PARTICULIER_PATH}.nom`
const PRENOMS = `${TITULAIRE_PARTICULIER_PATH}.prenoms`
const TITULAIRE_PERSONNE_MORALE_PATH = 'vehicule.titulaire.personne_morale'
const RAISON_SOCIALE = `${TITULAIRE_PERSONNE_MORALE_PATH}.raison_sociale`
const SIREN = `${TITULAIRE_PERSONNE_MORALE_PATH}.siren`

const CERTIFICAT_IMMATRICULATION_PATH = 'vehicule.certificat_immatriculation'
const NUMERO_IMMATRICULATION = `${CERTIFICAT_IMMATRICULATION_PATH}.numero_immatriculation`
const NUMERO_FORMULE = `${CERTIFICAT_IMMATRICULATION_PATH}.numero_formule`
const DATE_EMISSION_CERTIFICAT_IMMATRICULATION = `${CERTIFICAT_IMMATRICULATION_PATH}.date_emission_certificat_immatriculation`

const PUBLIC_ROUTE_REPORT_BY_DATA = 'PUBLIC_ROUTE_REPORT_BY_DATA'


export const checkPayload = ({ nom, prenoms, raisonSociale, siren, numeroImmatriculation, numeroFormule, dateEmissionCertificatImmatriculation }) => {
  const hasPrenoms = prenoms?.length > 0

  if (!nom && !hasPrenoms && !raisonSociale && !siren) {
    appLogger.info(
      `Vous n'avez fourni aucune information concernant le titulaire du véhicule.
      Si vous souhaitez interroger un véhicule particulier, vous devez fournir les 2 champs '${NOM}' et '${PRENOMS}'.
      Si vous souhaitez interroger un véhicule de société, vous devez fournir les 2 champs '${RAISON_SOCIALE}' et '${SIREN}'.`
    )

    throw Boom.badRequest()
  }

  const vehiculeProReminder = (
    `Si vous souhaitez interroger un véhicule de société, fournissez les 2 champs '${RAISON_SOCIALE}' et '${SIREN}' SANS fournir les champs '${NOM}' et '${PRENOMS}'.`
  )

  if (hasPrenoms && !nom) {
    appLogger.info(
      `Vous avez fourni le champ '${PRENOMS}', vous souhaitez donc interroger un véhicule particulier.
      Les 2 champs '${NOM}' et '${PRENOMS}' doivent être renseignés pour interroger un véhicule particulier.
      ${vehiculeProReminder}`
    )

    throw Boom.badRequest()
  }

  if (nom && !hasPrenoms) {
    appLogger.info(
      `Vous avez fourni le champ '${NOM}', vous souhaitez donc interroger un véhicule particulier.
      Les 2 champs '${NOM}' et '${PRENOMS}' doivent être renseignés pour interroger un véhicule particulier.
      ${vehiculeProReminder}`
    )

    throw Boom.badRequest()
  }

  const vehiculeParticulierReminder = (
    `Si vous souhaitez interroger un véhicule particulier, fournissez les 2 champs '${NOM}' et '${PRENOMS}' SANS fournir les champs '${RAISON_SOCIALE}' et '${SIREN}'.`
  )

  if (siren && !raisonSociale) {
    appLogger.info(
      `Vous avez fourni le champ '${SIREN}', vous souhaitez donc interroger un véhicule de société.
      Les 2 champs '${RAISON_SOCIALE}' et '${SIREN}' doivent être renseignés pour interroger un véhicule de société.
      ${vehiculeParticulierReminder}`
    )

    throw Boom.badRequest()
  }

  if (raisonSociale && !siren) {
    appLogger.info(
      `Vous avez fourni le champ '${RAISON_SOCIALE}', vous souhaitez donc interroger un véhicule de société.
      Les 2 champs '${RAISON_SOCIALE}' et '${SIREN}' doivent être renseignés pour interroger un véhicule de société.
      ${vehiculeParticulierReminder}`
    )

    throw Boom.badRequest()
  }
}
