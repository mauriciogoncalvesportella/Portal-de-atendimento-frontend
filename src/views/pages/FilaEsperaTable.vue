<template>
  <v-row
    dense
  >
    <v-col
      cols="12"
      md="3"
    >
      <novo-fila-espera
        label="Novo Atendimento"
      />
    </v-col>
    <v-col>
      <template
        v-if="!gloablLoading"
      >
        <div
          v-if="fila.length === 0"
          class="d-flex justify-center"
        >
          <span
            class="text-h3 font-weight-thin mx-auto"
          >
            Não há atendimentos na fila
          </span>
        </div>
        <v-slide-y-transition
          class="py-0"
          group
        >
          <v-sheet
            v-for="(item, i) in fila"
            :key="`${item.cd}-${item._cdchave}`"
            :elevation="over === item.cd ? 1 : 0"
            tile
            :class="`pa-3 ${i > 0 ? 'my-1' : ''}`"
            style="border: 1px solid rgba(100, 100, 100, .2)"
            @mouseover="over = item.cd"
            @mouseleave="over = null"
          >
            <div
              class="d-flex justify-space-between align-center"
            >
              <div>
                <span
                  class="text-button"
                >
                  #{{ item.cd }}
                </span>
                <span
                  class="text-h5 font-weight-light"
                >
                  {{ chaveMap[item._cdchave].idfantasia }}
                  ({{ item.cdsolicitante.idsolicitante }})
                </span>
              </div>
              <div>
                <v-icon
                  v-if="item.fgurgente"
                  color="red"
                >
                  mdi-alert
                </v-icon>
                <user-initials-avatar
                  v-if="item._cduser != null"
                  :cduser="item._cduser"
                  class="my-5"
                />
                <base-cronometro
                  :date="item.dtcriacao"
                />
                <v-btn
                  icon
                  :disabled="loading.remove != null"
                  :loading="loading.remove == item.cd"
                  @click="remove(item.cd)"
                >
                  <v-icon
                    color="red"
                  >
                    mdi-delete-circle-outline
                  </v-icon>
                </v-btn>
              </div>
            </div>
            <v-divider
              class="my-2"
            />
            <div
              class="d-flex align-start"
            >
              <v-icon>
                mdi-message-reply-text
              </v-icon>
              <span
                class="font-italic ml-1"
                style="white-space: pre-line"
              >
                {{ item.mmobservacao ? item.mmobservacao : 'N/D' }}
              </span>
            </div>
          </v-sheet>
        </v-slide-y-transition>
      </template>
      <v-progress-linear
        v-else
        indeterminate
        height="5"
      />
    </v-col>
  </v-row>
</template>

<script>
  import { mapState, mapGetters } from 'vuex'
  import DependenciesLoad from '@/views/component/BaseDependenciesLoad'
  import UserInitialsAvatar from '@/views/component/BaseUserInitialsAvatar'
  import BaseCronometro from '@/views/component/BaseCronometro.vue'

  export default {
    components: {
      UserInitialsAvatar,
      BaseCronometro,
      NovoFilaEspera: () => import('../component/BaseFilaEsperaDialog.vue'),
    },
    extends: DependenciesLoad,
    data: () => ({
      over: null,
      dependenciesConfig: {
        dependencies: [
          { action: 'allChaves', mutation: 'SET_CHAVES' },
          { action: 'userMap', mutation: 'SET_USERMAP' },
        ],
      },
    }),
    computed: {
      ...mapState('FilaEspera', ['fila', 'loaded', 'loading']),
      ...mapGetters(['chaveMap', 'userMap']),
      gloablLoading () {
        return !this.loaded.getAllOnline || !this.dependenciesLoaded
      },
    },
    created () {
      this.$store.dispatch('FilaEspera/getAllOnline')
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
        }
      },
    },
  }
</script>
