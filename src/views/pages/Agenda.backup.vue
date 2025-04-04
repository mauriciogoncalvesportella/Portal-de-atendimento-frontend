<template>
  <div
    v-cloak
    id="dayspan"
  >
    <ds-calendar-app
      ref="app"
      :calendar="calendar"
      :read-only="readOnly"
      @change="saveState"
    >
      <template slot="title">
        DaySpan
      </template>

      <template slot="menuRight">
        <v-btn
          icon
          large
          href="https://github.com/ClickerMonkey/dayspan-vuetify"
          target="_blank"
        >
          <v-avatar
            size="32px"
            tile
          >
            <img
              src="https://simpleicons.org/icons/github.svg"
              alt="Github"
            >
          </v-avatar>
        </v-btn>
      </template>

      <template
        slot="eventPopover"
        slot-scope="slotData"
      >
        <ds-calendar-event-popover
          v-bind="slotData"
          :read-only="readOnly"
          @finish="saveState"
        />
      </template>

      <template
        slot="eventCreatePopover"
        slot-scope="{ placeholder, calendar }"
      >
        <ds-calendar-event-create-popover
          :calendar-event="placeholder"
          :calendar="calendar"
          :close="$refs.app.$refs.calendar.clearPlaceholder"
          @create-edit="$refs.app.editPlaceholder"
          @create-popover-closed="saveState"
        />
      </template>

      <template
        slot="eventTimeTitle"
        slot-scope="{calendarEvent, details}"
      >
        <div>
          <v-icon
            v-if="details.icon"
            class="ds-ev-icon"
            size="14"
            :style="{color: details.forecolor}"
          >
            {{ details.icon }}
          </v-icon>
          <strong
            class="ds-ev-title"
          >
            {{ details.title }}
          </strong>
        </div>
        <div
          class="ds-ev-description"
        >
          {{ getCalendarTime( calendarEvent ) }}
        </div>
      </template>

      <template
        slot="drawerBottom"
      >
        <div
          class="pa-3"
        >
          <v-checkbox
            v-model="readOnly"
            label="Read Only?"
          />
        </div>
      </template>
    </ds-calendar-app>
  </div>
</template>

<script>
  import { Calendar, Weekday, Month } from 'dayspan'
  import Vue from 'vue'

  export default {
    data: () => ({
      storeKey: 'dayspanState',
      calendar: Calendar.months(),
      readOnly: false,
      defaultEvents: [
        {
          data: {
            title: 'Weekly Meeting',
            color: '#3F51B5',
          },
          schedule: {
            dayOfWeek: [Weekday.MONDAY],
            times: [9],
            duration: 30,
            durationUnit: 'minutes',
          },
        },
        {
          data: {
            title: 'First Weekend',
            color: '#4CAF50',
          },
          schedule: {
            weekspanOfMonth: [0],
            dayOfWeek: [Weekday.FRIDAY],
            duration: 3,
            durationUnit: 'days',
          },
        },
        {
          data: {
            title: 'End of Month',
            color: '#000000',
          },
          schedule: {
            lastDayOfMonth: [1],
            duration: 1,
            durationUnit: 'hours',
          },
        },
        {
          data: {
            title: 'Mother\'s Day',
            color: '#2196F3',
            calendar: 'US Holidays',
          },
          schedule: {
            month: [Month.MAY],
            dayOfWeek: [Weekday.SUNDAY],
            weekspanOfMonth: [1],
          },
        },
        {
          data: {
            title: 'New Year\'s Day',
            color: '#2196F3',
            calendar: 'US Holidays',
          },
          schedule: {
            month: [Month.JANUARY],
            dayOfMonth: [1],
          },
        },
        {
          data: {
            title: 'Inauguration Day',
            color: '#2196F3',
            calendar: 'US Holidays',
          },
          schedule: {
            month: [Month.JANUARY],
            dayOfMonth: [20],
          },
        },
        {
          data: {
            title: 'Martin Luther King, Jr. Day',
            color: '#2196F3',
            calendar: 'US Holidays',
          },
          schedule: {
            month: [Month.JANUARY],
            dayOfWeek: [Weekday.MONDAY],
            weekspanOfMonth: [2],
          },
        },
        {
          data: {
            title: 'George Washington\'s Birthday',
            color: '#2196F3',
            calendar: 'US Holidays',
          },
          schedule: {
            month: [Month.FEBRUARY],
            dayOfWeek: [Weekday.MONDAY],
            weekspanOfMonth: [2],
          },
        },
        {
          data: {
            title: 'Memorial Day',
            color: '#2196F3',
            calendar: 'US Holidays',
          },
          schedule: {
            month: [Month.MAY],
            dayOfWeek: [Weekday.MONDAY],
            lastWeekspanOfMonth: [0],
          },
        },
        {
          data: {
            title: 'Independence Day',
            color: '#2196F3',
            calendar: 'US Holidays',
          },
          schedule: {
            month: [Month.JULY],
            dayOfMonth: [4],
          },
        },
        {
          data: {
            title: 'Labor Day',
            color: '#2196F3',
            calendar: 'US Holidays',
          },
          schedule: {
            month: [Month.SEPTEMBER],
            dayOfWeek: [Weekday.MONDAY],
            lastWeekspanOfMonth: [0],
          },
        },
        {
          data: {
            title: 'Columbus Day',
            color: '#2196F3',
            calendar: 'US Holidays',
          },
          schedule: {
            month: [Month.OCTOBER],
            dayOfWeek: [Weekday.MONDAY],
            weekspanOfMonth: [1],
          },
        },
        {
          data: {
            title: 'Veterans Day',
            color: '#2196F3',
            calendar: 'US Holidays',
          },
          schedule: {
            month: [Month.NOVEMBER],
            dayOfMonth: [11],
          },
        },
        {
          data: {
            title: 'Thanksgiving Day',
            color: '#2196F3',
            calendar: 'US Holidays',
          },
          schedule: {
            month: [Month.NOVEMBER],
            dayOfWeek: [Weekday.THURSDAY],
            weekspanOfMonth: [3],
          },
        },
        {
          data: {
            title: 'Christmas Day',
            color: '#2196F3',
            calendar: 'US Holidays',
          },
          schedule: {
            month: [Month.DECEMBER],
            dayOfMonth: [25],
          },
        },
      ],
    }),
    mounted () {
      window.app = this.$refs.app
      this.loadState()
    },
    methods: {
      getCalendarTime (calendarEvent) {
        const sa = calendarEvent.start.format('a')
        const ea = calendarEvent.end.format('a')
        let sh = calendarEvent.start.format('h')
        let eh = calendarEvent.end.format('h')
        if (calendarEvent.start.minute !== 0) {
          sh += calendarEvent.start.format(':mm')
        }
        if (calendarEvent.end.minute !== 0) {
          eh += calendarEvent.end.format(':mm')
        }
        return (sa === ea) ? (sh + ' - ' + eh + ea) : (sh + sa + ' - ' + eh + ea)
      },

      saveState () {
        const state = this.calendar.toInput(true)
        const json = JSON.stringify(state)
        localStorage.setItem(this.storeKey, json)
      },

      loadState () {
        let state = {}
        try {
          const savedState = JSON.parse(localStorage.getItem(this.storeKey))
          if (savedState) {
            state = savedState
            state.preferToday = false
          }
        } catch (e) {
        }
        if (!state.events || !state.events.length) {
          state.events = this.defaultEvents
        }
        state.events.forEach(ev => {
          const defaults = this.$dayspan.getDefaultEventDetails()
          ev.data = Vue.util.extend(defaults, ev.data)
        })
        this.$refs.app.setState(state)
      },
    },
  }
</script>

<style>
body, html, #app, #dayspan {
  font-family: Roboto, sans-serif !important;
  width: 100%;
  height: 100%;
}
.v-btn--flat,
.v-text-field--solo .v-input__slot {
  background-color: red !important;
  margin-bottom: 8px !important;
}
</style>
