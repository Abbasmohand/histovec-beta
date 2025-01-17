// @todo: Update all "OUI"/"NON" to boolean from data source and remove all utils in this file (and their usage)

import { FR_DATE_EXTRACT_REGEX, ISO_8601_DATE_EXTRACT_REGEX } from '../../../constant/date/regex.js'


const normalizeToBoolean = (value) => {
  if (!value && value !== false) {  // falsy but not false
    return
  }

  switch (value) {
    case true:
    case 'OUI':
      return true
    case false:
    case 'NON':
      return false
    default:
      throw new Error(`${value} of type ${typeof(value)} is not convertible to boolean`)
  }
}

const normalizeToISODate = (value) => {
  if (!value) {
    return
  }

  const frDateMatches = value.match(FR_DATE_EXTRACT_REGEX)
  if (frDateMatches && frDateMatches[1] && frDateMatches[1] && frDateMatches[1]) {
    return `${frDateMatches[3]}-${frDateMatches[2]}-${frDateMatches[1]}`
  }

  const isoDateMatches = value.match(ISO_8601_DATE_EXTRACT_REGEX)
  if (isoDateMatches && isoDateMatches[0]) {
    return isoDateMatches[0]
  }

  throw new Error(`${value} of type is not convertible to ISO8601 Date`)
}

export const normalizeReport = (report) => {
  const {
    date_annulation_ci,
    date_emission_CI,
    date_premiere_immat,
    date_premiere_immat_siv,
    date_update,
    dos_date_conversion_siv,
    dos_date_derniere_modif,
    annulation_ci,
    ci_vole,
    duplicata,
    import: is_imported,
    pers_locataire,
    perte_ci,
    vehicule_vole,
    historique = [],
    date_derniere_resolution,
    date_dernier_sinistre,
    date_import_france,
    date_premiere_immat_etranger,
    has_pve,
    new_historique = [],
    is_apte_a_circuler,
    is_fni,
    is_fni_converti,
    is_incertain,
    sit_adm: {
      suspensions = [],
      dvs = [],
      gages = [],
      opposition: {
        oves = [],
        oveis = [],
        otcis = [],
        otcis_pv = [],
      } = {},
    } = {},
    pve = [],
  } = report

  const normalizeHistorique = (historique) => {
    return historique.map((operation) => {
      return {
        ...operation,
        opa_date: normalizeToISODate(operation?.opa_date),
        ...(
          operation.ope_date_annul ? {
            ope_date_annul: normalizeToISODate(operation.ope_date_annul)
            } : {}
        ),
      }
    })
  }

  const normalizedHistorique = normalizeHistorique(historique)
  const normalizedNewHistorique = normalizeHistorique(new_historique)

  const normalizeElementsWithDate = (elements) => {
    return elements.map((element) => {
      return {
        ...element,
        date: normalizeToISODate(element?.date),
      }
    })
  }

  const normalizedSitAdm = {
    suspensions: suspensions.map((suspension) => {
      return {
        ...suspension,
        date: normalizeToISODate(suspension?.date),
        remise_titre: normalizeToBoolean(suspension?.remise_titre),
        retrait_titre: normalizeToBoolean(suspension?.retrait_titre),
      }
    }),
    dvs: normalizeElementsWithDate(dvs),
    gages: normalizeElementsWithDate(gages),
    opposition: {
      oves: normalizeElementsWithDate(oves),
      oveis: normalizeElementsWithDate(oveis),
      otcis: normalizeElementsWithDate(otcis),
      otcis_pv: normalizeElementsWithDate(otcis_pv),
    }
  }

  const normalizedPve = pve.map((element) => {
    return {
      ...element,
      en_cours: normalizeToBoolean(element?.en_cours),
      ...(
        element?.decl ? {
          decl: {
            ...element.decl,
            date: normalizeToISODate(element?.decl.date),
            dangereux: normalizeToBoolean(element?.decl.dangereux),
            tech_reparable: normalizeToBoolean(element?.decl.tech_reparable),
          }
        } : {}
      ),
      ...(
        element?.prem ? {
          prem: {
            ...element.prem,
            date: normalizeToISODate(element?.prem.date),
            dangereux: normalizeToBoolean(element?.prem.dangereux),
            tech_reparable: normalizeToBoolean(element?.prem.tech_reparable),
          }
        } : {}
      ),
      ...(
        element?.deux ? {
          deux: {
            ...element.deux,
            date: normalizeToISODate(element?.deux.date),
          }
        } : {}
      ),
    }
  })

  return {
    ...report,
    ...(
      date_annulation_ci ? {
        date_annulation_ci: normalizeToISODate(date_annulation_ci)
      } : {}
    ),
    ...(
      date_emission_CI ? {
        date_emission_CI: normalizeToISODate(date_emission_CI)
      } : {}
    ),
    ...(
      date_premiere_immat ? {
        date_premiere_immat: normalizeToISODate(date_premiere_immat)
      } : {}
    ),
    ...(
      date_premiere_immat_siv ? {
        date_premiere_immat_siv: normalizeToISODate(date_premiere_immat_siv)
      } : {}
    ),
    ...(
      date_update ? {
        date_update: normalizeToISODate(date_update)
      } : {}
    ),
    ...(
      dos_date_conversion_siv ? {
        dos_date_conversion_siv: normalizeToISODate(dos_date_conversion_siv)
      } : {}
    ),
    ...(
      dos_date_derniere_modif ? {
        dos_date_derniere_modif: normalizeToISODate(dos_date_derniere_modif)
      } : {}
    ),
    ...(
      annulation_ci ? {
        annulation_ci: normalizeToBoolean(annulation_ci)
      } : {}
    ),
    ...(
      ci_vole ? {
        ci_vole: normalizeToBoolean(ci_vole)
      } : {}
    ),
    ...(
      duplicata ? {
        duplicata: normalizeToBoolean(duplicata)
      } : {}
    ),
    ...(
      is_imported ? {
        import: normalizeToBoolean(is_imported)
      } : {}
    ),
    ...(
      pers_locataire ? {
        pers_locataire: normalizeToBoolean(pers_locataire)
      } : {}
    ),
    ...(
      perte_ci ? {
        perte_ci: normalizeToBoolean(perte_ci)
      } : {}
    ),
    ...(
      vehicule_vole ? {
        vehicule_vole: normalizeToBoolean(vehicule_vole)
      } : {}
    ),
    ...(
      historique ? {
        historique: normalizedHistorique
      } : {}
    ),
    ...(
      new_historique ? {
        new_historique: normalizedNewHistorique
      } : {}
    ),
    sit_adm: normalizedSitAdm,
    ...(
      pve ? {
        pve: normalizedPve
      } : {}
    ),
    ...(
      date_derniere_resolution ? {
        date_derniere_resolution: normalizeToISODate(date_derniere_resolution)
      } : {}
    ),
    ...(
      date_dernier_sinistre ? {
        date_dernier_sinistre: normalizeToISODate(date_dernier_sinistre)
      } : {}
    ),
    ...(
      date_import_france ? {
        date_import_france: normalizeToISODate(date_import_france)
      } : {}
    ),
    ...(
      date_premiere_immat_etranger ? {
        date_premiere_immat_etranger: normalizeToISODate(date_premiere_immat_etranger)
      } : {}
    ),
    ...(
      has_pve ? {
        has_pve: normalizeToBoolean(has_pve)
      } : {}
    ),
    ...(
      is_apte_a_circuler ? {
        is_apte_a_circuler: normalizeToBoolean(is_apte_a_circuler)
      } : {}
    ),
    ...(
      is_fni ? {
        is_fni: normalizeToBoolean(is_fni)
      } : {}
    ),
    ...(
      is_fni_converti ? {
        is_fni_converti: normalizeToBoolean(is_fni_converti)
      } : {}
    ),
    ...(
      is_incertain ? {
        is_incertain: normalizeToBoolean(is_incertain)
      } : {}
    ),
  }
}

export const normalizeControlesTechniques = (controlesTechniques) => {
  const {
    ct = [],
    ctUpdateDate,
  } = controlesTechniques

  const normalizedCt = ct.map((ctItem) => (
    {
      ...ctItem,
      ct_date: normalizeToISODate(ctItem.ct_date),
    }
  ))

  return {
    ct: normalizedCt,
    ctUpdateDate: normalizeToISODate(ctUpdateDate),
  }
}
