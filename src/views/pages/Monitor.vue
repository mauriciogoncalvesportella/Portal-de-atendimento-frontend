<template>
  <v-row
    class="mb-10 fill-height"
  >
    <v-col
      cols="12"
    >
      <v-sheet
        class="d-flex justify-center align-center mb-4"
        color="grey lighten-2"
        min-width="800px"
      >
        <template
          v-if="$checkRole('monitor.all.resume')"
        >
          <div
            class="d-flex justify-center align-center"
          >
            <v-btn-toggle
              v-model="layout"
              color="primary"
              mandatory
              group
              dense
            >
              <v-btn
                :value="0"
              >
                Tempo Real
              </v-btn>
              <v-btn
                :value="1"
              >
                Resumo
              </v-btn>
            </v-btn-toggle>
          </div>
          <v-divider
            vertical
            class="mx-5 my-5"
          />
          <div
            class="d-flex align-center"
          >
            <v-btn
              :disabled="loading"
              icon
              color="primary"
              @click="addDay(-1)"
            >
              <v-icon> mdi-arrow-left-bold </v-icon>
            </v-btn>
            <div
              class="mx-1"
            >
              <date-picker
                v-model="date"
                :disabled="loading"
                prepend-icon=""
                :show-actions="false"
                :component-props="{
                  filled: false,
                  solo: true,
                }"
                show-day-text
                @change-date="changeDate"
              />
            </div>
            <v-btn
              :disabled="loading"
              icon
              color="primary"
              @click="addDay(1)"
            >
              <v-icon> mdi-arrow-right-bold </v-icon>
            </v-btn>
          </div>
          <v-divider
            class="mx-5 my-5"
            vertical
          />
        </template>
        <v-checkbox
          v-model="autoRefresh"
          @mouseover="hoverCheckBox = true"
          @mouseleave="hoverCheckBox = false"
        />
        <v-btn
          :disabled="loading || !autoRefresh"
          depressed
          tooltip="Atualizar valores"
          class="ma-3"
          @click="refresh"
        >
          <v-progress-circular
            :value="(refreshCont / 15000) * 100"
            class="mr-2"
            size="22"
            width="5"
            color="primary"
            left
          />
          <v-icon>
            mdi-refresh
          </v-icon>
          Refresh
        </v-btn>
      </v-sheet>

      <v-row
        justify="center"
        dense
      >
        <template
          v-if="userAtendimentos.length > 0 && !loading"
        >
          <v-sheet
            v-for="(currUser, currUserIndex) in userAtendimentos"
            :key="`card-user-${currUser.cd}`"
            class="mx-2 my-2 pt-1 d-flex-column rounded-md"
            width="350"
            elevation="1"
          >
            <v-list
              class="pa-0"
            >
              <v-list-item>
                <v-list-item-icon>
                  <v-icon
                    color="primary"
                    class="ml-3 mr-3"
                  >
                    mdi-face-agent
                  </v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-subtitle>Nome</v-list-item-subtitle>
                  <v-list-item-title
                    class="text-h3"
                  >
                    {{ currUser.idnome }}
                  </v-list-item-title>
                </v-list-item-content>

                <v-list-item-action-text
                  v-if="$checkRole('monitor.all.resume') || currUser.cd === user.cd"
                >
                  <v-btn
                    icon
                    @click="openRendimentoDiario(currUser.cd)"
                  >
                    <v-icon
                      color="primary"
                    >
                      mdi-chart-timeline
                    </v-icon>
                  </v-btn>
                </v-list-item-action-text>
              </v-list-item>
              <template
                v-if="$checkRole('monitor.all.resume') || currUser.cd === user.cd"
              >
                <v-divider />
                <v-list-item
                  v-if="$checkRole('monitor.all.resume') || currUser.cd === user.cd"
                  class="grey lighten-4"
                >
                  <v-list-item-icon>
                    <lista-atendimentos
                      :items="currUser.atendimentos"
                      @done="refresh"
                      @change-modal="changeModal"
                    />
                  </v-list-item-icon>

                  <v-list-item-content>
                    <v-list-item-subtitle>Atendimentos</v-list-item-subtitle>
                    <v-list-item-title
                      class="text-h3"
                    >
                      {{ currUser.atendimentos.length }}
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action-text
                    class="text-subtitle-1"
                  >
                    {{ currUser.tempoTotal | sec2date }}
                    <br>
                    {{ (currUser.tempoTotal / currUser.atendimentos.length) | sec2date }}
                  </v-list-item-action-text>
                </v-list-item>
              </template>
              <template
                v-if="($checkRole('monitor.all.acoes') || currUser.cd === user.cd) && currUser.acoes.length > 0"
              >
                <v-divider />
                <v-list-item
                  class="grey lighten-4"
                >
                  <v-list-item-icon>
                    <lista-acoes
                      :items="currUser.acoes"
                    />
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-subtitle>
                      Ações
                    </v-list-item-subtitle>
                    <v-list-item-title>
                      {{ currUser.acoes.length }}
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action-text
                    class="text-subtitle-1"
                  >
                    {{ currUser.tempoTotalAcoes | sec2date }}
                  </v-list-item-action-text>
                </v-list-item>
              </template>
              <v-divider />
              <template
                v-if="currUser.cd != -1 && layout === 0"
              >
                <template
                  v-for="atendimento in currUser.atendimentos"
                >
                  <v-list-item
                    v-if="atendimentosOnline[atendimento.cd]"
                    :key="`atendimento-${atendimento.cd}`"
                    :dark="atendimentosCurrent[atendimento.cd]"
                    :class="`${atendimentosCurrent[atendimento.cd] ? 'primary lighten-1' : '0'}`"
                  >
                    <v-list-item-icon>
                      <v-icon
                        class="mr-3 ml-3"
                      >
                        {{ atendimento.origem.idicon }}
                      </v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                      <v-list-item-subtitle>
                        Cliente
                      </v-list-item-subtitle>
                      <v-list-item-title>
                        {{ atendimento.chave.idfantasia }}
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action-text
                      v-if="$checkRole('monitor.all.resume') || currUser.cd === user.cd"
                      class="text-subtitle-1"
                    >
                      {{ atendimento.tempoTotal | sec2date }}
                    </v-list-item-action-text>
                  </v-list-item>
                </template>
                <template
                  v-for="acao in currUser.acoes"
                >
                  <v-list-item
                    v-if="acoesOnline[acao.cd]"
                    :key="`acao-${currUserIndex}-${acao.cd}`"
                    :dark="acoesCurrent[acao.cd]"
                    :class="`${acoesCurrent[acao.cd] ? 'primary lighten-1' : '0'}`"
                  >
                    <v-list-item-icon
                      style="cursor: pointer"
                    >
                      <v-btn
                        fab
                        small
                        elevation="1"
                        class="ml-1"
                        @click="openTheTicket(acao.ticket)"
                      >
                        <v-icon>
                          mdi-script-text
                        </v-icon>
                      </v-btn>
                    </v-list-item-icon>

                    <v-list-item-content>
                      <v-list-item-subtitle>
                        Cliente
                      </v-list-item-subtitle>
                      <v-list-item-title
                        v-if="chaveMap"
                      >
                        {{ getIdFantasia(acao.ticket.atendimento._cdchave) }}
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action-text
                      v-if="$checkRole('monitor.all.resume') || currUser.cd === user.cd"
                      class="text-subtitle-1"
                    >
                      {{ acao.tempoTotal | sec2date }}
                    </v-list-item-action-text>
                  </v-list-item>
                </template>
                <v-list-item
                  :dark="!currUser.online"
                  :class="`${currUser.online ? '' : 'primary lighten-1'}`"
                >
                  <v-icon
                    class="mx-auto"
                  >
                    mdi-sleep
                  </v-icon>
                </v-list-item>
              </template>
              <template
                v-else
              >
                <v-list-item
                  v-for="origem in getOrigemCount(currUser.cd, currUserIndex)"
                  :key="`origem-count-${origem.cd}`"
                  dense
                >
                  <v-list-item-icon>
                    <v-icon
                      color="primary"
                      class="mr-3 ml-3"
                    >
                      {{ origem.idicon }}
                    </v-icon>
                  </v-list-item-icon>

                  <v-list-item-content>
                    <v-list-item-title
                      class="d-flex justify-space-between"
                    >
                      <span
                        class="text-subtitle-1"
                      >
                        {{ origem.cont }}
                      </span>
                      <span
                        class="text-subtitle-1 mr-10"
                      >
                        {{ origem.count | sec2date }}
                      </span>
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action-text
                    class="text-subtitle-1"
                  >
                    {{ (origem.count / origem.cont) | sec2date }}
                  </v-list-item-action-text>
                </v-list-item>
              </template>
            </v-list>
          </v-sheet>
        </template>
        <template
          v-else
        >
          <v-sheet
            v-for="i in skeletonNumber"
            :key="`skeleton-${i}`"
            color="grey lighten-4"
            class="px-3 pt-3 pb-3"
          >
            <v-skeleton-loader
              width="300"
              type="list-item-avatar, image, list-item"
            />
          </v-sheet>
        </template>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
  import { mapGetters } from 'vuex'

  var interval = null
  var intervalRefreshCont = null
  export default {
    name: 'DashboardMonitor',
    components: {
      ListaAcoes: () => import('@/views/component/BaseListaAcoes'),
      ListaAtendimentos: () => import('../component/ListAtendimentos.vue'),
      DatePicker: () => import('@/views/component/BaseDatePicker.vue'),
    },

    data () {
      return {
        layout: 0,
        autoRefresh: true,
        hoverCheckBox: false,
        loading: false,
        date: null,
        userAtendimentos: [],
        atendimentosOnline: {},
        atendimentosCurrent: {},
        origemCount: {},
        origemCountByUser: {},
        userAcoes: {},
        acoesOnline: {},
        acoesCurrent: {},
        refreshCont: 0,
        isModalEnable: false,
      }
    },

    computed: {
      ...mapGetters(['chaveMap']),
      ...mapGetters(['user']),
      skeletonNumber () {
        if (this.$checkRole('atendimento.others')) {
          return (this.userAtendimentos.length > 0) ? this.userAtendimentos.length : 5
        }

        return 1
      },

      isToday () {
        return this.date === this.$moment().format('YYYY-MM-DD')
      },
    },

    watch: {
      $route (route) {
        if (route.name === 'monitor') {
          this.refresh()
        }
      },

      isToday (val) {
        if (this.$checkRole('monitor.all.resume')) {
          if (!val) {
            this.layout = 1
            this.autoRefresh = false
          } else {
            this.layout = 0
            this.autoRefresh = true
          }
        }
      },
    },

    created () {
      this.date = this.$moment().format('YYYY-MM-DD')
      this.autoRefresh = this.isToday
    },

    mounted () {
      this.refresh()
      intervalRefreshCont = setInterval(() => {
        if (this.autoRefresh) {
          if (!this.isModalEnable && !this.loading) {
            this.refreshCont += 1000
          }
          if (this.refreshCont >= 15000 && this.$route.name === 'monitor') {
            this.refresh()
          }
        }
      }, 1000)
    },

    destroyed () {
      clearInterval(interval)
      clearInterval(intervalRefreshCont)
    },

    methods: {
      getIdFantasia (cdchave) {
        if (this.chaveMap && this.chaveMap[cdchave]) {
          return this.chaveMap[cdchave].idfantasia
        }

        return 'Caregando...'
      },

      changeDate (date) {
        if (date) {
          this.date = date
          this.refresh()
        }
      },

      addDay (n) {
        if (this.date) {
          this.date = this.$moment(this.date).add('days', n).format('YYYY-MM-DD')
          this.refresh()
        }
      },

      async openRendimentoDiario (cduser) {
        await this.$router.push({
          name: 'chart-historico',
          params: {
            cduser: cduser,
            date: this.date,
          },
        })
      },

      async refresh () {
        if (!this.hoverCheckBox) {
          this.refreshCont = 0
          this.loading = true
          const res = await this.$store.dispatch('monitor', { date: this.date, force: true })
          if (this.$checkRole('atendimento.others')) {
            res.userAtendimentos.unshift({
              cd: -1,
              idnome: 'Total',
              atendimentos: res.userAtendimentos.reduce((acc, curr) => {
                acc = acc.concat(curr.atendimentos)
                return acc
              }, []),
            })
          }
          // await new Promise((resolve) => setTimeout(resolve, 300))
          await this.transform(res.userAtendimentos, res.acoes)
          this.loading = false
          this.refreshCont = 0
        }
      },

      getOrigemCount (cduser, index) {
        if (cduser === -1) {
          return this.origemCount
        }
        return this.userAtendimentos[index].origemCount
      },

      updateOrigemCount (user, atendimento, sum) {
        if (user.cd !== -1) {
          user.origemCount = user.origemCount || {}
          const cdorigem = atendimento.origem.cd
          if (!user.origemCount[cdorigem]) {
            user.origemCount[cdorigem] = {
              count: 0,
              cont: 0,
              ...atendimento.origem,
            }
          }
          user.origemCount[cdorigem].cont++
          user.origemCount[cdorigem].count += sum
        }
      },

      async transform (userAtendimentos, acoes) {
        this.origemCount = {}
        this.atendimentosOnline = {}
        this.atendimentosCurrent = {}
        this.acoesCurrent = {}
        this.acoesOnline = {}
        this.userAcoes = {}
        let allAcoes = []

        const serverTime = await this.$store.dispatch('getServerTime')
        let currUserIndex = -1

        for (const acao of acoes) {
          this.userAcoes[acao._cduser] = this.userAcoes[acao._cduser] || []
          this.userAcoes[acao._cduser].push(acao)
          allAcoes = allAcoes.concat(acao)
        }

        this.userAcoes[-1] = allAcoes

        for (const [i, user] of Object.entries(userAtendimentos)) {
          if (user.cd === this.user.cd) {
            currUserIndex = i
          }

          user.acoes = this.userAcoes[user.cd] || []
          user.tempoTotal = 0
          user.tempoTotalAcoes = user.acoes.reduce((acc, curr) => acc + (parseInt(curr.servico?.ntotal) || 0), 0)
          user.online = false
          for (const atendimento of user.atendimentos) {
            if (atendimento.dtfim == null) {
              this.atendimentosOnline[atendimento.cd] = true
            }
            const sum = this.$sumAtendimentos(atendimento.jslista, serverTime)
            this.updateOrigemCount(user, atendimento, sum.sum)
            atendimento.tempoTotal = sum.sum
            if (user.cd !== -1) {
              if (!this.origemCount[atendimento.origem.cd]) {
                this.origemCount[atendimento.origem.cd] = {
                  count: 0,
                  cont: 0,
                  ...atendimento.origem,
                }
              }
              this.origemCount[atendimento.origem.cd].cont++
              this.origemCount[atendimento.origem.cd].count += sum.sum
            }
            if (sum.isIndex) {
              this.atendimentosCurrent[atendimento.cd] = true
              user.online = true
            }
            user.tempoTotal += atendimento.tempoTotal
          }
        }

        for (const [cduser, acoes] of Object.entries(this.userAcoes)) {
          if (cduser !== -1) {
            for (const acao of acoes) {
              const { isIndex, sum } = this.$sumAtendimentos(acao.servico.jslista)
              acao.tempoTotal = sum

              if (acao.servico.dtfim == null) {
                this.acoesOnline[acao.cd] = true
              }

              if (isIndex && userAtendimentos[cduser]) {
                userAtendimentos[cduser].online = true
                this.acoesCurrent[acao.cd] = true
              }
            }
          }
        }

        userAtendimentos.sort((a, b) => b.tempoTotal - a.tempoTotal)

        if (this.$checkRole('monitor.all') && currUserIndex !== -1) {
          const user = userAtendimentos.splice(currUserIndex, 1)
          if (this.$checkRole('monitor.all.resume')) {
            userAtendimentos.splice(1, 0, user[0])
          } else {
            userAtendimentos.unshift(user[0])
          }
        }

        if (this.$checkRole('atendimento.others')) {
          userAtendimentos[0].online = false
        }
        this.userAtendimentos = userAtendimentos
      },

      changeModal (isEnable) {
        this.isModalEnable = isEnable
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
    },
  }
</script>
