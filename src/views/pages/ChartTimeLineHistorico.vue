<template>
  <v-row
    class="fill-height"
    no-gutters
  >
    <v-col
      cols="12"
    >
      <span class="text-uppercase text-h3 font-weight-light text--secondary">
        Gráfico Histórico do dia
      </span>
      <v-divider />
    </v-col>
    <v-col
      cols="12"
      class="fill-height"
    >
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <div
            class="d-flex align-center fill-height"
            style="max-width: 800px"
          >
            <user-selector
              v-if="$checkRole('atendimento.others')"
              ref="userSelector"
              v-model="users"
              class="mr-2"
              prepend-icon="mdi-account-group"
              :all-option="true"
              :multiple="false"
            />

            <base-date-picker
              ref="datePicker"
              v-model="date"
              class="mr-2"
              :range="false"
              :valid-only-range="false"
            />

            <v-btn
              tile
              color="primary"
              class="ml-2"
              :loading="loading"
              :disabled="buttonDisabled"
              @click="send"
            >
              <v-icon class="mr-1">
                mdi-chart-bar
              </v-icon>
              Enviar
            </v-btn>
          </div>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <div
            class="d-flex align-center justify-center justify-md-end"
          >
            <v-card
              class="d-inline"
              width="120"
            >
              <v-card-title>
                Atendimentos
              </v-card-title>
              <v-card-text>
                {{ dataLoaded ? (total.atendimentos) : '...' }}
              </v-card-text>
            </v-card>
            <v-card
              class="d-inline ml-2"
              width="120"
            >
              <v-card-title>
                Tempo
              </v-card-title>
              <v-card-text>
                {{ total.tempo | sec2date }}
              </v-card-text>
            </v-card>
            <v-card
              class="d-inline ml-2"
              width="120"
            >
              <v-card-title>
                Ausente
              </v-card-title>
              <v-card-text>
                {{ total.ausente| sec2date }}
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>
      <v-divider />
      <GChart
        v-if="dataLoaded"
        ref="chartTimeLine"
        :key="chartKey"
        class="d-flex align-stretch mt-3"
        style="height: 2000px"
        :settings="{ 'packages':['timeline'] }"
        type="Timeline"
        :data="chartData"
        :options="chartOptions"
        :events="chartEvents"
        @ready="onChartReady"
      />
    </v-col>
  </v-row>
</template>

<script>
  import UserSelector from '@/views/component/BaseUserSelector.vue'
  import BaseDatePicker from '@/views/component/BaseDatePicker.vue'
  import { mapGetters } from 'vuex'

  export default {
    components: {
      UserSelector,
      BaseDatePicker,
    },
    props: {
      props: {
        type: Object,
        default: () => { return {} },
      },
      componentId: {
        type: String,
        default: null,
      },
    },
    data () {
      return {
        chartKey: 0,
        serverTime: -1,
        total: {
          atendimentos: 0,
          tempo: '',
          ausente: 0,
        },
        chart: null,
        date: null,
        users: null,
        loading: false,
        dataLoaded: false,
        raw: [],
        atendimentoMap: {},
        chartData: [],
        chartRow2Cdatendimento: {},
        chartDataHead: [
          { type: 'string', id: 'id' },
          { type: 'string', id: 'Name' },
          { type: 'string', role: 'tooltip', p: { html: true } },
          { type: 'date', id: 'Start' },
          { type: 'date', id: 'End' },
        ],
        chartOptions: {
          timeline: {
            showRowLabels: true,
            tooltip: { isHtml: true },
            barLabelStyle: {
              fontSize: 9,
              textAlign: 'left',
            },
          },
          avoidOverlappingGridLines: false,
          height: '100%',
        },
        chartEvents: {
          click: () => {
          },
          select: () => {
            const index = this.chart.getSelection()[0].row
            const row = this.chartData[index + 1]
            if (row[0] !== 'AUSENTE') {
              const cdatendimento = parseInt(row[1])
              this.openTheTicket(this.atendimentoMap[cdatendimento])
            }
          },
        },
      }
    },

    computed: {
      ...mapGetters(['chaveMap']),
      buttonDisabled () {
        return !((this.users || !this.$checkRole('atendimento.others')) && this.date)
      },
    },

    watch: {
      props (val) {
        if (val.cduser !== this.users || val.date !== this.date) {
          this.dataLoaded = false
          this.updateCdUser(true)
        }
      },
      $route (val) {
        if (val.name === 'chart-historico') {
          this.chartKey++
        }
      },
    },

    mounted () {
      this.updateCdUser()
    },

    methods: {
      onChartReady (chart) {
        this.chart = chart
      },

      async updateCdUser () {
        if (this.props.cduser && this.props.date) {
          if (this.$checkRole('atendimento.others')) {
            this.$refs.userSelector.newValue(this.props.cduser)
          }
          this.$refs.datePicker.newValue(this.props.date)
          this.users = this.props.cduser
          this.date = this.props.date
          this.chartData = []
          await this.refresh()
          await this.send()
        }
      },

      async refresh () {
        this.serverTime = await this.$store.dispatch('getServerTime')
        this.date = this.date || this.$moment.unix(this.serverTime / 1000).format('YYYY-MM-DD')
      },

      async send () {
        await this.$store.dispatch('allChaves', { mutex: false, force: false })
        this.loading = true
        const projection = {}
        projection.users = [this.users]
        projection.dtinicio = `${this.date}T00:00:00`
        projection.dtfim = `${this.date}T23:59:59`
        projection.notNull = ['dtfim']

        try {
          this.raw = await this.$store.dispatch('allAtendimentosAdmin', projection)
          if (this.raw.length === 0) {
            this.$notifier({ content: 'Não há atendimentos', color: 'warning' })
            this.dataLoaded = false
            this.total = {
              atendimentos: 0,
              tempo: 0,
              ausente: 0,
            }
          } else {
            this.transform()
          }
        } finally {
          this.loading = false
        }
      },

      addRow (id, name, init, end, user) {
        const idx = this.chartData?.length || 0
        this.chartData.push([
          `${id}`,
          `${name}`,
          `
          <div
            style="width: 100px"
            class="pa-2"
          >
            <div style="display: block; width: 90px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
              ${user}
            </div>
            <div style="display: block">
              Início ${this.$options.filters.str2date(init)}
            </div>
            <div style="display: block">
              Fim ${this.$options.filters.str2date(end)}
            </div>
            <div style="display: block">
              total ${this.$options.filters.sec2date(end - init)}
            </div>
          <div>
          `,
          init,
          end,
        ])
        return idx
      },

      async transform () {
        this.chartDataLoaded = false
        this.chartData = []
        this.chartData.push(this.chartDataHead)
        this.total.atendimentos = this.raw.length
        this.raw = this.raw.filter(item => item.dtfim != null)
        this.total.tempo = 0
        this.total.ausente = 0
        let atendimentosArray = []
        const idfantasiaTotal = {}

        this.raw.forEach((atendimento, i) => {
          this.atendimentoMap[atendimento.cd] = atendimento
          if (atendimento.dtfim != null && atendimento.jslista != null) {
            for (const item of atendimento.jslista) {
              if (item.dtfim != null) {
                const dtinicio = this.$moment(item.dtinicio).toDate().getTime()
                const dtfim = this.$moment(item.dtfim).toDate().getTime()
                const t = dtfim - dtinicio
                const idfantasia = atendimento.chave.idfantasia
                this.total.tempo += t
                atendimentosArray.push({ dtinicio, dtfim })
                idfantasiaTotal[idfantasia] = idfantasiaTotal[idfantasia] || 0
                idfantasiaTotal[idfantasia] += t
                this.addRow(idfantasia, atendimento.cd, dtinicio, dtfim, atendimento.user.idlogin)
              }
            }
          }
        })
        // this.chartData.sort((a, b) => a[3] - b[3])
        this.chartData = this.chartData.map(it => {
          const idfantasia = it[0]
          if (idfantasia != null) {
            const time = this.$options.filters.sec2date(idfantasiaTotal[idfantasia])
            it[0] = `${idfantasia} - ${time}`
          }
          return it
        })

        // atendimentosArray = atendimentosArray.sort((a, b) => a.t1 - b.t1)
        atendimentosArray = this.$condense(atendimentosArray)
        let dtinicio = this.$moment().startOf('day').hours(8).toDate().getTime()
        let dtfim = null
        for (const item of atendimentosArray) {
          dtfim = item.dtinicio

          if (dtinicio != null && dtfim - dtinicio > 0) {
            this.total.ausente += dtfim - dtinicio
            this.addRow('AUSENTE', '', dtinicio, dtfim, 'ausente')
          }
          dtinicio = item.dtfim
        }

        // this.chartData.sort((a, b) => a[3] - b[3])
        this.total.ausente -= 4.32e6
        this.dataLoaded = true
      },

      async openTheTicket (atendimento) {
        const idfantasia = this.chaveMap[atendimento._cdchave].idfantasia
        const cdticket = atendimento._cdticket
        await this.$router.push({
          name: 'the-ticket',
          params: {
            cd: cdticket,
            label: `${cdticket} - ${idfantasia}`,
          },
        })
      },
    },
  }
</script>
