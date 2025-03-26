<template>
  <v-dialog
    v-model="dialog"
    max-width="700px"
    :activator="`#${$store.state.Agenda.cssId}`"
    :fullscreen="$vuetify.breakpoint.smAndDown"
  >
    <v-card
      class="overflow-x-auto"
      min-width="600px"
    >
      <v-card-title
        class="text-subtitle-1"
      >
        <v-icon
          class="mr-2"
        >
          mdi-calendar
        </v-icon>
        Agendamentos do dia
      </v-card-title>
      <v-card-text
        class="overflow-y-auto"
        style="max-height: 600px"
      >
        <v-progress-linear
          v-if="loading.getOwnTodayEvents"
          indeterminate
        />
        <v-list
          v-else-if="eventos.length"
          class="ma-0 pa-0"
        >
          <template
            v-for="evento in eventos"
          >
            <div
              :key="`v-list-item-${evento.cd}`"
            >
              <v-divider />
              <v-list-item
                class="pr-0"
              >
                <v-list-item-icon
                  class="my-auto"
                >
                  <div
                    class="d-flex justify-center align-center"
                    style="width: 100px"
                  >
                    <v-icon
                      v-if="evento._cdtipoagendamento === 1"
                    >
                      mdi-pin
                    </v-icon>
                    <span
                      v-else
                      class="text-overline"
                    >
                      {{ evento.dtinicio | str2date }}
                      -
                      {{ evento.dtfim | str2date }}
                    </span>
                  </div>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title
                    class="text-body-1"
                    v-html="evento.nmtitulo"
                  />
                  <div
                    v-if="evento.nmlocal"
                    class="d-flex align-center"
                  >
                    <v-icon
                      size="15"
                    >
                      mdi-map-marker
                    </v-icon>
                    <v-list-item-subtitle v-html="evento.nmlocal" />
                  </div>
                  <div
                    class="d-flex align-center"
                  >
                    <v-icon
                      size="15"
                    >
                      mdi-calendar-question
                    </v-icon>
                    <v-list-item-subtitle v-html="tipoAgendamentoMap[evento._cdtipoagendamento].nmtipoagendamento" />
                  </div>
                </v-list-item-content>
                <v-list-item-content
                  class="text-body-2 overflow-y-auto my-2"
                  style="max-height: 100px; white-space: pre-line"
                >
                  {{ evento.mmdesc }}
                </v-list-item-content>
              </v-list-item>
            </div>
          </template>
        </v-list>
        <span
          v-else
          class="text-overline"
        >
          Não há agendamentos para hoje
        </span>
      </v-card-text>
      <v-card-actions
        class="mt-auto"
      >
        <v-btn
          tile
          text
          color="primary"
          @click="toggleRememberOnStart"
        >
          <v-icon
            left
          >
            {{ rememberOnStart ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
          </v-icon>
          Exibir ao iniciar
        </v-btn>
        <v-spacer />
        <v-btn
          text
          tile
          color="primary"
          @click="dialog = false"
        >
          Fechar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import { cloneDeep } from 'lodash'
  import { mapGetters, mapState } from 'vuex'
  export default {
    name: 'TodayEvents',
    data: () => ({
      loaded: false,
      dialog: false,
      lastDay: localStorage.getItem('TodayEventsLast') ?? null,
      rememberOnStart: parseInt(localStorage.getItem('TodayEventsRemember') ?? 1) === 1,
      allTipoAgendamento: [],
    }),

    computed: {
      ...mapState('Agenda', ['ownTodayEvents', 'loading']),
      ...mapGetters(['tipoAgendamentoMap']),
      eventos () {
        const eventos = cloneDeep(this.ownTodayEvents)
        eventos.sort((a, b) => {
          const dta = a.dtinicio ? new Date(a.dtinicio).getTime() : 0
          const dtb = b.dtinicio ? new Date(b.dtinicio).getTime() : 0
          return dta - dtb
        })
        return eventos
      },
    },

    mounted () {
      this.startUp()
    },

    methods: {
      async startUp() {
        try {
          const dateToday = this.$moment().format('YYYY-MM-DD');
          
          // 1. Inicialize primeiro o state no módulo Agenda
          await this.$store.dispatch('Agenda/RESET').catch(() => {
            console.warn('Não foi possível resetar o estado Agenda');
          });
          
          // 2. Tente carregar os tipos de agendamento
          await this.$store.dispatch('allTipoAgendamento').catch(error => {
            console.warn('Não foi possível carregar tipos de agendamento:', error);
          });
          
          // 3. Tente carregar os eventos do dia
          try {
            await this.$store.dispatch('Agenda/getOwnTodayEvents');
          } catch (error) {
            console.warn('Erro ao carregar eventos do dia:', error);
            // Inicialize o state manualmente se necessário
            this.$store.commit('Agenda/SET_OWN_TODAY_EVENTS', []);
          }
          
          if (this.lastDay !== dateToday && this.rememberOnStart) {
            this.show();
          }
          localStorage.setItem('TodayEventsLast', dateToday);
        } catch (error) {
          console.error('Erro na inicialização de TodayEvents:', error);
        }
      },

      async show () {
        this.dialog = true
      },

      toggleRememberOnStart () {
        this.rememberOnStart = !this.rememberOnStart
        localStorage.setItem('TodayEventsRemember', this.rememberOnStart ? 1 : 0)
      },
    },
  }
</script>