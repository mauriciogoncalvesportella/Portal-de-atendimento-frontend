<template>
  <v-autocomplete
    v-model="model"
    :loading="loading"
    :items="motivo"
    :prepend-inner-icon="icon"
    :error-messages="errMsg"
    :disabled="disabled"
    hide-details="auto"
    :class="!errMsg ? 'mb-2' : ''"
    label="Motivo"
    dense
    chips
    small-chips
    filled
    @change="change"
  >
    <template v-slot:no-data>
      <div
        class="d-flex justify-center"
      >
        <div
          class="d-flex-column align-center justify-center pa-2"
        >
          <div>
            Motivo não encontrado
            <v-icon
              class="ml-2"
              @click="refresh(true)"
            >
              mdi-refresh
            </v-icon>
          </div>
          <v-btn
            text
            small
            class="mx-auto"
            @click="$router.push({ name: 'cadastro', params: { table: 'motivo', openNew: true } })"
          >
            Cadastrar novo motivo
          </v-btn>
        </div>
      </div>
    </template>
  </v-autocomplete>
</template>

<script>
  import BluePrintValidate from '@/views/component/BluePrintValidate.vue'

  export default {
    extends: BluePrintValidate,
    props: {
      value: {
        type: Number,
        default: null,
      },
      icon: {
        type: String,
        default: 'mdi-database-search',
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      syncAtendimento: {
        type: Boolean,
        default: false,
      },
      cdatendimento: {
        type: Number,
        default: null,
      },
    },

    data () {
      return {
        loading: false,
        motivo: [],
        model: null,
      }
    },

    watch: {
      value (value) {
        if (value !== this.model) {
          this.model = value
        }
      },
    },

    mounted () {
      this.model = this.value
      this.refresh()
    },

    methods: {
      async change (value) {
        this.$emit('input', value)
        if (value && this.cdatendimento) {
          this.loading = true
          try {
            this.$store.dispatch('atendimentoChangeMotivo', {
              cdmotivo: value,
              cdatendimento: this.cdatendimento,
            })
          } finally {
            this.loading = false
          }
        }
      },

      async refresh (force = false) {
        try {
          this.loading = true
          const raw = (await this.$store.dispatch('allMeta', force)).motivo
          this.motivo = this.$raw2select(raw, 'cd', 'nmmotivo')
        } finally {
          this.loading = false
        }
      },
    },
  }
</script>
