<template>
  <v-dialog
    v-model="dialog"
    fullscreen
  >
    <v-card
      color="grey lighten-4"
      tile
    >
      <v-toolbar
        class="mb-4"
        color="primary"
        dark
        flat
        fixed
      >
        <span
          class="text-uppercase text-h3 font-weight-light"
        >
          Situação
        </span>
        <v-spacer />
        <v-btn
          icon
          @click="dialog = false"
        >
          <v-icon>
            mdi-close-box
          </v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-row
          dense
        >
          <v-col
            v-for="(tickets, cduser) in ticketsFromUser"
            :key="`col-${cduser}`"
            cols="12"
            sm="6"
            md="4"
            lg="2"
          >
            <div
              class="d-flex flex-column"
            >
              <div
                style="position: -webkit-sticky; top: 0"
              >
                <v-card
                  dark
                  :color="userMap[cduser].idcolor"
                >
                  <v-card-title
                    class="d-flex justify-center text-uppercase text-h3 font-weight-light text-truncate"
                  >
                    {{ userMap[cduser].idnome }}
                  </v-card-title>
                </v-card>
              </div>
              <ticket-card
                v-for="ticket in tickets"
                :key="`ticket-${cduser}-${ticket.cd}`"
                :ticket="ticket"
                class="my-1"
                @open-ticket="openTheTicket"
              />
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
  import DependenciesLoad from '@/views/component/BaseDependenciesLoad.vue'
  import { mapGetters } from 'vuex'
  import TicketCard from '@/views/component/BaseTicketCard'

  export default {
    components: {
      TicketCard,
    },
    extends: DependenciesLoad,
    data () {
      return {
        rawTickets: [],
        dialog: false,
        loading: false,
        dependenciesConfig: {
          route: this.$route.name,
          executeBefore: () => { this.loading = true },
          executeAfter: () => { this.loading = false },
          dependencies: [{ action: 'userMap', mutation: 'SET_USERMAP' }, { action: 'allChaves', mutation: 'SET_CHAVES' }],
        },
      }
    },
    computed: {
      ...mapGetters(['userMap', 'chaveMap']),

      ticketsFromUser () {
        const obj = {}
        const check = {}
        for (const ticket of this.rawTickets) {
          for (const cduser of ticket._cdusers) {
            if (!check[`${cduser}-${ticket.cd}`]) {
              check[`${cduser}-${ticket.cd}`] = true
              obj[cduser] = obj[cduser] || []
              obj[cduser].push(ticket)
            }
          }
        }
        return obj
      },
    },
    methods: {
      open (tickets) {
        this.dialog = true
        this.rawTickets = tickets
      },

      async openTheTicket (ticket) {
        const atendimento = ticket.atendimento
        const idfantasia = this.chaveMap[atendimento._cdchave].idfantasia
        if (!this.drag) {
          await this.$router.push({
            name: 'the-ticket',
            params: {
              cd: ticket.cd,
              label: `${ticket.cd} - ${idfantasia}`,
            },
          })
        }
      },

      onResize () {
      },
    },
  }
</script>

<style scoped>
  .v-dialog > .v-card > .v-toolbar {
    position: sticky;
    top: 0;
    z-index: 999;
  }
</style>
