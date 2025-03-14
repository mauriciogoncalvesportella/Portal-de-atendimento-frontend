<template>
  <div class="text-center">
    <v-dialog
      v-model="dialog"
      max-width="600"
      @input="clear"
    >
      <template #activator="{ on }">
        <v-hover v-slot="{ hover }">
          <v-card
            v-ripple="{ center: true }"
            :elevation="hover ? 5 : 1"
            dark
            color="primary"
            style="cursor: pointer;"
            v-on="on"
          >
            <v-card-text
              class="subtitle"
            >
              <v-icon
                size="30"
              >
                mdi-plus-box
              </v-icon>
              Novo atendimento
            </v-card-text>
          </v-card>
        </v-hover>
      </template>

      <v-card>
        <v-card-title>
          <span class="text-h5">Novo Atendimento</span>
        </v-card-title>
        <v-card-text>
          <fila-espera-selector
            v-model="models.cdfila"
            class="mb-2"
            prepend-icon="mdi-database-search"
            @clearHandle="models.cdfila = null"
            @change="models.cliente = null"
          />
          <div
            class="mb-2"
          >
            <v-autocomplete
              v-model="models.cliente"
              :items="clientes"
              label="Cliente"
              prepend-inner-icon="mdi-database-search"
              hide-details="auto"
              :disabled="models.cdfila != null"
              no-data-text="Vazio"
              filled
            />
            <span
              v-if="chaveInQueue"
              class="primary--text text-overline text-center"
            >
              *Há atendimento(s) na fila para esse cliente*
            </span>
          </div>
          <origem-selector
            ref="origem"
            v-model="models.origem"
            filled
          />
          <motivo-selector
            ref="motivoSelector"
            v-model="models.motivo"
            :disabled="loading"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="dialog = false"
          >
            Sair
          </v-btn>
          <v-btn
            type="submit"
            :loading="loading"
            :disabled="loading"
            text
            color="primary"
            @click="add"
          >
            Adicionar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import OrigemSelector from '@/views/component/BaseOrigemSelector.vue'
  import MotivoSelector from '@/views/component/BaseMotivoSelector.vue'
  import FilaEsperaSelector from '@/views/component/BaseFilaEsperaSelector.vue'
  import { mapGetters, mapState } from 'vuex'
  import { omitBy, isNil } from 'lodash'

  export default {
    components: {
      OrigemSelector,
      MotivoSelector,
      FilaEsperaSelector,
    },
    data () {
      return {
        loading: false,
        dialog: false,
        clientes: [],
        models: {
          cdfila: null,
          origem: null,
          cliente: null,
          motivo: 49,
        },
        contTabs: 0,
      }
    },

    computed: {
      ...mapGetters(['tabAtendimentoCont']),
      ...mapState('FilaEspera', ['fila']),
      filaSelected () {
        return this.fila.find(item => item.cd === this.models.cdfila)
      },

      chaveInQueue () {
        return this.fila.find(it => it._cdchave === this.models.cliente)
      },
    },

    mounted () {
      this.getNomeClientes()
    },

    methods: {
      setCdFila (cd) {
        this.dialog = true
        this.clear()
        this.$nextTick(() => {
          this.models.cdfila = cd
        })
      },

      async getNomeClientes () {
        this.clientes = await this.$store.dispatch('nomeClientes')
      },

      clear () {
        this.models.origem = null
        this.models.cliente = ''
        this.models.motivo = 49
        this.models.cdfila = null
        if (this.$refs.origem) {
          this.$refs.origem.clear()
        }
      },

      async add () {
        this.models.cliente = this.models.cliente === '' ? null : this.models.cliente
        if (!this.models.origem || (this.models.cliente == null && this.models.cdfila == null) || !this.models.motivo) {
          this.$notifier({ content: 'Preencha todos os campos', color: 'warning' })
        } else {
          try {
            this.loading = true
            const cdchave = this.filaSelected?._cdchave ?? this.models.cliente
            const idfantasia = this.clientes.find(cli => cli.value === cdchave)
            const request = omitBy({
              cdchave: this.models.cliente,
              cdorigem: this.models.origem,
              cdmotivo: this.models.motivo,
              cdfila: this.models.cdfila,
              idfantasia: idfantasia.text,
            }, isNil)
            const atendimentoRecord = await this.$store.dispatch('addAtendimento', request)
            this.$emit('after-add', atendimentoRecord.cd)
            this.dialog = false
          } finally {
            this.loading = false
          }
        }
      },
    },
  }
</script>
