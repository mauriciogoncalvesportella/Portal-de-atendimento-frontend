<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :activator="`#${$store.state.AtendimentosOnline.cssId}`"
    bottom
    content-class="v-settings"
    left
    nudge-left="8"
    offset-x
    origin="top right"
    transition="scale-transition"
  >
    <v-card
      v-if="dependenciesLoaded"
      width="500px"
      class="pr-1 py-1"
    >
      <v-card-text
        class="overflow-y-auto pa-0 ma-0"
        style="max-height: 400px"
      >
        <v-list-item
          v-for="item of atendimentos"
          :key="`list-item-atendimento-${item[0]}`"
        >
          <template
            v-if="item[1] == null"
          >
            <v-list-item-avatar
              class="ma-0"
            >
              <v-icon>
                mdi-sleep
              </v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ userMap[item[0]].idlogin }}
              </v-list-item-title>
              <v-list-item-subtitle>
                N/C
              </v-list-item-subtitle>
            </v-list-item-content>
          </template>
          <template
            v-else
          >
            <v-list-item-avatar
              class="ma-0"
            >
              <v-icon>
                {{ metaMap.origem[item[1]._cdorigem].idicon }}
              </v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ userMap[item[0]].idlogin }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ chaveMap[item[1]._cdchave].idfantasia }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-title>
                {{ metaMap.motivo[item[1]._cdmotivo].nmmotivo }}
              </v-list-item-title>
            </v-list-item-action>
          </template>
        </v-list-item>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script>
  import { mapState, mapGetters } from 'vuex'
  import DependenciesLoad from '@/views/component/BaseDependenciesLoad'

  export default {
    mixins: [DependenciesLoad],
    data: () => ({
      menu: false,
      dependenciesConfig: {
        dependencies: [
          { action: 'allChaves', mutation: 'SET_CHAVES' },
          { action: 'userMap', mutation: 'SET_USERMAP' },
          { action: 'allMeta', mutation: 'SET_TICKET_META' },
        ],
      },
    }),

    computed: {
      ...mapState('AtendimentosOnline', ['data']),
      ...mapGetters(['chaveMap', 'userMap', 'user', 'metaMap']),

      atendimentos () {
        if (this.data) {
          const atendimentos = Object.entries(this.data)
          atendimentos.sort((a, b) => {
            a = { cd: a[0], atendimento: a[1] }
            b = { cd: b[0], atendimento: b[1] }
            if ((a.atendimento && b.atendimento) || (!a.atendimento && !b.atendimento)) {
              if (this.userMap[a.cd].idlogin < this.userMap[b.cd].idlogin) {
                return -1
              } else {
                return 1
              }
            }
            if (a.atendimento && !b.atendimento) {
              return -1
            } else {
              return 1
            }
          })
          return atendimentos
        }
        return []
      },
    },

    mounted () {
      this.$store.dispatch('AtendimentosOnline/getOnline')
    },
  }
</script>
