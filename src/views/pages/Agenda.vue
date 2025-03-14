<template>
  <v-row
    class="fill-height"
  >
    <v-col
      cols="12"
      md="4"
      lg="3"
      xl="2"
    >
      <div
        class="d-flex flex-column"
      >
        <v-date-picker
          ref="datepicker"
          v-model="date"
          locale="pt-br"
          no-title
          :events="datePickerEvents"
          :event-color="user.idcolor"
          :disabled="loading"
          @click:date="handleDatePickerClick"
          @update:picker-date="handleDatePicker"
        />
        <!--user-checkbox
          v-model="users"
          class="mt-2"
          :users-avaible="usersAvaible"
          :disabled="loading"
          @change="calendarKey++"
        /-->
        <complete-user-checkbox
          ref="agendaCheckbox"
          doc-domain="agenda"
          class="mt-2"
          :disabled="loading"
          @change="users = $event"
        />
      </div>
    </v-col>
    <v-col
      cols="12"
      md="8"
      lg="9"
      xl="10"
    >
      <v-toolbar
        flat
      >
        <div
          class="d-none d-md-flex align-center"
        >
          <v-btn
            v-if="control"
            fab
            text
            small
            color="grey darken-2"
            :disabled="loading"
            @click="control.prev()"
          >
            <v-icon small>
              mdi-chevron-left
            </v-icon>
          </v-btn>
          <v-btn
            v-if="control"
            fab
            text
            small
            color="grey darken-2"
            :disabled="loading"
            @click="control.next()"
          >
            <v-icon small>
              mdi-chevron-right
            </v-icon>
          </v-btn>
          <v-chip
            v-if="control"
            label
          >
            <v-toolbar-title>
              {{ control.title }}
            </v-toolbar-title>
          </v-chip>
          <v-spacer />
        </div>
        <v-spacer />
        <v-btn-toggle
          v-model="type"
          mandatory
          color="primary"
          tile
          group
          @change="setControl($event)"
        >
          <v-btn
            value="category"
          >
            Dia
          </v-btn>
          <v-btn
            value="week"
          >
            Semana
          </v-btn>
          <v-btn
            value="month"
          >
            Mês
          </v-btn>
          <v-btn
            value="list"
          >
            Lista
          </v-btn>
        </v-btn-toggle>
      </v-toolbar>
      <v-progress-linear
        v-if="loading"
        indeterminate
        height="5"
      />
      <v-sheet
        v-if="type !== 'list'"
        :key="`sheet-calendar-${calendarKey}`"
      >
        <v-calendar
          ref="calendar"
          v-model="calendarDate"
          color="primary"
          locale="pt-br"
          :events="eventsFiltered"
          :event-color="getEventColor"
          :type="type"
          :categories="categories"
          style="min-height: 80vh"
          first-time="07:00"
          @contextmenu:event="showEvent"
          @click:event="openEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          @click:day="newEvent"
          @change="updateRange"
          @event-start="viewStart"
        >
          <template v-slot:event="{ eventParsed }">
            <div
              :class="$vuetify.breakpoint.smAndDown ? '' : 'ml-1'"
            >
              <v-icon
                v-if="eventParsed.input.evento.fgrecorrente"
                color="white"
                class="my-auto"
                size="15"
              >
                mdi-infinity
              </v-icon>
              <span
                v-if="eventParsed.input.evento._cdtipoagendamento !== 1"
                :class="`font-weight-bold ${(eventParsed.input.evento.fgconfirmado || eventParsed.input.evento.fgrecorrente) ? 'white--text' : 'black--text'}`"
              >
                {{ `${eventParsed.input.labelDtinicio}${!$vuetify.breakpoint.smAndDown ? '-' + eventParsed.input.labelDtfim : ''}` }}
              </span>
              <span
                :class="`font-weight-medium ${(eventParsed.input.evento.fgconfirmado || eventParsed.input.evento.fgrecorrente) ? 'white--text' : 'black--text'}`"
              >
                {{ eventParsed.input.name }}
              </span>
            </div>
          </template>
        </v-calendar>
      </v-sheet>
      <lista-eventos
        v-else
        ref="lista"
        v-model="calendarDate"
        :events="eventsFiltered"
        @open-event="openEvent"
        @new-event="newEvent"
        @change="updateRange"
      />
    </v-col>
    <novo-evento-dialog
      ref="novoEventoDialog"
      :users="users"
      @refresh="refresh"
    />
    <evento-details
      v-model="selectedOpen"
      :selected-event="selectedEvent"
      :selected-element="selectedElement"
    />
  </v-row>
</template>

<script>
  // import UserCheckbox from '@/views/component/BaseUserCheckbox.vue'
  import CompleteUserCheckbox from '@/views/component/BaseCompleteUserCheckbox'
  import NovoEventoDialog from '@/views/component/BaseNovoEventoDialog.vue'
  import ListaEventos from '@/views/component/BaseListaEventos.vue'
  import EventoDetails from '@/views/component/BaseEventoDetails'
  import { mapGetters } from 'vuex'
  import { cloneDeep } from 'lodash'
  import * as Color from 'color'

  export default {
    components: {
      // UserCheckbox,
      CompleteUserCheckbox,
      NovoEventoDialog,
      EventoDetails,
      ListaEventos,
    },
    data: () => ({
      control: null,
      calendarDate: '',
      pickerDate: null,
      calendarKey: 0,
      loading: false,
      usersInEvents: new Set(),
      refresed: false,
      users: [],
      type: 'month',
      typeToLabel: {
        month: 'Mês',
        week: 'Semana',
        day: 'Dia',
      },
      calendarEnd: '',
      myEvents: {},
      categories: [],
      date: null,
      novoEventoDate: null,
      selectedEvent: {},
      selectedElement: null,
      selectedOpen: false,
      events: [],
      datePickerEvents: [],
      start: {
        date: null,
      },
      end: {
        date: null,
      },
    }),

    computed: {
      ...mapGetters(['tipoAgendamentoMap', 'chaveMap', 'userMap', 'userList', 'user']),
      eventsFiltered () {
        const generateLabel = (dt) => {
          let minutos = this.$moment(dt).format('mm')
          minutos = (minutos === '00') ? '' : `:${minutos}`
          const horas = this.$moment(dt).format('HH')
          return `${horas}${minutos}`
        }

        const events = this.events.filter(it => {
          return it.evento._cdusers.some(cduser => this.users.includes(cduser))
        })

        const ret = events.map(evento => {
          evento.labelDtfim = generateLabel(evento.end)
          evento.labelDtinicio = generateLabel(evento.start)
          return evento
        })

        return ret
      },

      calendarStart () {
        return this.start.date
      },
    },

    watch: {
      $route (route) {
        if (route.name === 'agenda') {
          const tempEvents = cloneDeep(this.events)
          this.events = []
          this.$nextTick(() => {
            this.events = tempEvents
          })
        }
      },
    },

    created () {
      this.refresh()
    },

    mounted () {
      // this.$refs.calendar.checkChange()
      const date = this.$moment().format('YYYY-MM-DD')
      this.date = date
      this.calendarDate = date
      this.setControl(this.type)
    },

    methods: {
      setControl (type) {
        this.$nextTick(() => {
          const literals = {
            list: this.$refs.lista,
            default: this.$refs.calendar,
          }
          this.control = literals[type] || literals.default
        })
      },

      handleDatePicker (date) {
        if (date.split('-').length === 2) {
          this.calendarDate = `${date}-01`
        }
      },

      async refresh () {
        await this.$store.dispatch('allChaves')
        await this.$store.dispatch('userMap')
        await this.$store.dispatch('allTipoAgendamento')
        // this.categories = this.userList.map(user => user.idnome)
        this.refreshed = true
        this.start.date = this.start.date || this.$moment().startOf('month').format('YYYY-MM-DD')
        this.end.date = this.end.date || this.$moment().endOf('month').format('YYYY-MM-DD')
        await this.updateRange({ start: this.start, end: this.end })
      },

      updateDatePickerEvents () {
        this.datePickerEvents = []
        for (const key in this.myEvents) {
          this.datePickerEvents.push(key)
        }
      },

      handleDatePickerClick (date) {
        this.viewDay({ date })
        this.type = 'category'
      },

      datePickerColor () {
        return 'rgba(100, 100, 100, 0.5)'
        // return this.user.idcolor
      },

      newEvent (event) {
        this.$refs.novoEventoDialog.newEvent(event.date)
      },

      openEvent ({ nativeEvent, event }) {
        const tempEvent = cloneDeep(event)
        this.$refs.novoEventoDialog.openEvent(tempEvent)
        if (this.type !== 'list') {
          nativeEvent.stopPropagation()
        }
      },

      viewDay ({ date }) {
        this.calendarDate = date
        this.date = date
        this.type = 'category'
      },

      viewStart (event) {
      },

      getEventColor (event) {
        // const user = event.evento._cdusers.includes(this.user.cd) ? this.user : this.userMap[event.evento._cdusers[0]]
        let user
        const eventUsers = event.evento._cdusers
        if (eventUsers.includes(this.user.cd)) {
          user = this.user
        } else {
          user = eventUsers.find(cd => this.users.includes(cd))
          user = this.userMap[user]
        }
        const alpha = (event.evento.fgconfirmado || event.evento.fgrecorrente) ? 1 : 0.4
        return Color(user.idcolor).alpha(alpha).string() || 'rgba(100, 100, 100)'
      },

      setToday () {
        this.calendarDate = ''
      },

      showEvent ({ nativeEvent, event }) {
        const open = () => {
          this.selectedEvent = event
          this.selectedElement = nativeEvent.target
          setTimeout(() => {
            this.selectedOpen = true
          }, 10)
        }

        if (this.selectedOpen) {
          this.selectedOpen = false
          setTimeout(open, 10)
        } else {
          open()
        }

        nativeEvent.stopPropagation()
      },

      async updateRange ({ start, end }) {
        this.date = start.date
        this.loading = true
        this.start = start
        this.end = end
        if (this.refreshed) {
          for (let dateIterator = this.$moment(start.date); dateIterator.format('YYYY-MM-DD') <= end.date; dateIterator.add({ day: 1 })) {
            delete this.myEvents[dateIterator.format('YYYY-MM-DD')]
          }
          // Tratamento para mostrar dias anteriores ao mês no calendário
          let dtinicio = this.$moment(start.date)
          let dtfim = this.$moment(end.date)
          if (dtfim.diff(dtinicio, 'days') > 27 && this.type !== 'list') {
            dtinicio = dtinicio.add('days', -dtinicio.day())
            dtfim = dtfim.add('days', 6 - dtfim.day())
          }
          dtinicio = dtinicio.format('YYYY-MM-DD')
          dtfim = dtfim.format('YYYY-MM-DD')

          if (this.type === 'category') {
            dtfim = dtinicio
          }
          this.events = []
          this.categories = []
          const checkRecorrentes = {}

          try {
            const eventos = await this.$store.dispatch('allEvento', { dtinicio, dtfim })
            this.usersInEvents = new Set()
            const categories = new Set()
            for (const evento of eventos) {
              checkRecorrentes[evento.cdeventorecorrente] = true
              if (!checkRecorrentes[evento.cd]) {
                const category = this.userMap[(evento._cdusers.includes(this.user.cd) ? this.user.cd : evento._cdusers[0])].idnome
                const date = this.$moment(evento.dtinicio).format('YYYY-MM-DD')
                this.myEvents[date] = true
                evento._cdusers.forEach(cd => this.usersInEvents.add(cd))
                this.events.push({
                  name: `${evento.nmtitulo} - ${this.tipoAgendamentoMap[evento._cdtipoagendamento].nmtipoagendamento}`,
                  title: `${evento.nmtitulo} - ${this.tipoAgendamentoMap[evento._cdtipoagendamento].nmtipoagendamento}`,
                  start: new Date(evento.dtinicio),
                  end: new Date(evento.dtfim),
                  timed: evento._cdtipoagendamento !== 1,
                  category,
                  evento,
                })
                categories.add(category)
              }
            }
            this.$refs.agendaCheckbox.updateUsersInEvents([...this.usersInEvents])
            this.categories = Array.from(categories)
            this.updateDatePickerEvents()
          } finally {
            this.loading = false
          }
        }
      },
    },
  }
</script>
