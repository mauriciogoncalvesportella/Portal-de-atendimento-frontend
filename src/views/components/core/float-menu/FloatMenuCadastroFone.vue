<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :activator="`#${$store.state.Fone.cssId}`"
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
      width="650px"
      class="pr-1 py-1"
    >
      <v-card-title
        v-if="fila.length === 0"
      >
        Lista está vazia
      </v-card-title>
      <v-card-text
        class="overflow-y-auto pa-0 ma-0"
        style="max-height: 400px"
      >
        <v-list-item
          v-for="(fone, index) of fila"
          :key="`list-item-atendimento-${fone}`"
        >
          <v-list-item-content>
            <v-list-item-subtitle>
              <v-chip
                label
              >
                <v-icon>
                  mdi-phone
                </v-icon>
                {{ fone }}
              </v-chip>
            </v-list-item-subtitle>
            <v-list-item-title
              class="d-flex"
            >
              <base-chave-selector
                :ref="`baseChaveSelector_${index}`"
                dense
              />
              <v-text-field
                class="ml-2"
                label="Apelido"
                maxlength="10"
                filled
                dense
                style="text-transform: uppercase"
                @input="nicknames[`_${index}`] = $event"
              />
              <v-btn
                depressed
                color="primary"
                class="ml-2"
                height="54px"
                :loading="fone === loading.bind"
                @click="save(index)"
              >
                <v-icon
                  color="white"
                >
                  mdi-check-bold
                </v-icon>
              </v-btn>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script>
  import { mapState, mapGetters } from 'vuex'
  import DependenciesLoad from '@/views/component/BaseDependenciesLoad'
  import BaseChaveSelector from '../../../component/BaseChaveSelector.vue'

  export default {
    components: { BaseChaveSelector },
    mixins: [DependenciesLoad],
    data: () => ({
      menu: false,
      dependenciesConfig: {
        dependencies: [
          { action: 'allChaves', mutation: 'SET_CHAVES' },
        ],
        nicknames: {},
      },
    }),

    computed: {
      ...mapState('Fone', ['fila', 'loading', 'floatMenu', 'nicknames']),
      ...mapGetters(['chaveMap', 'userMap', 'user', 'metaMap']),
    },

    mounted () {
      this.$store.dispatch('Fone/getFoneList')
      this.$store.subscribeAction({
        after: (action) => {
          if (action.type === 'Fone/add' && this.$store.state.Fone?.floatMenu) {
            this.menu = true
          }
        },
      })
    },

    methods: {
      async save (index) {
        const cdchave = this.$refs[`baseChaveSelector_${index}`][0].model
        let idnome = this.nicknames[`_${index}`] ?? ''
        idnome = idnome.toUpperCase()

        if (cdchave === null) {
          this.$notifier({
            content: 'Selecione um cliente',
            color: 'red',
            valign: 'bottom',
            halign: 'right',
          })
          return
        }
        if (idnome !== undefined && idnome !== '') {
          if (this.RONLYLETTERUPPER(idnome) !== true) {
            this.$notifier({
              content: 'Caractere inválido. Somente letras são permitidas para o apelido',
              color: 'red',
              valign: 'bottom',
              halign: 'right',
            })
            return
          }
        }
        if (cdchave != null) {
          await this.$store.dispatch('Fone/bind', {
            fone: this.fila[index],
            idnome,
            cdchave: cdchave,
          })
        }
      },
    },
  }
</script>
