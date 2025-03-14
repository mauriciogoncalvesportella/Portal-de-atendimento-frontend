<template>
  <v-row
    align="start"
    dense
  >
    <v-col
      cols="12"
    >
      <div
        class="d-flex justify-space-between"
      >
        <span
          class="text-uppercase text-h3 font-weight-light text--secondary"
        >
          {{ nomeCliente }}
        </span>
        <div>
          <v-chip
            v-if="situacao"
            label
            class="mr-2"
          >
            <v-icon
              size="25"
              left
            >
              {{ situacao.idicon }}
            </v-icon>
            {{ situacao.nmsituacao }}
          </v-chip>

          <v-chip
            label
          >
            <div
              class="mr-1"
            >
              Responsável
            </div>
            <user-initials-avatar
              :cduser="ticket._cdresponsavel"
            />
          </v-chip>
        </div>
      </div>
      <v-divider
        class="mt-2 mb-3"
      />
      <v-row>
        <v-col
          cols="12"
          lg="4"
        >
          <v-btn-toggle
            v-model="ticket.fgticket"
            color="primary"
            mandatory
            dense
            group
          >
            <v-btn
              :value="0"
              :disabled="ticket.fgticket == null"
            >
              Ticket Público
            </v-btn>
            <v-btn
              :value="1"
              :disabled="ticket.fgticket == null"
            >
              Ticket Interno
            </v-btn>
          </v-btn-toggle>

          <div
            class="d-flex mt-1 mb-2"
          >
            <solicitante-selector
              ref="solicitanteSelector"
              v-model="ticket.solicitante"
              :disabled="loading"
              :rules="[RREQUIRED]"
              :cdchave="ticket.atendimento._cdchave"
              class="pr-2"
            />
            <novo-solicitante-pop-over
              :cdchave="ticket.atendimento._cdchave"
              :disabled="loading"
              @afterAdd="afterAddSolicitante"
            />
          </div>
          <motivo-selector
            ref="motivoSelector"
            v-model="ticket.atendimento._cdmotivo"
            :rules="[RREQUIRED]"
            :disabled="ticket.atendimento.cd == null"
          />
          <v-autocomplete
            v-model="ticket.cdsistema"
            :items="[
              { value: 0, text: 'Commerce' },
              { value: 1, text: 'Coletas' },
              { value: 2, text: 'Tablet' },
            ]"
            :disabled="loading"
            class="mb-2"
            hide-details="auto"
            label="Sistema"
            prepend-inner-icon="mdi-database-search"
            filled
          />
          <urgencia-selector
            ref="urgenciaSelector"
            v-model="ticket._cdurgencia"
            :rules="[RREQUIRED]"
            :disabled="loading"
          />
          <user-selector
            v-model="ticketUsers"
            :force="userSelectForceArray"
            :disabled="loading"
          />
          <div
            class="d-flex flex-row-reverse"
          >
            <v-btn
              class="ml-2"
              tile
              depressed
              color="primary"
              :height="53"
              :loading="saveLoading"
              :disabled="loading"
              @click="save"
            >
              Salvar Ticket
            </v-btn>
          </div>
        </v-col>
        <v-divider
          v-if="$vuetify.breakpoint.lgAndUp"
          vertical
        />
        <v-col
          class="mr-lg-4"
          :style="cdacao == null ? 'margin: 20px; border: 3px solid #BDBDBD; border-style: dashed; background-color: #EEEEEE': ''"
        >
          <div
            v-if="(loading || loadingInitAcao) && !loadingCancelAcao"
            class="d-flex justify-center align-center"
          >
            <v-progress-linear
              indeterminate
              height="5"
            />
          </div>
          <div
            v-else
          >
            <v-btn
              v-if="cdacao == null && !loadingInitAcao"
              text
              block
              class="primary my-auto"
              :height="53"
              :loading="loadingInitAcao"
              :disabled="loading"
              @click="initAcao"
            >
              Criar Ação
            </v-btn>
          </div>
          <v-slide-y-transition>
            <nova-acao
              v-if="cdacao != null"
              ref="novaAcao"
              class="mt-1"
              :cdticket="cdticket"
              :cdacao="cdacao"
              @after-add="refresh(true); panels=[]"
            >
              <div
                class="d-flex justify-end align-center"
              >
                <v-hover
                  #default="{ hover }"
                >
                  <v-btn
                    dark
                    tile
                    depressed
                    color="red"
                    :loading="loadingCancelAcao"
                    @click="cancelAcao"
                  >
                    <v-icon
                      :left="hover"
                    >
                      mdi-close-circle
                    </v-icon>
                    {{ (hover || loadingCancelAcao) ? 'Cancelar Ação' : null }}
                  </v-btn>
                </v-hover>
              </div>
            </nova-acao>
          </v-slide-y-transition>
        </v-col>
      </v-row>
      <v-divider
        class="mt-3"
      />
    </v-col>
    <v-col
      cols="12"
    >
      <v-skeleton-loader
        v-if="loadingNovaAcao"
        type="list-item-avatar"
        class="my-2"
      />
      <v-expansion-panels
        v-if="acoes != null"
        v-model="panels"
        class="mt-1"
        multiple
        focusable
      >
        <template
          v-for="(currAcao, i) in acoes"
        >
          <v-expansion-panel
            v-if="currAcao.fgstatus === 1"
            :id="`expansion-${i}`"
            :key="`expansion-${i}`"
          >
            <v-expansion-panel-header
              v-scroll-to="{ el: `#expansion-${i}`, offset: -70 }"
            >
              <div
                style="max-width: 32px"
              >
                <user-initials-avatar
                  :cduser="currAcao._cduser"
                />
              </div>
              <span
                class="ml-2 text-uppercase text-h4 font-weight-light"
              >
                {{ currAcao.cd }}
                -
                {{ currAcao.nmassunto }}
              </span>
              <span
                class="ml-auto text-right"
              >
                <tempo-chip-color
                  v-if="currAcao.cdservico"
                  :sec="parseInt(currAcao.cdservico.ntotal)"
                  label
                  icon
                />
                <v-chip
                  label
                  small
                  class="mx-2 ml-2"
                >
                  <v-icon
                    left
                    small
                  >
                    mdi-calendar
                  </v-icon>
                  {{ currAcao.dtcriacao | str2datetime('DD/MM/YYYY HH:mm:ss') }}
                </v-chip>
              </span>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <div
                class="mt-2"
                v-html="currAcao.mmdesc"
              />
              <template
                v-if="currAcao.jsanexos.length > 0"
              >
                <v-divider
                  class="my-2"
                />
                <v-chip
                  v-for="(file, ii) in currAcao.jsanexos"
                  :key="`${file.name}-${ii}`"
                  class="ma-1"
                >
                  <span
                    class="text-truncate mr-1"
                    style="max-width: 150px"
                  >
                    {{ file.name }}
                  </span>
                  ({{ file.size | bytes2human }})
                  <v-btn
                    icon
                    @click="downloadAcaoFile(currAcao.cd, file.name)"
                  >
                    <v-icon>
                      mdi-download
                    </v-icon>
                  </v-btn>
                </v-chip>
              </template>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </template>
      </v-expansion-panels>
    </v-col>
  </v-row>
</template>
<script>
  // import SituacaoSelector from '@/views/component/BaseSituacaoSelector.vue'
  import NovaAcao from '@/views/component/BaseNovaAcao.vue'
  import UrgenciaSelector from '@/views/component/BaseUrgenciaSelector.vue'
  import SolicitanteSelector from '@/views/component/BaseSolicitanteSelector.vue'
  import NovoSolicitantePopOver from '@/views/component/BaseNovoSolicitantePopOver.vue'
  import UserSelector from '@/views/component/BaseUserSelector.vue'
  import MotivoSelector from '@/views/component/BaseMotivoSelector.vue'
  import UserInitialsAvatar from '@/views/component/BaseUserInitialsAvatar'
  import TempoChipColor from '@/views/component/TempoChipColor.vue'
  import { mapGetters } from 'vuex'
  var fileDownload = require('js-file-download')

  export default {
    components: {
      NovaAcao,
      UserInitialsAvatar,
      UrgenciaSelector,
      SolicitanteSelector,
      NovoSolicitantePopOver,
      UserSelector,
      MotivoSelector,
      TempoChipColor,
    },
    props: {
      props: {
        type: Object,
        default: () => {
          return {
            cd: -1,
          }
        },
      },
    },
    data () {
      return {
        panels: [0],
        acaoEnabled: false,
        dialog: false,
        saveLoading: false,
        cdsituacaoStart: null,
        ticketUsers: [],
        userSelectForceArray: [],
        cdticket: null,
        cdacao: null,
        loadingNovaAcao: false,
        loadingInitAcao: false,
        loadingCancelAcao: false,
        ticket: {
          fgticket: null,
          atendimento: {
            cd: null,
            _cdchave: null,
            _cdmotivo: null,
          },
          _cdresponsavel: null,
          _cdsituacao: null,
          solicitante: null,
          cdchave: null,
        },
        acao: {
          nmassunto: '',
          mmdesc: '',
          files: [],
        },
        acoes: null,
        loading: false,
        userMap: {},
      }
    },
    computed: {
      ...mapGetters(['screen', 'user', 'chaveMap', 'situacaoMap']),

      nomeCliente () {
        const cdchave = this.ticket?.atendimento?._cdchave
        if (!cdchave || !this.chaveMap) {
          return 'Carregando...'
        }

        return this.chaveMap[cdchave].idfantasia
      },

      situacao () {
        const cd = this.ticket?._cdsituacao
        if (!cd || !this.situacaoMap) {
          return null
        }

        return this.situacaoMap[cd]
      },
    },

    watch: {
      $route (route) {
        if (route.params.cd === this.props.cd) {
          if (this.cdacao != null) {
            this.$refs.novaAcao.refresh(true)
            // this.$store.dispatch('startServicoAcao', this.cdacao)
          } else {
            // this.$store.dispatch('stopServicoAcao')
          }
        }
      },
    },

    created () {
      this.cdticket = parseInt(this.props.cd)
      this.refresh()
    },

    methods: {
      afterAddSolicitante (cd) {
        this.$refs.solicitanteSelector.newValue(parseInt(cd))
      },

      async cancelAcao () {
        if (this.cdacao) {
          const res = await this.$confirm(
            'Tempo de serviço vinculado à Ação também será excluido, você deseja excluir?',
            {
              title: 'Aviso',
              buttonTrueText: 'Sim',
              buttonFalseText: 'Cancelar',
            },
          )
          if (res) {
            try {
              this.loadingCancelAcao = true
              await this.$store.dispatch('deleteAcao', this.cdacao)
              await this.refresh(true)
              this.cdacao = null
            } finally {
              this.loadingCancelAcao = false
            }
          }
        }
      },

      async initAcao () {
        if (!this.cdacao) {
          try {
            this.loadingInitAcao = true
            const acao = await this.$store.dispatch('createAcao', {
              cdticket: this.cdticket,
              fgstatus: 0,
            })
            await this.refresh(true)
            await this.$store.dispatch('stopAtendimento', true)
            this.cdacao = acao.cd
          } finally {
            this.loadingInitAcao = false
          }
        }
      },

      async refresh (force) {
        this.loading = true
        if (force) {
          this.cdacao = null
        }
        this.userMap = await this.$store.dispatch('userMap', { mutex: false, force })
        await this.$store.dispatch('allChaves', { mutex: false, force: false })
        await this.$store.dispatch('allSituacao')
        this.ticket = await this.$store.dispatch('getTicket', { cd: this.cdticket, force })
        this.cdsituacaoStart = this.ticket._cdsituacao

        this.ticketUsers = (await this.$store.dispatch('ticketUserMap', {
          cdticketArray: [parseInt(this.cdticket)],
          mutex: false,
          force: force,
        }))[this.cdticket]

        this.userSelectForceArray = [this.ticket.atendimento._cduser]
        if (!this.$checkRole('tickets.others.rewrite')) {
          this.userSelectForceArray = [...this.ticketUsers]
        }

        this.acoes = await this.$store.dispatch('getAcaoByCdticket', { force, cdticket: this.cdticket })
        const currAcao = this.acoes.find(curr => curr.fgstatus === 0 && curr._cduser === this.user.cd)
        if (currAcao) {
          this.cdacao = currAcao.cd
          // await this.$store.dispatch('startServicoAcao', this.cdacao)
        }
        /*
        else {
          await this.$store.dispatch('stopServicoAcao')
        }
        */

        this.ticket.solicitante = {
          cd: this.ticket._cdsolicitante,
        }
        this.loading = false
      },

      async downloadAcaoFile (cdacao, nmfile) {
        const file = await this.$store.dispatch('downloadAcaoFile', {
          cdticket: parseInt(this.cdticket),
          cdacao,
          nmfile,
        })
        fileDownload(file, nmfile)
      },

      async addEmptyAcao () {
        this.loadingAcao = true
      },

      async save () {
        this.loadingSkeleton = true
        this.saveLoading = true
        const data = {
          emitAcao: true,
          cd: parseInt(this.cdticket),
          fgticket: this.ticket.fgticket,
          cdsolicitante: this.ticket.solicitante.cd,
          cdurgencia: this.ticket._cdurgencia,
          cdsistema: this.ticket.cdsistema,
          users: this.ticketUsers,
        }
        try {
          this.loadingNovaAcao = true
          await this.$store.dispatch('upsertTicket', data)
        } finally {
          await this.refresh(true)
          this.loadingNovaAcao = false
          this.saveLoading = false
          this.loadingSkeleton = false
        }
      },
    },
  }
</script>
