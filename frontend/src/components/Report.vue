<template>
  <section id="result">
    <div class="breadcrumb-container">
      <div class="container">
        <ol class="breadcrumb">
          <li>
            <i class="fa fa-home pr-10"></i>
            <router-link
              :to="{ name: 'home' }"
            >
              Accueil
            </router-link>
          </li>
          <li class="active">
            Résultats
          </li>
        </ol>
      </div>
    </div>

    <section class="main-container">
      <div class="container">
        <div class="row">
          <!-- section start -->
          <section
            class="dark-translucent-bg"
            :style="{ backgroundImage: `url('${imagePoigneeDeMain}')`, backgroundPosition: '50% 50%' }"
          >
            <div class="container">
              <div class="row justify-content-lg-center">
                <div class="col-lg-12">
                  <h2 class="text-center mt-4">
                    <div v-if="holder">
                      <span class="bold_6">Rassurez</span> vos acheteurs potentiels
                    </div>
                    <div v-else>
                      <span class="bold_6">Achetez</span> en confiance un <span class="bold_6">véhicule d'occasion</span>
                    </div>
                  </h2>
                  <div class="separator with-icon">
                    <i class="fa fa-car bordered"></i>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <!-- section end -->
        </div>
      </div>
    </section>

    <div
      v-if="processedSivData"
      class="container"
    >
      <div class="row">
        <div class="col-lg-12 mb-20">
          <!-- debut vignette -->
          <div class="row">
            <div
              class="col-sm-12"
            >
              <div
                v-if="outdatedData"
                class="alert alert-danger alert-icon text-center"
                role="alert"
              >
                <i class="fa fa-exclamation-triangle"></i>
                HistoVec rencontre actuellement des difficultés techniques dans la mise à jour des données relatives aux véhicules qu'il vous permet de consulter.
                <br>
                Seul le certificat de situation administrative disponible sur le site de l'ANTS fait foi.
                <br>
                Veuillez nous excuser pour la gêne occasionnée.
                <br>
                <br>
                <div class="col-xs-8 col-xs-offset-2 col-sm-4 col-sm-offset-4">
                  <a
                    class="btn btn-default btn-m center-block m-h-05"
                    href="https://siv.interieur.gouv.fr/map-usg-ui/do/accueil_certificat"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Obtenir le CSA à jour via l'ANTS
                  </a>
                </div>
                <br>
                <br>
              </div>
            </div>
            <div class="col-sm-6">
              <div
                v-if="!isAnnulationCI"
                class="alert alert-icon alert-info"
                role="alert"
              >
                <i :class="'fa fa-' + processedSivData.logoVehicule"></i>
                Numéro - Plaque d'immatriculation : {{ processedSivData.plaque }}
              </div>
              <div
                v-if="isAnnulationCI"
                class="alert alert-icon alert-danger"
                role="alert"
              >
                <i class="fa fa-warning"></i>
                Le certificat demandé a été annulé : {{ processedSivData.plaque }}
              </div>
            </div>
            <div class="col-sm-6">
              <div
                v-if="showDataDate"
                :class="'alert-' + (isDefaultDataDate ? 'danger' : 'warning')"
                class="alert alert-icon"
                role="alert"
              >
                <i
                  :class="'fa-calendar-' + (isDefaultDataDate ? 'times-o' : 'check-o')"
                  class="fa"
                >
                </i>
                <span v-if="!isDefaultDataDate">
                  Informations du ministère de l'Intérieur datant du
                  <strong>{{ processedSivData.dateUpdate }}</strong>
                </span>
                <span v-if="isDefaultDataDate">
                  Informations connues d'HistoVec non à jour
                </span>
              </div>
              <div
                v-else
                class="alert alert-icon alert-warning"
                role="alert"
              >
                <i class="fa fa-calendar-check-o"></i>
                <span>
                  Informations connues d'HistoVec à ce jour
                </span>
              </div>
            </div>
          </div>
          <!-- fin vignette -->
          <!-- debut trait séparation -->
          <div class="separator-2"></div>
          <!-- fin trait séparation -->
          <!-- debut nouvelle info -->
          <!-- Tabs start -->
          <div class="vertical">
            <!-- Nav tabs -->
            <ul
              class="nav nav-tabs"
              role="tablist"
            >
              <li
                v-if="!isAnnulationCI"
                :class="[{'active' : tab === 'abstract'}]"
              >
                <a
                  class="clickable"
                  @click="tab = 'abstract'"
                >
                  <i class="fa fa-refresh pr-10"></i>
                  Synthèse
                </a>
              </li>
              <li
                v-if="!isAnnulationCI"
                :class="[{'active' : tab === 'vehicle'}]"
              >
                <a
                  class="clickable"
                  @click="tab = 'vehicle'"
                >
                  <i :class="'fa fa-' + processedSivData.logoVehicule + ' pr-10'"></i>
                  Véhicule
                </a>
              </li>
              <li
                v-if="!isAnnulationCI"
                :class="[{'active' : tab === 'holder'}]"
              >
                <a
                  class="clickable"
                  @click="tab = 'holder'"
                >
                  <i class="fa fa-address-card pr-10"></i>
                  Titulaire &amp; Titre
                </a>
              </li>
              <li
                v-if="!isAnnulationCI"
                :class="[{'active' : tab === 'situation'}]"
              >
                <a
                  class="clickable"
                  @click="tab = 'situation'"
                >
                  <i class="fa fa-clipboard pr-10"></i>
                  Situation administrative
                </a>
              </li>
              <li
                v-if="!isAnnulationCI"
                :class="[{'active' : tab === 'history'}]"
              >
                <a
                  class="clickable"
                  @click="tab = 'history'"
                >
                  <i class="fa fa-calculator pr-10"></i>
                  Historique des opérations
                </a>
              </li>
              <li
                v-if="!isAnnulationCI && (ct.length > 0 || ctError)"
                :class="[{'active' : tab === 'utac'}]"
              >
                <a
                  class="clickable"
                  @click="tab = 'utac'"
                >
                  <i class="fa fa-cogs pr-10"></i>
                  Contrôles techniques
                </a>
              </li>
              <li
                v-if="!isAnnulationCI && (ct.length > 0 || ctError)"
                :class="[{'active' : tab === 'utacGraph'}]"
              >
                <a
                  class="clickable"
                  @click="tab = 'utacGraph'"
                >
                  <i class="fa fa-line-chart pr-10"></i>
                  Kilométrage
                </a>
              </li>
              <li
                v-if="holder"
                :class="[{'active' : tab === 'csa'}]"
              >
                <a
                  class="clickable"
                  @click="tab = 'csa'"
                >
                  <i class="fa fa-file-pdf-o pr-10"></i>
                  Certificat de situation administrative
                </a>
              </li>
              <li
                v-if="!isAnnulationCI && holder"
                :class="[{'active' : tab === 'share-report'}]"
              >
                <a
                  class="clickable"
                  @click="tab = 'share-report'"
                >
                  <i class="fa fa-send pr-10"></i>
                  Transmettre le rapport
                </a>
              </li>
              <li
                v-if="!isAnnulationCI && holder"
                :class="[{'active' : tab === 'share-code-partage'}]"
              >
                <a
                  class="clickable"
                  @click="tab = 'share-code-partage'"
                >
                  <i class="fa fa-share pr-10"></i>
                  Transmettre le code partage
                </a>
              </li>
            </ul>
            <!-- Tab panes -->
            <div class="tab-content">
              <!-- /* ----------------- synthese ----------------- */ -->
              <div
                class="tab-pane fade"
                :class="[{'in active' : tab === 'abstract'}]"
              >
                <abstract
                  v-if="tab === 'abstract' && !isAnnulationCI"
                  :processed-siv-data="processedSivData"
                  :holder="holder"
                  :change-tab="changeTab"
                >
                </abstract>
              </div>
              <!-- /* ----------------- vehicule ----------------- */ -->
              <div
                class="tab-pane fade pr-20"
                :class="[{'in active' : tab === 'vehicle'}]"
              >
                <tech-chars
                  v-if="tab === 'vehicle'"
                  :ctec="processedSivData.ctec"
                >
                </tech-chars>
              </div>
              <!-- /* ----------------- titre ----------------- */ -->
              <div
                class="tab-pane fade"
                :class="[{'in active' : tab === 'holder'}]"
              >
                <license
                  v-if="tab === 'holder'"
                  :certificat="processedSivData.certificat"
                  :titulaire="processedSivData.titulaire"
                >
                </license>
              </div>
              <!-- situation administrative -->
              <div
                class="tab-pane fade"
                :class="[{'in active' : tab === 'situation'}]"
              >
                <administrative
                  v-if="tab === 'situation'"
                  :holder="holder"
                  :opposition-section="processedSivData.administratif.opposition"
                  :report-labels="processedSivData.administratif.reportLabels"
                >
                </administrative>
              </div>
              <!-- historique des opérations -->
              <div
                class="tab-pane fade"
                :class="[{'in active' : tab === 'history'}]"
              >
                <history
                  v-if="tab === 'history'"
                  :processed-siv-data="processedSivData"
                >
                </history>
              </div>
              <div
                class="tab-pane fade"
                :class="[{'in active' : tab === 'utac'}]"
              >
                <tech-control
                  v-if="tab === 'utac' && !isAnnulationCI && (ct.length > 0 || ctError)"
                  :ct="ct"
                  :ct-error="ctError"
                >
                </tech-control>
              </div>
              <div
                v-if="tab === 'utacGraph' && !isAnnulationCI"
                class="tab-pane fade"
                :class="[{'in active' : tab === 'utacGraph'}]"
              >
                <tech-control-graph
                  v-if="tab === 'utacGraph' && !ctError && ct.length > 0"
                  :ct="ct"
                >
                </tech-control-graph>
                <tech-control-graph-error
                  v-if="tab === 'utacGraph' && ctError"
                  :ct-error="ctError"
                >
                </tech-control-graph-error>
              </div>
              <div
                v-if="holder"
                class="tab-pane fade"
                :class="[{'in active' : tab === 'csa'}]"
              >
                <administrative-certificate
                  v-if="tab === 'csa'"
                  :processed-siv-data="processedSivData"
                  :url="url"
                  :base-url="baseUrl"
                >
                </administrative-certificate>
              </div>
              <div
                v-if="holder"
                class="tab-pane fade"
                :class="[{'in active' : tab === 'share-report'}]"
              >
                <share-report
                  v-if="tab === 'share-report'"
                  :url="url"
                >
                </share-report>
              </div>
              <div
                v-if="holder"
                class="tab-pane fade"
                :class="[{'in active' : $store.state.config.useCodePartageHistoVec || tab === 'share-code-partage'}]"
              >
                <share-code-partage
                  v-if="tab === 'share-code-partage'"
                  :report-id="$store.state.histovec.id"
                  :report-key="$store.state.histovec.key"
                >
                </share-code-partage>
              </div>

            </div>
          </div>
          <!-- tabs end -->
          <!-- debut trait de séparation -->
          <hr class="style1">
          <!-- fin trait de séparation -->
        </div>
      </div>
      <!-- row -->
    </div>
    <status
      :status="status"
      :type-immatriculation="typeImmatriculation"
    ></status>
  </section>
</template>

<script>
const loadView = (view) =>
  () => import(/* webpackChunkName: "report-part-[request]" */ `@/components/reportParts/${view}.vue`)

const Abstract = loadView('Abstract')
const TechChars = loadView('TechChars')
const License = loadView('License')
const Administrative = loadView('Administrative')
const History = loadView('History')
const TechControl = loadView('TechControl')
const TechControlGraph = loadView('TechControlGraph')
const TechControlGraphError = loadView('TechControlGraphError')
const AdministrativeCertificate = loadView('AdministrativeCertificate')
const ShareReport = loadView('ShareReport')
const ShareCodePartage = loadView('ShareCodePartage')

const Status = loadView('Status')

import siv from '../assets/js/siv'
import { DEFAULT_DATE_UPDATE } from '../constants/v'
import { getDepartement } from '../utils/codePostal'
import { hash } from '../utils/crypto'
import { urlSafeBase64Encode, base64Encode, urlSafeBase64Decode } from '../utils/encoding'

import imagePoigneeDeMain from '@/assets/img/poignee_de_main.jpg'


const statusFromCode = {
  'holder': {
    400: 'invalid',
    403: 'forbidden',
    404: 'notFound',
    429: 'tooManyRequests',
    502: 'unavailable',
    503: 'unavailable',
    504: 'unavailable',
  },
  'buyer': {
    400: 'invalidBuyer',
    403: 'forbidden',
    404: 'notFoundBuyer',
    429: 'tooManyRequests',
    502: 'unavailable',
    503: 'unavailable',
    504: 'unavailable'
  }
}

export default {
  components: {
    Abstract,
    TechChars,
    License,
    Administrative,
    History,
    TechControl,
    TechControlGraph,
    TechControlGraphError,
    AdministrativeCertificate,
    ShareReport,
    ShareCodePartage,
    Status,
  },
  data () {
    return {
      tab: 'abstract',
      default: 'non disponible',
      plaque: '',
      vin: '',
      conf: [],
      timeout: 10000,
      ratingModalTimer: 120000,
      DEFAULT_DATE_UPDATE,

      // images
      imagePoigneeDeMain,
    }
  },
  computed: {
    isAnnulationCI () {
      return (
        this.processedSivData &&
        this.processedSivData.administratif &&
        this.processedSivData.administratif.isAnnulationCI
      )
    },
    id () {
      return this.holder ? this.$route.params.id : this.$route.query.id
    },
    key () {
      return this.$route.params.key ? this.$route.params.key : this.$route.query.key
    },
    status () {
      if (this.$store.state.histovec.report) {
        this.showRatingModal()
        return 'ok'
      } else if (!this.holder && this.$route.query.key === undefined && this.$route.query.id !== undefined) {
        return 'invalidBuyer'
      } else if ((this.holder ? this.$route.params.id : this.$route.query.id) === undefined) {
        return 'invalid'
      } else if (this.$store.state.api.fetching.report ||
                this.$store.state.api.http.report === undefined ||
                this.$store.state.api.decrypted.report === undefined) {
          return 'wait'
      } else if (this.$store.state.api.http.report !== 200) {
        return this.holder ? statusFromCode.holder[this.$store.state.api.http.report] :
                             statusFromCode.buyer[this.$store.state.api.http.report]
      } else if (!this.$store.state.api.decrypted.report) {
        return this.holder ? 'decryptError' : 'decryptErrorBuyer'
      } else if (!this.$store.state.api.hit.report) {
        return this.holder ? 'notFound' : 'notFoundBuyer'
      }
      return 'error'
    },
    typeImmatriculation () {
      return this.$route.params.typeImmatriculation
    },
    processedSivData () {
      const sivData = this.$store.state.histovec.report && this.$store.state.histovec.report.sivData
      return siv.processSivData(sivData)
    },
    isDefaultDataDate () {
      return this.processedSivData.dateUpdate && this.processedSivData.dateUpdate === DEFAULT_DATE_UPDATE
    },
    holder () {
      return (this.$route.query.id === undefined) && ((this.$route.params.id !== undefined) || (this.$store.state.histovec.id !== undefined))
    },
    ct () {
      return this.$store.state.histovec.report.utacData.ct || []
    },
    ctError () {
      return this.$store.state.histovec.report.utacData.ctError
    },
    ctUpdateDate () {
      return this.$store.state.histovec.report.utacData.ctUpdateDate
    },
    baseUrl () {
      // return 'https://histovec.interieur.gouv.fr'
      return window.location.protocol + '//' + window.location.host
    },
    url () {

      const idParam = encodeURIComponent(this.$store.state.histovec.id || this.$route.params.id)
      const keyParam = encodeURIComponent(this.$store.state.histovec.key || this.key)
      const queryString = `?id=${idParam}&key=${keyParam}`

      // Add 'urlUnsafe' queryParameter to make new buyer urls (urlUnsafeBase64 encoded parameters) recognizable for frontend and backend
      // @todo remove 'urlUnsafe' queryParam while transition done (8th day of the next month after 'HistoVec code partage' feature deployement)
      return `${this.baseUrl}/histovec/report${queryString}&urlUnsafe=true`
    }
  },
  async created () {
    if (this.id) {
      // old share report link
      if (!this.$route.query.urlUnsafe && this.$route.query.id) {
        const id = base64Encode(urlSafeBase64Decode(this.id))
        this.$store.commit('updateId', id)
      } else {
        // @todo only keep this line while transition done (8th day of the next month after 'HistoVec code partage' feature deployement)
        this.$store.commit('updateId', this.id)
      }
    }

    if (this.key) {
      // old share report link
      if (!this.$route.query.urlUnsafe && this.$route.query.key) {
        const key = base64Encode(urlSafeBase64Decode(this.key))
        this.$store.commit('updateKey', key)
      } else {
        // @todo only keep this line while transition done (8th day of the next month after 'HistoVec code partage' feature deployement)
        this.$store.commit('updateKey', this.key)
      }
    }

    // Counting api requests from HistoVec frontend
    this.$store.dispatch('log', `${this.$route.path}/count`)

    await this.getReport()

    const sivData = this.$store.state.histovec.report && this.$store.state.histovec.report.sivData
    if (sivData) {
      await this.logVehicleData(sivData)  // @todo: remove and move to backend while backend will access decrypted report
    }

    const isAnnulationCI = (
      this.processedSivData &&
      this.processedSivData.administratif &&
      this.processedSivData.administratif.isAnnulationCI
    )

    if (isAnnulationCI) {
      this.tab = 'csa'
    }
  },
  methods: {
    async getReport () {
      const isReportCached = this.$store.getters.reportWithExpiry
      if (isReportCached) {
        await this.$store.dispatch('log',
          this.$route.path + '/' + (this.holder ? 'holder' : 'buyer') + '/cached')

        return
      }

      const canGetReport = this.$store.state.histovec.id && this.$store.state.histovec.key
      if (
        !canGetReport && (
          // rapport vendeur via formulaire de recherche, avec un paramètre manquant
          (this.holder && (!this.$route.params.key || !this.$route.params.id)) ||
          // rapport acheteur avec un paramètre manquant
          (!this.holder && (!this.$route.query.key || !this.$route.query.id))
        )
      ) {
        await this.$store.dispatch('log',
          this.$route.path + '/' + (this.holder ? 'holder' : 'buyer') + '/invalid')
        return
      }

      await this.$store.dispatch('getReport')
      await this.$store.dispatch('log',
        this.$route.path + '/' + (this.holder ? 'holder' : 'buyer') + '/' + this.status.replace(/Buyer$/, ''))
      return
    },
    showRatingModal () {
      const notShow = localStorage.getItem('notShow') === 'true'
      const evaluation = localStorage.getItem('evaluation') === 'true'

      if (!notShow && !evaluation) {
        setTimeout(() => {
          if (!this.$store.state.isRatingModalVisible && this.$route.path.match(/report/)) {
            this.$store.dispatch('toggleRatingModal')
          }
        }, this.ratingModalTimer)
      }
    },
    changeTab (tab) {
      if (['abstract', 'vehicle', 'holder', 'situation', 'history', 'utac', 'utacGraph', 'csa', 'share-report', 'share-code-partage'].includes(tab)) {
        this.tab = tab
      }
    },
    async logVehicleData ({
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
    }) {
      const departement = adr_code_postal_tit ? getDepartement(adr_code_postal_tit) : undefined
      const anonymizedReportId = urlSafeBase64Encode(await hash(this.id))

      const vehicleData = {
        age_certificat,
        couleur,
        CTEC_RLIB_ENERGIE,
        CTEC_RLIB_CATEGORIE,
        CTEC_RLIB_GENRE,
        date_premiere_immat,
        departement,
        is_apte_a_circuler,
        is_fni,
        marque,
        nom_commercial,
        nb_titulaires,
        tvv,
      }
      /* eslint-disable-next-line no-console */
      console.log('vehicleData', vehicleData)

      const bufferedStringifiedVehicleData = Buffer.from(JSON.stringify(vehicleData), 'utf8')
      const urlSafeBase64EncodedVehicleData = urlSafeBase64Encode(bufferedStringifiedVehicleData)

      await this.$store.dispatch('log', `${this.$route.path}/vehicle/${anonymizedReportId}/${urlSafeBase64EncodedVehicleData}`)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
