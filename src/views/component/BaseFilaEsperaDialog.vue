<template>
  <v-dialog
    v-model="dialog"
    max-width="500"
    style="border-radius: 0px"
  >
    <template #activator="{ on }">
      <v-btn
        depressed
        dark
        block
        tile
        color="primary"
        v-on="on"
        @click="reset"
      >
        <v-icon
          left
        >
          mdi-plus-box-multiple
        </v-icon>
        {{ label }}
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        <span class="text-h5">
          Adicionar Novo Atendimento à Fila
        </span>
      </v-card-title>
      <v-card-text
        class="mb-0 pb-0"
      >
        <v-container>
          <v-row>
            <chave-selector
              ref="chaveSelector"
              v-model="cdchave"
              class="mb-2"
              :rules="[RREQUIRED]"
              :disabled="loading.add"
            />
            <div
              class="d-flex flex-grow-1 align-center mb-2"
            >
              <solicitante-selector
                ref="solicitanteSelector"
                v-model="solicitante"
                :cdchave="cdchave"
                :disabled="loading.add || cdchave == null"
                :rules="[RREQUIRED]"
              />
              <novo-solicitante-pop-over
                :cdchave="cdchave"
                :disabled="loading.add || cdchave == null"
                @afterAdd="$refs.solicitanteSelector.newValue(parseInt($event))"
              />
            </div>
            <div
              class="d-flex flex-grow-1 align-center"
            >
              <user-selector
                v-model="cduser"
                prepend-icon="mdi-account-group"
                label="Suporte"
                :disabled="loading.add"
                :multiple="false"
              />
              <v-btn
                icon
                color="red"
                :disabled="loading.add"
                @click="cduser = null"
              >
                <v-icon>
                  mdi-close
                </v-icon>
              </v-btn>
            </div>
            <v-textarea
              v-model="mmobservacao"
              label="Observações"
              :disabled="loading.add"
              filled
            />
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-switch
          v-model="fgurgente"
          label="Urgente"
          color="red"
          class="mb-4 ml-2 text-overline ret--text"
          :disabled="loading.add"
          hide-details
        />
        <v-spacer />
        <v-btn
          color="red darken-1"
          text
          :disabled="loading.add"
          @click="dialog = false"
        >
          Sair
        </v-btn>
        <v-btn
          color="blue darken-1"
          type="submit"
          :loading="loading.add"
          :disabled="loading.add"
          text
          @click="send"
        >
          Adicionar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapState } from 'vuex'
  export default {
    components: {
      ChaveSelector: () => import('@/views/component/BaseChaveSelector'),
      UserSelector: () => import('./BaseUserSelector.vue'),
      SolicitanteSelector: () => import('@/views/component/BaseSolicitanteSelector.vue'),
      NovoSolicitantePopOver: () => import('@/views/component/BaseNovoSolicitantePopOver.vue'),
    },

    props: {
      label: {
        type: String,
        default: 'Adicionar Novo Atendimento à Fila',
      },
    },

    data: () => ({
      dialog: false,
      cdchave: null,
      cduser: null,
      fgurgente: false,
      solicitante: null,
      mmobservacao: null,
    }),

    computed: {
      ...mapState('FilaEspera', ['loading']),
      addDTO () {
        return {
          cdchave: this.cdchave,
          cduser: this.cduser,
          fgurgente: this.fgurgente,
          mmobservacao: this.mmobservacao,
          cdsolicitante: this.solicitante.cd,
        }
      },
    },

    methods: {
      validate () {
        const ids = ['chaveSelector', 'solicitanteSelector']
        let isValid = true
        for (const id of ids) {
          isValid = !this.$refs[id].validate() ? false : isValid
        }
        return isValid
      },

      async send () {
        if (this.validate()) {
          try {
            await this.$store.dispatch('FilaEspera/add', this.addDTO)
          } finally {
            this.dialog = false
          }
        }
      },

      reset () {
        this.dialog = false
        this.loasding = false
        this.cdchave = null
        this.cduser = null
        this.fgurgente = false
        this.solicitante = null
        this.mmobservacao = null
        this.$nextTick(() => {
          this.$refs.chaveSelector?.reset()
          this.$refs.solicitanteSelector?.reset()
        })
      },
    },
  }
</script>
