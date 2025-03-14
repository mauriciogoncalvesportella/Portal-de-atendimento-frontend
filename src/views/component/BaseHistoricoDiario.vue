<template>
  <v-card>
    <v-card-title>
      Rendimento Diário Equipe
    </v-card-title>
    <v-card-text>
      <v-row no-gutters>
        <v-col
          cols="12"
          md="4"
        >
          <user-selector
            v-model="users"
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
            Plotar
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
      </template>
    </v-card-text>
  </v-card>
</template>

<script>
  import UserSelector from './BaseUserSelector.vue'
  import BaseDatePicker from './BaseDatePicker.vue'

  export default {
    components: {
      UserSelector,
      BaseDatePicker,
    },
    data () {
      return {
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
            focusTarget: 'category',
          },
          avoidOverlappingGridLines: false,
          height: 720,
        },
      }
    },

    computed: {
      buttonDisabled () {
        return !(this.users && this.date)
      },
    },

    mounted () {
      this.refresh()
    },

    methods: {
      async refresh () {
        const serverTime = await this.$store.dispatch('getServerTime')
        this.date = this.$moment.unix(serverTime / 1000).format('YYYY-MM-DD')
      },

      async send () {
        if (this.users && this.date) {
          this.loading = true
          const projection = {}
          projection.users = [this.users]
          projection.dtinicio = `${this.date}T00:00:00`
          projection.dtfim = `${this.date}T23:59:59`
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
        }
      },

      transform () {
        this.chartDataLoaded = false
        this.chartData = []
        this.chartData.push(this.chartDataHead)
        const idCont = {}
        this.total.atendimentos = this.raw.length
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

        this.chartOptions.height = this.raw.length * 40 + 100
        this.checkDataLoaded = true
      },
    },
  }
</script>
