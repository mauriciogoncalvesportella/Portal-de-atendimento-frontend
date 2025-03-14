<template>
  <div
    ref="container"
    style="min-width: 500px"
  >
    <tickets-situacao
      ref="ticketsSituacao"
    />
    <div
      v-if="loading"
      class="d-flex justify-center"
    >
      <v-progress-linear
        indeterminate
        height="5"
      />
    </div>
    <v-slide-y-transition>
      <div
        v-if="!loading"
      >
        <!--vue-position-sticky
          :offset-top="60"
        -->
        <div
          class="mx-1 my-2 d-flex justify-space-between"
        >
          <template
            v-for="(item, i) in situacao"
          >
            <v-badge
              v-if="situacaoCdFromOrdem[i] != 4"
              :key="`item-${i}`"
              bordered
              :value="count.sum[item.cd]"
              :content="count.sum[item.cd]"
              overlap
            >
              <v-card
                :ref="`item${i}`"
                :width="cardWidth - 3"
                style="cursor: pointer"
                color="primary"
                dark
                @click="$refs.ticketsSituacao.open(ticketsFromSituacao[item.cd])"
              >
                <v-card-title
                  class="d-flex justify-space-between text-truncate"
                >
                  <div>
                    <v-icon
                      left
                    >
                      {{ item.idicon }}
                    </v-icon>
                    {{ item.nmsituacao }}
                  </div>
                </v-card-title>
              </v-card>
            </v-badge>
          </template>
        </div>
        <!--/vue-position-sticky-->
        <v-expansion-panels
          v-model="model"
          multiple
        >
          <v-expansion-panel
            v-for="(currUser, i) in users"
            :id="`ticket-header-${i}`"
            :key="`expansion-${i}`"
          >
            <v-expansion-panel-header
              @click="handleClickExpansionHeader(i)"
            >
              {{ currUser.idnome }}
              <strong
                class="ml-1"
              >
                &nbsp;({{ currUser.nTotalTickets }})
              </strong>
            </v-expansion-panel-header>
            <v-sheet
              v-if="model.includes(i)"
              class="mx-1 d-flex justify-space-between"
            >
              <template
                v-for="(ticketSituacao, ii) in currUser.situacaoTicket"
              >
                <div
                  v-if="situacaoCdFromOrdem[ii] != 4"
                  :key="`ticket-situacao-${ii}-${key}`"
                  :style="`width: ${cardWidth}px;`"
                  class="d-flex flex-column"
                >
                  <span
                    class="text-center text-overline text-truncate"
                    style="display: block"
                  >
                    {{ situacao[ii].nmsituacao }}
                  </span>
                  <draggable
                    v-model="currUser.situacaoTicket[ii]"
                    :group="`group-${currUser.cd}`"
                    :disabled="disableDrag"
                    class="grey lighten-3 mb-2"
                    ghost-class="ghost"
                    style="height: 100%"
                    :scroll-sensitivity="50"
                    :force-fallback="true"
                    @change="swap($event, i, ii)"
                    @start="drag = true; allowScrow = true"
                    @end="drag = false; allowScrow = false"
                  >
                    <!--
                      :class="`my-2 mx-2 ${`ticket-card-${i}-${ticket.cd}` === lastTicketOpen.id ? 'primary lighten-5' : ''}`"
                    -->
                    <ticket-card
                      v-for="ticket in currUser.situacaoTicket[ii]"
                      :key="ticket.cd"
                      :custom-id="`ticket-card-${i}-${ticket.cd}`"
                      :ticket="ticket"
                      :user-index="i"
                      :user-list="userListFromCdticket[ticket.cd]"
                      :chave-map="chaveMap"
                      :meta-map="metaMap"
                      :active="`ticket-card-${i}-${ticket.cd}` === lastTicketOpen.id"
                      @open-ticket="openTheTicket"
                    />
                  </draggable>
                </div>
              </template>
            </v-sheet>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script>
  import draggable from 'vuedraggable'
  import TicketsSituacao from '@/views/component/BaseTicketsSituacao'
  import { mapGetters } from 'vuex'
  import VirtualTicketCard from '@/views/component/BaseVirtualTicketCard.vue'
  import DependenciesLoad from '@/views/component/BaseDependenciesLoad.vue'

  export default {
    name: 'BaseTicketsKanban',
    components: {
      draggable,
      TicketsSituacao,
      TicketCard: () => import('@/views/component/BaseFunctionalTicketCard'),
    },
    extends: DependenciesLoad,

    data () {
      return {
        VirtualTicketCard,
        dependenciesConfig: {
          executeBefore: () => { this.loading = true },
          executeAfter: () => { this.refresh() },
          dependencies: [
            { action: 'allChaves', mutation: 'SET_CHAVES' },
            { action: 'allMeta', mutation: 'SET_TICKET_META' },
          ],
        },
        lastTicketOpen: {
          cdTicket: null,
          id: null,
          userIndex: null,
        },
        visible: {},
        cdsituacao: -1,
        allowScrow: true,
        loading: true,
        drag: false,
        disableDrag: false,
        key: 0,
        model: [],
        users: [],
        containerWidth: 0,
        cardWidth: 0,
        situacaoCdFromOrdem: {},
        userIndexFromCd: {},
        swapError: false,
        addedMeta: {},
        userListFromCdticket: {},
        ticketsFromSituacao: {},
        count: {
          sum: {},
          check: {},
        },
      }
    },

    computed: {
      ...mapGetters(['screen', 'user', 'chaveMap', 'metaMap', 'metaList']),
      situacao () {
        return this.metaList?.situacao
      },
    },

    watch: {
      $route (route) {
        if (route.name === 'tickets') {
          // this.loading = true
          this.$nextTick(() => {
            this.getWidths()
            // console.log('teste')
            // this.loading = false
          })
          if (this.lastTicketOpen.userIndex != null && this.lastTicketOpen.id) {
            setTimeout(() => {
              this.model = [this.lastTicketOpen.userIndex]
              const { id } = this.lastTicketOpen
              this.$nextTick(() => {
                const el = document.getElementById(id)
                this.$scrollTo(el)
              })
            }, 1)
          }
        } else {
          this.model = []
        }
      },
    },

    mounted () {
      // window.addEventListener('resize', this.getWidths)
      this.$store.subscribeAction((action, state) => {
        if (action.type === 'screenResize' && this.dependenciesLoaded) {
          this.containerWidth = this.$refs.container?.clientWidth || 0
          this.cardWidth = (this.containerWidth / (this.situacao.length - 1)) - 10
        }
      })

      this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'CHANGE_TAB' && mutation.payload.includes('the-ticket')) {
          const cdTicket = parseInt(mutation.payload.split('-')[2])
          this.lastTicketOpen.cdTicket = cdTicket
          this.lastTicketOpen.id = `ticket-card-${this.lastTicketOpen.userIndex}-${cdTicket}`
        }
      })
    },

    methods: {
      getWidths (event) {
        if (this.dependenciesLoaded) {
          this.containerWidth = this.$refs.container?.clientWidth || 0
          this.cardWidth = (this.containerWidth / (this.situacao.length - 1)) - 10
        }
      },

      async refresh () {
        this.loading = true
        this.$emit('loading', true)
        try {
          const ticketMap = {}
          const situacaoOrdemFromCd = {}
          this.situacao.forEach(it => {
            situacaoOrdemFromCd[it.cd] = it.nordem
          })

          this.situacao.sort((a, b) => a.nordem - b.nordem)
          this.users = await this.$store.dispatch('allTicketsKanban', true)
          this.users.sort((a, b) => a.idnome > b.idnome ? 1 : -1)

          // let userIndex = 0
          // let myUserIndex = -1
          for (const currUser of this.users) {
            currUser.nTotalTickets = currUser.tickets.length
            // this.userIndexFromCd[currUser.cd] = userIndex++
            currUser.situacaoTicket = []
            this.situacao.forEach(it => {
              currUser.situacaoTicket.push([])
              this.situacaoCdFromOrdem[it.nordem] = it.cd
            })

            for (const ticket of currUser.tickets) {
              const cdsituacao = ticket._cdsituacao
              this.ticketsFromSituacao[cdsituacao] = this.ticketsFromSituacao[cdsituacao] || []
              this.ticketsFromSituacao[cdsituacao].push(ticket)

              this.count.sum[cdsituacao] = this.count.sum[cdsituacao] || 0
              if (!this.count.check[ticket.cd]) {
                this.count.check[ticket.cd] = true
                this.count.sum[cdsituacao]++
              }

              if (!this.userListFromCdticket[ticket.cd]) {
                this.userListFromCdticket[ticket.cd] = []
              }
              this.userListFromCdticket[ticket.cd].push(currUser.cd)
              const nordem = situacaoOrdemFromCd[ticket._cdsituacao]
              if (ticketMap[ticket.cd] == null) {
                ticketMap[ticket.cd] = ticket
              }
              currUser.situacaoTicket[nordem].push(ticketMap[ticket.cd])
            }

            for (const situacao of this.situacao) {
              const nordem = situacao.nordem
              currUser.situacaoTicket[nordem].sort((a, b) => a.jskanbanorder[currUser.cd] - b.jskanbanorder[currUser.cd])
            }
          }

          for (const [indexUser, currUser] of Object.entries(this.users)) {
            this.userIndexFromCd[currUser.cd] = indexUser
          }

          this.$nextTick(() => this.getWidths())
        } finally {
          this.loading = false
          this.$emit('loading', false)
        }
      },

      async swapOtherUsersTickets (ticketCd, oldSituacaoIndex, newSituacaoIndex) {
        const userList = this.userListFromCdticket[ticketCd]
        for (const userCd of userList) {
          const userIndex = this.userIndexFromCd[userCd]
          for (const [ticketIndex, ticket] of this.users[userIndex].situacaoTicket[oldSituacaoIndex].entries()) {
            if (ticket.cd === ticketCd) {
              const oldTicketSituacao = this.users[userIndex].situacaoTicket[oldSituacaoIndex]
              const newTicketSituacao = this.users[userIndex].situacaoTicket[newSituacaoIndex]
              // const ticket = {}
              // Object.assign(ticket, this.users[userIndex].situacaoTicket[oldSituacaoIndex][ticketIndex])
              const ticket = this.users[userIndex].situacaoTicket[oldSituacaoIndex][ticketIndex]
              // ticket.style = 'opacity: 1'
              ticket.cdsituacao = this.situacaoCdFromOrdem[newSituacaoIndex]
              oldTicketSituacao.splice(ticketIndex, 1)
              newTicketSituacao.unshift(ticket)
            }
          }
        }
      },

      async updateJslistakanban (ticketCd, oldSituacaoIndex, newSituacaoIndex) {
        const userList = this.userListFromCdticket[ticketCd]
        const jslistaFromTicketCd = {}
        // cd, jslista
        for (const userCd of userList) {
          const userIndex = this.userIndexFromCd[userCd]
          for (const situacaoIndex of [oldSituacaoIndex, newSituacaoIndex]) {
            for (const [index, ticket] of this.users[userIndex].situacaoTicket[situacaoIndex].entries()) {
              if (jslistaFromTicketCd[ticket.cd] == null) {
                jslistaFromTicketCd[ticket.cd] = {}
              }
              jslistaFromTicketCd[ticket.cd][userCd] = index
            }
          }
        }
        await this.$store.dispatch('updateKanbanOrder', jslistaFromTicketCd)
      },

      rollbackSwap (eventAdded, eventRemoved) {
      },

      async swap (event, i, ii) {
        if (event.added) {
          this.addedMeta = {
            newIndex: event.added.newIndex,
            userIndex: i,
            situacaoIndex: ii,
          }
        }

        if (event.removed) {
          const ticket = event.removed.element
          if (this.addedMeta) {
            // ticket.style = 'opacity: 0.4;'
            this.disableDrag = true

            const cdsituacao = this.situacaoCdFromOrdem[this.addedMeta.situacaoIndex]
            ticket.cdsituacao = cdsituacao
            const cd = ticket.cd
            try {
              await this.$store.dispatch('changeTicketSituacao', { cd, cdsituacao })
              this.swapOtherUsersTickets(cd, ii, this.addedMeta.situacaoIndex)
              await this.updateJslistakanban(cd, ii, this.addedMeta.situacaoIndex)
            } catch (e) {
              await this.refresh()
            } finally {
              // ticket.style = 'opacity: 1;'
              this.disableDrag = false
            }
          }
          this.addedMeta = null
        }

        if (event.moved) {
          try {
            this.disableDrag = true
            await this.updateJslistakanban(event.moved.element.cd, ii, ii)
          } catch (e) {
            await this.refresh()
          } finally {
            this.disableDrag = false
          }
        }
        // this.key++
      },

      async openTheTicket (ticket, userIndex) {
        const atendimento = ticket.atendimento
        const idfantasia = this.chaveMap[atendimento._cdchave].idfantasia
        this.lastTicketOpen = {
          id: `ticket-card-${userIndex}-${ticket.cd}`,
          cdTicket: ticket.cd,
          userIndex,
        }
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

      handleClickExpansionHeader (index) {
        if (this.lastTicketOpen.userIndex === index) {
          this.lastTicketOpen = {
            id: null,
            cdTicket: null,
            userIndex: null,
          }
        }
      },
    },
  }
</script>
<style scoped>
  .truncate {
    display: inline-block;
    max-width: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ghost {
    background: rgba(255, 255, 255, 0.25) !important;
    /*border: 0.5px solid red !important;*/
    /*border-style: dashed !important;*/
    color: rgba(0, 0, 0, 0.25) !important;
    outline: 1px dashed red;
    box-shadow: 0 0 3px #ddd;
    /*box-shadow:0px 0px 0px 10px black inset;*/
  }
</style>
