<template>
  <v-container
    id="chart-historico"
    fluid
  >
    <v-row>
      <v-col
        cols="12"
      >
        <v-card>
          <v-card-title>
            Histórico Diário
          </v-card-title>
          <v-card-text>
            <v-row no-gutters>
              <v-col
                v-if="$checkRole('atendimento.others')"
                cols="12"
                md="4"
              >
                <user-selector
                  ref="userSelector"
                  v-model="users"
                  prepend-icon="mdi-account-group"
                  :multiple="false"
                />
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col
                cols="12"
                md="4"
              >
                <base-date-picker
                  ref="datePicker"
                  v-model="date"
                  :range="false"
                  :valid-only-range="false"
                />
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col
                cols="12"
                md="4"
              >
                <v-btn
                  tile
                  color="primary"
                  :loading="loading"
                  :disabled="buttonDisabled"
                  @click="send"
                >
                  <v-icon class="mr-1">
                    mdi-chart-bar
                  </v-icon>
                  Enviar
                </v-btn>
              </v-col>
            </v-row>
            <template
              v-if="checkDataLoaded"
            >
              <v-row
                class="pl-3 pt-3"
              >
                <v-card
                  class="d-inline"
                >
                  <v-card-title>
                    Atendimentos
                  </v-card-title>
                  <v-card-text>
                    {{ total.atendimentos }}
                  </v-card-text>
                </v-card>
                <v-card
                  class="d-inline ml-2"
                >
                  <v-card-title>
                    Tempo
                  </v-card-title>
                  <v-card-text>
                    {{ total.tempo | sec2date }}
                  </v-card-text>
                </v-card>
              </v-row>
              <GChart
                class="mt-3"
                :settings="{ 'packages':['timeline'] }"
                type="Timeline"
                :data="chartData"
                :options="chartOptions"
              />
              <!--vue-apex-charts
                width="500"
                type="bar"
                :options="options"
                :series="series"
              /-->
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import UserSelector from '@/views/component/BaseUserSelector.vue'
  import BaseDatePicker from '@/views/component/BaseDatePicker.vue'

  export default {
    components: {
      UserSelector,
      BaseDatePicker,
    },
    props: {
      props: {
        type: Object,
        default: () => { return { leo: 10 } },
      },
    },
    data () {
      return {
        serverTime: -1,
        total: {
          atendimentos: 0,
          tempo: '',
        },
        date: null,
        users: null,
        loading: false,
        checkDataLoaded: false,
        raw: [],
        chartData: [],
        chartDataHead: [
          { type: 'string', id: 'id' },
          { type: 'string', id: 'Name' },
          { type: 'string', role: 'tooltip', p: { html: true } },
          { type: 'date', id: 'From Date' },
          { type: 'date', id: 'To Date' },
        ],
        chartOptions: {
          timeline: {
            title: 'Employees History',
            subtitle: 'Time spend at company',
            showRowLabels: false,
            tooltip: { isHtml: true },
            barLabelStyle: {
              fontSize: 9,
            },
            focusTarget: 'category',
          },
          avoidOverlappingGridLines: false,
          height: 500,
        },
        checkUpdated: false,
        options: {
          chart: {
            id: 'vuechart-example',
          },
          xaxis: {
            categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998],
          },
        },
        series: [
          {
            name: 'series-1',
            data: [30, 40, 45, 50, 49, 60, 70, 91],
          },
        ],
      }
    },

    computed: {
      buttonDisabled () {
        return !((this.users || !this.$checkRole('atendimento.others')) && this.date)
      },
    },

    watch: {
      props (val) {
        if (val.cduser) {
          this.updateCdUser(true)
        }
      },
    },

    mounted () {
      this.updateCdUser(false)
    },

    methods: {
      async updateCdUser (fromRouter) {
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
          } else {
            this.transform()
          }
        } finally {
          this.loading = false
        }
      },

      transform () {
        this.chartDataLoaded = false
        this.chartData = []
        this.chartData.push(this.chartDataHead)
        const idCont = {}
        this.total.atendimentos = this.raw.length
        this.raw = this.raw.filter(item => item.dtfim != null)
        this.total.tempo = this.$calculate(
          this.raw.map(item => {
            return {
              dtinicio: new Date(item.dtinicio).getTime(),
              dtfim: new Date(item.dtfim).getTime(),
            }
          }),
        )

        this.raw.forEach((item, i) => {
          if (item.dtfim) {
            const t1 = this.$moment(item.dtinicio).toDate()
            const t2 = this.$moment(item.dtfim).toDate()
            const t = t2.getTime() - t1.getTime()
            const idfantasia = item.chave.idfantasia
            idCont[idfantasia] = idCont[idfantasia] || 0
            idCont[idfantasia]++
            this.chartData.push([
              `${i}`,
              `${item.chave.idfantasia}${idCont[idfantasia] > 1 ? ' (' + idCont[idfantasia] + ')' : ''}`,
              `
              <div
                style="width: 100px"
                class="pa-2"
              >
                <div style="display: block">
                  Início ${this.$options.filters.str2date(t1)}
                </div>
                <div style="display: block">
                  Fim ${this.$options.filters.str2date(t2)}
                </div>
                <div style="display: block">
                  Total ${this.$options.filters.sec2date(t)}
                </div>
              <div>
              `,
              t1,
              t2,
            ])
          }
        })
        // this.chartOptions.height = this.raw.length * 35 + 32
        this.checkDataLoaded = true
      },
    },
  }
</script>
