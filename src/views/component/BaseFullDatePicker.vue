<template>
  <v-row>
    <v-col
      cols="12"
      sm="4"
      md="4"
    >
      <v-menu
        v-model="menu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="290px"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
            v-model="transformDate"
            label="Data"
            prepend-icon="mdi-calendar"
            readonly
            v-on="on"
          />
        </template>
        <v-date-picker
          v-model="date"
          locale="pt-br"
          no-title
          scrollable
          range
        >
          <v-btn
            text
            color="warning"
            @click="clear"
          >
            Limpar
          </v-btn>
        </v-date-picker>
      </v-menu>
    </v-col>
    <v-col
      cols="12"
      sm="4"
      md="2"
    >
      <v-menu
        ref="menu1"
        v-model="menu1"
        :close-on-content-click="false"
        :nudge-right="40"
        :return-value.sync="time"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
            v-model="time"
            label="Início"
            prepend-icon="mdi-clock"
            readonly
            :disabled="disabled"
            v-on="on"
          />
        </template>
        <v-time-picker
          v-if="menu1"
          v-model="time"
          full-width
          format="24hr"
          :max="time1"
          @click:minute="$refs.menu1.save(time)"
        />
      </v-menu>
    </v-col>

    <v-col
      cols="12"
      sm="4"
      md="2"
    >
      <v-menu
        ref="menu2"
        v-model="menu2"
        :close-on-content-click="false"
        :nudge-right="40"
        :return-value.sync="time"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
            v-model="time1"
            label="Término"
            prepend-icon="mdi-clock"
            readonly
            :disabled="disabled"
            v-on="on"
          />
        </template>
        <v-time-picker
          v-if="menu2"
          v-model="time1"
          full-width
          format="24hr"
          :min="time"
          @click:minute="$refs.menu2.save(time)"
        />
      </v-menu>
    </v-col>
  </v-row>
</template>

<script>
  export default {
    props: {
      value: {
        type: Object,
        default: () => {},
      },
    },

    data: () => ({
      disabled: true,
      date: [],
      time: null,
      time1: null,
      menu: false,
      modal: false,
      menu1: false,
      menu2: false,
    }),

    computed: {
      transformDate () {
        if (this.date) {
          const temp = this.transform()
          if (temp.length > 1 && temp[0] > temp[1]) {
            [temp[0], temp[1]] = [temp[1], temp[0]]
          }
          return temp.join(' ~ ')
        }
        return ''
      },
    },

    watch: {
      time: function (value, old) {
        this.save()
      },

      time1: function (value, old) {
        this.save()
      },

      date: function (value, old) {
        if (!value.length) {
          this.disabled = true
          this.time = null
          this.time1 = null
        } else {
          this.disabled = false
          this.time = '00:00'
          this.time1 = '23:59'
        }
        this.save()
      },
    },

    methods: {
      transform () {
        return this.date.map(dt => {
          return this.$moment(dt).format('DD/MM/YYYY')
        })
      },

      save () {
        const t1 = (this.time || '00:00') + ':00'
        const t2 = (this.time1 || '23:59') + ':00'
        if (this.date.length >= 1) {
          let dtinicio = `${this.date[0]}T${t1}`
          let dtfim = `${this.date[(this.date?.length > 1) ? 1 : 0]}T${t2}`

          if (dtinicio > dtfim) {
            [dtinicio, dtfim] = [dtfim, dtinicio]
          }

          this.$emit('input', {
            dtinicio,
            dtfim,
          })
        }
      },

      clear () {
        this.date = []
        this.time = null
        this.time1 = null
        this.menu = false
        this.disabled = true
      },
    },
  }
</script>
