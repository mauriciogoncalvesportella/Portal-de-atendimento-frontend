<template>
  <v-autocomplete
    v-model="model"
    :items="clientes"
    :prepend-inner-icon="icon"
    :error-messages="errMsg"
    :dense="dense"
    chips
    small-chips
    hide-details="auto"
    :solo="solo"
    :label="(multiple) ? 'Clientes' : 'Cliente'"
    :multiple="multiple"
    :filled="filled"
    @change="$emit('input', model)"
  />
</template>

<script>
  import BluePrintValidate from '@/views/component/BluePrintValidate.vue'
  export default {
    extends: BluePrintValidate,
    props: {
      value: {
        type: [Array, Number],
        default: null,
      },
      multiple: {
        type: Boolean,
        default: true,
      },
      icon: {
        type: String,
        default: 'mdi-database-search',
      },
      solo: {
        type: Boolean,
        default: false,
      },
      filled: {
        type: Boolean,
        default: false,
      },
      dense: {
        type: Boolean,
        default: true,
      },
    },

    data () {
      return {
        model: null,
        clientes: [],
      }
    },

    mounted () {
      this.model = this.value
      this.refresh()
    },

    methods: {
      newValue (val) {
        this.model = val
      },

      async refresh () {
        try {
          this.clientes = await this.$store.dispatch('nomeClientes')
        } catch (err) {
        }
      },
    },
  }
</script>
