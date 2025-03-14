<template>
  <v-card>
    <v-card-title>
      Rendimento Diário Equipe
    </v-card-title>
    <v-card-text>
      <v-row no-gutters>
        <v-col
          v-if="$checkRole('atendimento.others')"
          cols="12"
          md="4"
        >
          <user-selector
            v-model="users"
            prepend-icon="mdi-account-group"
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
            :range="true"
            :valid-only-range="true"
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
            outlined
            color="primary"
            :loading="loading"
            @click="send"
          >
            <v-icon class="mr-1">
              mdi-chart-bar
            </v-icon>
            Enviar
          </v-btn>
        </v-col>
      </v-row>
      <base-bar
        ref="bar"
        class="mt-3"
      />
    </v-card-text>
  </v-card>
</template>

<script>
  import BaseBar from './BaseBar.vue'
  import UserSelector from './BaseUserSelector.vue'
  import BaseDatePicker from './BaseDatePicker.vue'
  import * as moment from 'moment'
  // import { extendedMoment } from 'moment-range'
  // const moment = extendedMoment(Moment)

  export default {
    components: {
      BaseBar,
      UserSelector,
      BaseDatePicker,
    },

    data () {
      return {
        date: [],
        users: [],
        loading: false,
        data: {},
        colors: [
          '#2196F3',
          '#F44336',
          '#009688',
          '#FFC107',
          '#FF5722',
          '#795548',
          '#607D8B',
          '#673AB7',
          '#3F51B5',
          '#00BCD4',
          '#03A9F4',
          '#FF9800',
        ],
      }
    },

    mounted () {
      this.refresh()
    },

    methods: {
      async refresh () {
        const serverTime = await this.$store.dispatch('getServerTime')
        const t0 = moment.unix(serverTime / 1000)
          .subtract(30, 'days')
          .format('YYYY-MM-DD')
        const t1 = moment.unix(serverTime / 1000)
          .format('YYYY-MM-DD')

        this.date = [t0, t1]
        this.send()
      },

      async send () {
        this.loading = true
        const projection = {}

        if (this.users.length) {
          projection.users = this.users
        }

        projection.dtinicio = `${this.date[0]}T00:00:00`
        projection.dtfim = `${this.date[1]}T23:59:59`

        try {
          this.data = await this.$store.dispatch('allAtendimentosAdmin', projection)
          this.transform()
        } finally {
          this.loading = false
        }
      },

      transform () {
        let labels = []
        const objUser = {}
        const average = {}
        this.data = this.data.filter(da => da.dtfim != null)
        this.data.forEach(da => {
          const idlogin = da.user.idlogin
          objUser[idlogin] = {}
        })
        const range = this.$moment.range(this.date[0], this.date[1])
        Array.from(range.by('days')).forEach(arr => {
          const tmpDate = arr.format('DD/MM/YYYY')
          labels.push(tmpDate)
          average[tmpDate] = []
        })

        const arrIdlogin = Object.keys(objUser)
        arrIdlogin.forEach(idlogin => {
          labels.forEach(tmpDate => {
            objUser[idlogin][tmpDate] = []
          })
        })

        this.data.forEach(da => {
          const idlogin = da.user.idlogin
          const [year, month, day] = da.dtinicio.split('T')[0].split('-')
          const key = `${day}/${month}/${year}`
          objUser[idlogin][key].push({
            dtinicio: new Date(da.dtinicio).getTime(),
            dtfim: new Date(da.dtfim).getTime(),
          })
        })

        const dataset = []
        arrIdlogin.forEach((idlogin, i) => {
          const tmp = []
          labels.forEach(i => {
            const timeWorked = this.$calculate(objUser[idlogin][i]) / (1000 * 60 * 60)
            average[i].push(timeWorked)
            tmp.push(timeWorked.toFixed(2))
          })
          dataset.push({
            label: idlogin,
            backgroundColor: this.colors[i],
            data: tmp,
          })
        })

        if (dataset.length >= 2) {
          const vetAverage = []
          Object.keys(average).forEach(key => {
            const tmpAvg = average[key]
            const avg = tmpAvg.reduce((a, b) => a + b, 0) / tmpAvg.length
            vetAverage.push(avg.toFixed(2))
          })

          dataset.unshift({
            label: 'Média',
            backgroundColor: 'rgba(33, 150, 243, 0.5)',
            type: 'line',
            data: vetAverage,
          })
        }

        labels = labels.map(label => {
          const [day, month] = label.split('/')
          return `${day}/${month}`
        })
        this.$refs.bar.render(labels, dataset)
      },
    },
  }
</script>
