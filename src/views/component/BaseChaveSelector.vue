<template>
  <v-autocomplete
    v-model="model"
    :loading="false"
    :items="chaves"
    :disabled="disabled"
    :prepend-inner-icon="prependIcon"
    :error-messages="errMsg"
    hide-details="auto"
    filled
    :label="label"
    :multiple="multiple"
    :dense="dense"
    validate-on-blur
    @change="changeHandle"
  />
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
        default: 'Cliente',
      },
      dense: {
        type: Boolean,
        defautl: false,
      },
    },

    data () {
      return {
        loading: false,
        chaves: [],
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

      async refresh () {
        try {
          this.chaves = await this.$store.dispatch('allChaves')
          this.chaves = this.$raw2select(this.chaves, 'cd', 'idfantasia')
        } finally {
          this.loading = false
        }
      },

      async changeHandle () {
        this.$emit('input', this.model)
        this.$emit('change')
      },
    },
  }
</script>
