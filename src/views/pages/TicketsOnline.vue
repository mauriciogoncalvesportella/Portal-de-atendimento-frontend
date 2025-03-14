<template>
  <v-row
    no-gutters
    class="fill-height"
  >
    <v-col
      cols="12"
      sm="8"
      md="4"
      lg="3"
      xl="2"
      class="mx-auto"
    >
      <div
        class="d-flex-column"
      >
        <novo-atendimento-modal
          ref="NovoAtendimentoModal"
          class="mb-3"
          @after-add="nextNewAtendimento"
        />
        <v-sheet
          class="d-flex my-2"
          color="rgb(0, 0, 0, 0)"
        >
          <v-chip
            class="flex-fill justify-center mr-1"
            @click="refresh(true)"
          >
            <v-icon
              left
            >
              mdi-face-agent
            </v-icon>
            {{ atendimentos.length }}
          </v-chip>
          <v-chip
            class="flex-fill justify-center ml-1"
          >
            <v-icon
              left
            >
              mdi-clock
            </v-icon>
            {{ totalTimeWorked | sec2date }}
          </v-chip>
        </v-sheet>
        <div
          v-for="(tab, i) in atendimentosOnline"
          :key="`tab-${i}`"
          class="d-flex"
        >
          <v-btn
            v-if="tab.cd != null"
            :class="`d-flex justify-space-between ${tabSelected === i ? 'primary lighten-2' : ''}`"
            block
            tile
            depressed
            :disabled="loading && !tab.loading"
            @click="vtabChangeTab(i)"
          >
            <span
              :class="`text-truncate text-left ${tabSelected === i ? 'white--text font-weight-bold' : ''}`"
              style="width: 135px"
            >
              {{ tab.chave.idfantasia }}
            </span>
            <tempo-chip-color
              :sec="tab.dtstatus"
            />
            <v-icon
              v-if="!tab.loading"
              :color="tabSelected === i ? 'white' : 'grey'"
              right
            >
              {{ tab.origem.idicon }}
            </v-icon>
            <v-progress-circular
              v-else
              class="ml-1"
              indeterminate
              :size="20"
              :width="3"
            />
          </v-btn>
          <v-btn
            v-else
            :key="`tab-${i}`"
            :class="`d-flex justify-center ${tabSelected === i ? 'primary lighten-3' : ''}`"
            block
            tile
            depressed
            text
            :disabled="loading && !tab.loading"
            @click="vtabChangeTab(i)"
          >
            <v-icon
              v-if="!tab.loading"
            >
              mdi-sleep
            </v-icon>
            <v-progress-circular
              v-else
              class="ml-1"
              indeterminate
              :size="25"
              :width="3"
            />
          </v-btn>
        </div>
      </div>
    </v-col>
    <v-col
      cols="12"
      md="8"
      lg="9"
      xl="10"
      class="mt-5 mt-md-0"
    >
      <novo-ticket
        ref="novoTicket"
        :cdatendimento="cdatendimento"
        :atendimentos="atendimentosOnline"
        :loading="loading"
        @afterSendTicket="afterSendTicket"
      />
    </v-col>
  </v-row>
</template>

<script>
  import NovoTicket from '@/views/component/BaseNovoTicket.vue'
  import NovoAtendimentoModal from '@/views/component/NovoAtendimentoModal.vue'
  import TempoChipColor from '@/views/component/TempoChipColor.vue'

  export default {
    components: {
      NovoTicket,
      NovoAtendimentoModal,
      TempoChipColor,
    },

    props: {
      props: {
        type: Object,
        default: () => {},
      },
    },

    data () {
      return {
        toggle_exclusive: 0,
        firstChangeTabSelected: false,
        refreshed: false,
        cdatendimento: null,
        atendimentos: [],
        atendimentosOffline: [],
        atendimentosOnline: [],
        tabSelected: 0,
        serverTime: 0,
        interval: null,
        totalTimeWorked: 0,
        loading: false,
        tempTabSelected: null,
      }
    },

    computed: {
      tabAwayIndex () {
        return (this.atendimentosOnline?.length - 1) ?? 0
      },
    },

    watch: {
      $route (route) {
        if (route.name === 'atendimento' && this.tabSelected !== this.tabAwayIndex) {
          this.$store.dispatch('stopServicoAcao')
        }
      },
      props (val) {
        if (val.cdfila != null) {
          this.openAtendimentoModalcdfila()
        }
      },
    },

    mounted () {
      this.init()
      this.interval = setInterval(() => {
        this.serverTime += 1e3
        if (this.tabSelected != null && this.tabSelected !== this.atendimentosOnline.length - 1) {
          this.totalTimeWorked += 1e3
          this.atendimentosOnline[this.tabSelected].dtstatus += 1e3
        }
      }, 1e3)

      this.$store.subscribeAction(({ type, payload }) => {
        if (type === 'stopAtendimento' && payload) {
          this.changeTab(this.tabAwayIndex)
        }
      })

      if (this.props.cdfila != null) {
        this.openAtendimentoModalcdfila()
      }

      this.$socketio.socket.on('refreshAtendimento', idfantasia => {
        this.refresh(true)
        this.$notifier({
          content: `3CX: Novo atendimento para "${idfantasia}"`,
          color: 'primary',
          valign: 'top',
        })
      })
    },

    destroyed () {
      this.$socketio.socket.removeAllListeners('refreshAtendimento')
      clearInterval(this.interval)
    },

    methods: {
      openAtendimentoModalcdfila () {
        const id = this.$store.state.tabControl?.tabOpen?.atendimento
        if (id) {
          this.$refs.NovoAtendimentoModal.setCdFila(this.props.cdfila)
          this.$nextTick(() => {
            this.$store.commit('UPDATE_TAB_PROPS', {
              id,
              props: {},
            })
          })
        }
      },

      async init () {
        await this.refresh(true)
        await this.changeTab(this.tempTabSelected, true)
        if (this.tabSelected !== this.tabAwayIndex) {
          await this.$store.dispatch('stopServicoAcao')
        }
      },

      async afterSendTicket () {
        this.atendimentosOnline.splice(this.tabSelected, 1)
        this.tabSelected = this.tabAwayIndex
        await this.changeTab(this.tabAwayIndex)

        if (this.atendimentosOnline.length === 1) {
          this.loading = true
          await this.$store.dispatch('NovoTicket/clear')
          this.loading = false
        }
      },

      async vtabChangeTab (index) {
        if (index != null && this.tabSelected !== index) {
          this.loading = true
          this.atendimentosOnline[index].loading = true
          await this.changeTab(index)
          this.loading = false
          this.atendimentosOnline[index].loading = false
        }
      },

      async changeTab (index, firstChange = false) {
        if (index != null && this.atendimentosOnline[index]) {
          this.tabSelected = index
          if (index !== this.atendimentosOnline.length - 1) {
            this.cdatendimento = this.atendimentosOnline[index].cd
          } else {
            this.cdatendimento = null
          }

          if (!firstChange) {
            await this.stopStart(this.tabSelected)
          }

          if (this.tabSelected !== this.tabAwayIndex) {
            await this.$store.dispatch('stopServicoAcao')
          }

          const novoTicketTab = (index === this.tabAwayIndex) ? null : this.tabSelected
          await this.$refs.novoTicket.changeState(novoTicketTab)
        }
      },

      async stopStart (index) {
        const dto = {}
        if (index !== this.tabAwayIndex) {
          dto.cdatendimento = this.atendimentosOnline[index].cd
        } else {
          dto.cdatendimento = -1
        }
        await this.$store.dispatch('atendimentoStopStart', dto)
      },

      async nextNewAtendimento (cdatendimento) {
        if (cdatendimento !== null) {
          await this.refresh(true)
          await this.changeTab(this.tabAwayIndex - 1)
        }
      },

      async refresh (force = false) {
        try {
          this.loading = true
          this.atendimentos = await this.$store.dispatch('allAtendimentos', force)
          this.serverTime = await this.$store.dispatch('getServerTime')
          this.totalTimeWorked = 0
          this.tempTabSelected = null

          const atendimentosOnline = this.atendimentos
            .filter(it => it.dtfim == null)
            .map((it, i) => {
              const sumAtendimentos = this.$sumAtendimentos(it.jslista, this.serverTime)
              if (sumAtendimentos.isIndex) {
                this.tempTabSelected = i
              }
              return {
                ...it,
                dtinicio: new Date(it.dtinicio).getTime(),
                dtfim: this.serverTime,
                dtstatus: sumAtendimentos.sum,
                loading: false,
              }
            })

          const tabAwayIndex = atendimentosOnline.length
          this.tempTabSelected = (this.tempTabSelected != null) ? this.tempTabSelected : tabAwayIndex

          this.atendimentosOnline = []
          Object.assign(this.atendimentosOnline, atendimentosOnline)
          this.atendimentosOnline.push({ cd: null, isLoading: false })

          this.atendimentos = this.atendimentos.map(it => {
            const dtinicio = new Date(it.dtinicio).getTime()
            const dtfim = (it.dtfim) ? new Date(it.dtfim).getTime() : this.serverTime
            this.totalTimeWorked += this.$sumAtendimentos(it.jslista, this.serverTime).sum
            return {
              ...it,
              dtinicio: dtinicio,
              dtfim: dtfim,
              dtstatus: dtfim - dtinicio,
            }
          })
        } finally {
          this.loading = false
        }
      },
    },
  }
</script>
