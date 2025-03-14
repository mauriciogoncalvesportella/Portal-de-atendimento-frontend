<template>
  <vue-custom-scrollbar
    v-resize="onResize"
    :style="`position: relative; height: ${listHeight}`"
  >
    <v-list
      ref="list"
      dense
      flat
    >
      <template
        v-for="(eventos, date) in list"
      >
        <v-list-item
          :key="`header-${date}`"
          class="primary dark"
          @click="$emit('new-event', { date: date })"
        >
          <v-list-item-title
            class="d-flex align-center justify-space-between white--text"
          >
            <div
              class="d-flex align-center"
            >
              <v-icon
                color="white"
                size="15"
                class="mr-1"
              >
                mdi-calendar
              </v-icon>
              <strong>
                {{ date | str2datetime('LL') }}
              </strong>
            </div>
            {{ date | str2datetime('dddd') }}
          </v-list-item-title>
        </v-list-item>
        <template
          v-for="(evento, i) in eventos"
        >
          <v-hover
            :key="`evento-${date}-${i}`"
            v-slot="{ hover }"
          >
            <v-list-item
              :class="hover ? 'grey lighten-3' : ''"
              style="cursor: pointer;"
              @click="$emit('open-event', { event: evento })"
            >
              <v-list-item-title
                class="d-flex align-center"
              >
                <div
                  style="width: 85px"
                  class="d-flex justify-center"
                >
                  <strong
                    v-if="evento.evento._cdtipoagendamento !== 1"
                  >
                    {{ evento.start | str2datetime('HH:mm') }}
                    -
                    {{ evento.end | str2datetime('HH:mm') }}
                  </strong>
                  <v-icon
                    v-else
                    color="black"
                  >
                    mdi-pin
                  </v-icon>
                </div>
                <span
                  class="ml-3"
                >
                  <v-icon
                    v-if="evento.evento.fgrecorrente"
                    size="20"
                    class="mr-1"
                  >
                    mdi-infinity
                  </v-icon>
                  {{ evento.name }}
                </span>
                <v-spacer />
                <user-initials-avatar
                  v-for="cd in evento.evento._cdusers"
                  :key="`user-${date}-${cd}`"
                  :cduser="cd"
                />
              </v-list-item-title>
            </v-list-item>
          </v-hover>
          <v-divider
            v-if="i < eventos.length - 1"
            :key="`divider-${date}-${i}`"
          />
        </template>
      </template>
    </v-list>
  </vue-custom-scrollbar>
</template>

<script>
  import { cloneDeep } from 'lodash'
  import UserInitialsAvatar from '@/views/component/BaseUserInitialsAvatar'
  import vueCustomScrollbar from 'vue-custom-scrollbar'
  import 'vue-custom-scrollbar/dist/vueScrollbar.css'

  export default {
    components: {
      UserInitialsAvatar,
      vueCustomScrollbar,
    },

    props: {
      value: {
        type: String,
        default: null,
      },
      events: {
        type: Array,
        default: () => [],
      },
    },

    data () {
      return {
        listHeight: '80vh',
      }
    },

    computed: {
      title () {
        if (this.value) {
          const dt = this.$moment(this.value)
          return `${dt.format('MMMM')} ${dt.format('YYYY')}`
        }
        return ''
      },

      list () {
        const list = {}
        const eventos = this.sortEvents()

        for (const evento of eventos) {
          const start = this.$moment(evento.start).format('YYYY-MM-DD')
          list[start] = list[start] || []
          list[start].push(evento)
        }

        for (const key in list) {
          list[key].sort((a, b) => {
            if (a.evento._cdtipoagendamento === 1) {
              return -1
            }
            return 0
          })
        }
        return list
      },
    },

    mounted () {
      this.handle(0)
    },

    methods: {
      onResize () {
        if (this.$vuetify.breakpoint.smAndDown) {
          this.listHeight = '100%'
        } else {
          this.listHeight = Math.max(window.innerHeight - 200, this.$refs.list?.clientHeight || 0)
        }
      },
      sortEvents () {
        const events = cloneDeep(this.events)
        return events.sort((a, b) => {
          if (a.start > b.start) {
            return 1
          }
          if (a.start < b.start) {
            return -1
          }
          return 0
        })
      },
      next () {
        this.handle(1)
      },
      prev () {
        this.handle(-1)
      },
      handle (n) {
        const date = this.$moment(this.value).endOf('month').add(n, 'M').format('YYYY-MM-DD')
        const start = this.$moment(date).startOf('month').format('YYYY-MM-DD')
        const end = this.$moment(date).endOf('month').format('YYYY-MM-DD')
        this.$emit('input', date)
        this.$emit('change', { start: { date: start }, end: { date: end } })
      },
    },
  }
</script>
