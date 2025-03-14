<template>
  <v-autocomplete
    v-model="model"
    :loading="false"
    :items="tipoAgendamentoList"
    :disabled="disabled"
    :prepend-inner-icon="prependIcon"
    :error-messages="errMsg"
    dense
    small
    filled
    :label="label"
    :multiple="multiple"
    validate-on-blur
    hide-details="auto"
    @change="$emit('input', model); $emit('change', $event)"
  >
    <template v-slot:no-data>
      <div
        class="d-flex justify-center"
      >
        <div
          class="d-flex flex-column align-center justify-center pa-2"
        >
          <div>
            Motino não encontrado
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
            @click="$router.push({ name: 'cadastro', params: { table: 'tipo-agendamento' } })"
          >
            Cadastrar novo
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
        type: [Number, Array],
        default: () => null,
      },
      multiple: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      prependIcon: {
        type: String,
        default: '',
      },
      allOption: {
        type: Boolean,
        default: false,
      },
      label: {
        type: String,
        default: 'Tipo de Agendamento',
      },
    },

    data () {
      return {
        loading: false,
        tipoAgendamentoList: [],
      }
    },

    watch: {
      value (newValue) {
        this.model = newValue
      },
    },

    mounted () {
      this.refresh()
    },

    methods: {
      async newValue (val) {
        this.model = val
      },

      async refresh (force = false) {
        try {
          this.tipoAgendamentoList = await this.$store.dispatch('allTipoAgendamento', force)
          this.tipoAgendamentoList.sort((a, b) => a.nordem - b.nordem)
          this.tipoAgendamentoList = this.$raw2select(this.tipoAgendamentoList, 'cd', 'nmtipoagendamento')
        } finally {
          this.loading = false
        }
      },
    },
  }
</script>
