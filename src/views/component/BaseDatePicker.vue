<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    min-width="290"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        :value="dateTextField"
        :label="componentProps.label"
        :error-messages="errorText"
        :loading="loading"
        :filled="componentProps.filled"
        :solo="componentProps.solo"
        :placeholder="componentProps.placeholder"
        :disabled="disabled"
        :class="!errorText ? 'mb-2' : ''"
        hide-details="auto"
        validate-on-blur
        dense
        small
        :prepend-inner-icon="prependIcon"
        readonly
        v-on="on"
      />
    </template>
    <v-date-picker
      v-model="model"
      :disabled="disabled"
      locale="pt-br"
      no-title
      scrollable
      :range="range"
      :allowed-dates="allowedDates"
      @change="changeDate(model)"
    >
      <template v-if="showActions">
        <v-btn
          text
          color="warning"
          @click="clear"
        >
          Limpar
        </v-btn>
        <v-spacer />
        <v-btn
          text
          color="primary"
          @click="menu = false"
        >
          Fechar
        </v-btn>
      </template>
    </v-date-picker>
  </v-menu>
</template>

<script>
  import BluePrintValidate from '@/views/component/BluePrintValidate'

  export default {
    extends: BluePrintValidate,
    props: {
      value: {
        type: [Array, String],
        default: () => [],
      },
      range: {
        type: Boolean,
        default: false,
      },
      validOnlyRange: {
        type: Boolean,
        default: false,
      },
      showActions: {
        type: Boolean,
        default: true,
      },
      showDayText: {
        type: Boolean,
        default: false,
      },
      filled: {
        type: Boolean,
        default: true,
      },
      allowedDates: {
        type: Function,
        default: () => val => true,
      },
      componentProps: {
        type: Object,
        default: () => {
          return {
            filled: true,
            solo: false,
            label: 'Data',
            placeholder: '',
          }
        },
      },
      prependIcon: {
        type: String,
        default: 'mdi-calendar',
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      errorMessages: {
        type: String,
        default: null,
      },
    },

    data () {
      return {
        menu: false,
        checkFirst: false,
        ErrorMessages: '',
      }
    },

    computed: {
      dateTextField () {
        const fn = (str) => {
          const [year, month, day] = str.split('-')
          const dayText = (this.showDayText) ? ` ${this.$moment(str).format('dddd')}` : ''
          return `${day}/${month}/${year}${dayText}`
        }

        if (this.range) {
          return this.model?.map(da => {
            return fn(da)
          }).join(' ~ ')
        } else if (this.model) {
          return fn(this.model)
        }

        return ''
      },
      loading () {
        return (this.range) ? (this.model.length <= 0) : (this.model === '0000-00-00')
      },
      errorText () {
        if (this.errorMessages) {
          return this.errorMessages
        }
        if (this.errMsg) {
          return this.errMsg
        }
        return null
      },
    },

    watch: {
      errorMessages (val) {
        this.ErrorMessages = val
      },

      model: function (value) {
        if (value && this.range && value.length > 1) {
          if (value[0] === value[1]) {
            value.pop()
          } else if (value[0] > value[1]) {
            [value[0], value[1]] = [value[1], value[0]]
          }
        }

        if (!value && this.range) {
          this.ErrorMessages = 'Data inválida'
        } else if (value && value.length <= 1 && this.validOnlyRange) {
          this.ErrorMessages = 'Selecione duas datas'
        } else {
          this.ErrorMessages = ''
        }

        this.$emit('input', this.model)
        if (!this.showActions) {
          this.menu = false
        }
      },

      value: function (val) {
        if (!this.checkFirst || !this.showActions) {
          this.checkFirst = true
          this.model = this.range ? [...this.value] : this.value
        }
      },
    },

    created () {
      if (this.value) {
        this.model = this.value
      }
    },

    methods: {
      newValue (val) {
        this.model = val
      },

      clear () {
        this.model = this.range ? [] : null
      },

      changeDate (date) {
        this.$emit('change-date', date)
      },
    },
  }
</script>
