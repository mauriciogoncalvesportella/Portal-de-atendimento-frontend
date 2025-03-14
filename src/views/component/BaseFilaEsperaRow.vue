<template>
  <div>
    <v-hover
      v-slot="{ hover }"
    >
      <v-list-item
        v-if="dependenciesLoaded"
        elevation="1px"
        class="pa-0"
      >
        <v-list-item-icon
          class="text-button"
        >
          #{{ source.cd }}
        </v-list-item-icon>
        <div
          style="width: 30%"
        >
          <v-list-item-title
            v-if="chaveMap"
            class="text-truncate"
          >
            {{ chaveMap[source._cdchave].idfantasia }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ source.cdsolicitante.idsolicitante }}
          </v-list-item-subtitle>
        </div>
        <v-list-item-icon
          v-if="source._cduser != null"
        >
          <user-initials-avatar
            :cduser="source._cduser"
          />
        </v-list-item-icon>
        <v-list-item-icon>
          <v-icon
            v-if="source.fgurgente"
            color="red"
          >
            mdi-alert
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content
          class="text-right"
        >
          <v-list-item-title>
            {{ source.dtcriacao | str2datetime('HH:mm - DD/MM/YYYY') }}
          </v-list-item-title>
          <v-list-item-subtitle>
            <v-chip
              small
              class="text-overline"
            >
              <v-icon
                size="15"
                class="mr-1"
                left
              >
                mdi-clock
              </v-icon>
              <span
                class="text-truncate text-center"
              >
                {{ source.dtcriacao | duration2format({ dtend: source.dtfinalizado }) }}
              </span>
            </v-chip>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-icon>
          <v-btn
            v-if="source.cdatendimento == null || source.cdatendimento._cdticket == null"
            icon
            disabled
          />
          <v-btn
            v-else
            icon
            :disabled="source.cdatendimento._cdticket == null"
            :loading="loading.remove === source.cd"
            @click="openTheTicket(source.cdatendimento._cdticket, chaveMap[source._cdchave].idfantasia)"
          >
            <v-icon
              :color="hover ? 'primary' : ''"
            >
              mdi-open-in-new
            </v-icon>
          </v-btn>

          <v-btn
            icon
            :disabled="!hover"
            :loading="loading.remove === source.cd"
            @click="remove(source.cd)"
          >
            <v-icon
              :color="hover ? 'red' : ''"
            >
              mdi-delete
            </v-icon>
          </v-btn>
        </v-list-item-icon>
      </v-list-item>
    </v-hover>
    <v-divider />
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'
  import DependenciesLoad from '@/views/component/BaseDependenciesLoad'

  export default {
    components: {
      UserInitialsAvatar: () => import('@/views/component/BaseUserInitialsAvatar'),
    },
    mixins: [DependenciesLoad],
    props: {
      source: {
        type: Object,
        default: () => {},
      },
    },
    data: () => ({
      dependenciesConfig: {
        dependencies: [
          { action: 'allChaves', mutation: 'SET_CHAVES' },
          { action: 'userMap', mutation: 'SET_USERMAP' },
        ],
      },
    }),
    computed: {
      ...mapState('FilaEspera', ['loading']),
      ...mapGetters(['chaveMap', 'userMap']),
    },
    methods: {
      async remove (cd) {
        const res = await this.$confirm(
          `Você deseja remover o atendimento #${cd} da fila?`,
          {
            title: 'Aviso',
            buttonTrueText: 'Sim',
            buttonFalseText: 'Cancelar',
          },
        )
        if (res) {
          await this.$store.dispatch('FilaEspera/remove', cd)
          this.$emit('remove', cd)
        }
      },

      async openTheTicket (cdticket, idfantasia) {
        await this.$router.push({
          name: 'the-ticket',
          params: {
            cd: cdticket,
            label: `${cdticket} - ${idfantasia}`,
          },
        })
      },
    },
  }
</script>
