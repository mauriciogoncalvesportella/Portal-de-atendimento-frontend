<template>
  <v-autocomplete
    v-model="model"
    :loading="loading"
    :items="solicitantes"
    :prepend-inner-icon="icon"
    :error-messages="errMsg"
    :disabled="disabled"
    hide-details="auto"
    label="Solicitante"
    no-data-text="Não há solicitantes cadastrados"
    filled
    @change="change"
  >
    <!--template #selection="data">
      <v-chip small>
        <v-icon
          left
        >
          mdi-account
        </v-icon>
        {{ data.item.text }}
        <v-divider
          class="mx-5"
          vertical
        />

        <v-icon
          left
        >
          mdi-card-account-details
        </v-icon>
        {{ data.item.raw.idgpacesso || '...' }}
      </v-chip>
    </template-->
  </v-autocomplete>
</template>

<script>
  import BluePrintValidate from '@/views/component/BluePrintValidate.vue'

  export default {
    extends: BluePrintValidate,
    props: {
      value: {
        type: Object,
        default: () => {},
      },
      cdchave: {
        type: Number,
        default: -1,
      },
      icon: {
        type: String,
        default: 'mdi-database-search',
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },

    data () {
      return {
        loading: false,
        solicitantes: [],
        model: null,
      }
    },

    watch: {
      value (newValue) {
        this.model = newValue?.cd
        // this.model = newValue
        // this.refresh()
      },

      cdchave (newValue) {
        this.refresh()
      },
    },

    mounted () {
      // this.model = null
      this.refresh()
    },

    methods: {
      async newValue (val) {
        await this.refresh(true)
        const solicitante = this.solicitantes.find(it => it.value === val).raw
        this.$emit('input', solicitante)
        this.model = val
        // this.model = val
      },

      async refresh (force = false) {
        if (this.cdchave != null) {
          try {
            this.loading = true
            const raw = await this.$store.dispatch('allSolicitantesFromChave', { cdchave: this.cdchave, force })
            this.solicitantes = this.$raw2select(raw, 'cd', 'idsolicitante')
          } finally {
            this.loading = false
          }
        }
      },

      change () {
        const data = this.solicitantes.find(item => item.value === this.model)
        if (data) {
          this.$emit('input', data.raw)
        } else {
          this.model = null
          this.$emit('input', null)
        }
      },
    },
  }
</script>
