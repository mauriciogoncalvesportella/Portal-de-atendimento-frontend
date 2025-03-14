<template>
  <v-menu
    v-if="dependenciesLoaded"
    v-model="menu"
    :close-on-content-click="false"
    :activator="`#${$store.state.FilaEspera.cssId}`"
    bottom
    content-class="v-settings"
    left
    nudge-left="8"
    offset-x
    origin="top right"
    transition="scale-transition"
  >
    <v-card
      class="text-center mb-0"
      min-width="500"
    >
      <v-card-text
        class="overflow-y-auto"
      >
        <fila-espera-dialog
          v-if="$checkRole('atendimento.handle-queue')"
          @click="menu = false"
        />
        <div
          v-if="fila.length"
          class="mt-2 overflow-y-auto"
          style="max-height: 400px;"
        >
          <v-list-item
            v-for="(item, i) in fila"
            :key="`lits-item-fila-${i}`"
            :class="`${ item._cduser === user.cd ? 'primary lighten-5' : ''}`"
          >
            <v-list-item-icon
              class="text-button"
            >
              #{{ item.cd }}
            </v-list-item-icon>
            <v-list-item-content
              class="text-left"
            >
              <v-list-item-title v-html="chaveMap[item._cdchave].idfantasia">
                {{ chaveMap[item._cdchave].idfantasia }}
                <v-icon
                  v-if="item.fgurgente"
                  color="red"
                >
                  mdi-alert
                </v-icon>
              </v-list-item-title>
              <v-list-item-subtitle v-html="item.cdsolicitante.idsolicitante" />
            </v-list-item-content>
            <v-icon
              v-if="item.fgurgente"
              class="mr-1"
              color="red"
            >
              mdi-alert
            </v-icon>
            <user-initials-avatar
              v-if="item._cduser != null"
              :cduser="item._cduser"
            />
            <base-cronometro
              class="ml-1"
              :date="item.dtcriacao"
            />
            <v-btn
              icon
              class="ml-1"
              color="primary"
              @click="openAtendimento(i)"
            >
              <v-icon>
                mdi-face-agent
              </v-icon>
            </v-btn>
          </v-list-item>
        </div>
        <span
          v-else
          class="text-overline"
        >
          Não há atendimentos na fila
        </span>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script>
  import DependenciesLoad from '@/views/component/BaseDependenciesLoad'
  import { mapState, mapGetters } from 'vuex'
  export default {
    components: {
      UserInitialsAvatar: () => import('@/views/component/BaseUserInitialsAvatar'),
      BaseCronometro: () => import('@/views/component/BaseCronometro.vue'),
      FilaEsperaDialog: () => import('@/views/component/BaseFilaEsperaDialog'),
    },
    mixins: [DependenciesLoad],
    data: () => ({
      menu: false,
      color: '#1976D2',
      dependenciesConfig: {
        dependencies: [
          { action: 'allChaves', mutation: 'SET_CHAVES' },
          { action: 'userMap', mutation: 'SET_USERMAP' },
        ],
      },
    }),

    computed: {
      ...mapState('FilaEspera', ['fila', 'loading']),
      ...mapGetters(['chaveMap', 'userMap', 'user']),
    },

    mounted () {
      this.$store.dispatch('FilaEspera/getAllOnline')
    },

    methods: {
      async openAtendimento (index) {
        const id = this.$store.state.tabControl?.tabOpen?.atendimento
        const item = this.fila[index]
        await this.$router.push({
          name: 'atendimento',
          params: {
            cdfila: item.cd,
          },
        }).catch(() => {
          if (id) {
            this.$store.commit('UPDATE_TAB_PROPS', {
              id,
              props: {
                cdfila: item.cd,
              },
            })
          }
        })
        this.menu = false
      },
    },
  }
</script>

<style lang="sass">
  .v-settings
    .v-item-group > *
      cursor: pointer

    &__item
      border-style: solid
      border-color: transparent !important

      &--active
        border-color: #00cae3 !important
</style>
