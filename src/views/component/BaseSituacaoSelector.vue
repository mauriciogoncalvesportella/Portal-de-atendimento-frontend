<template>
  <v-autocomplete
    v-model="model"
    :loading="loading"
    :items="situacao"
    :error-messages="errMsg"
    :disabled="disabled"
    :label="label"
    :class="!errMsg ? 'mb-2' : ''"
    hide-details="auto"
    dense
    chips
    small-chips
    filled
    @change="$emit('input', model); $emit('change', model)"
  >
    <template v-slot:selection="data">
      <v-chip
        small
      >
        <v-icon
          size="15"
          left
        >
          {{ data.item.raw.idicon }}
        </v-icon>
        {{ data.item.text }}
      </v-chip>
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
      label: {
        type: String,
        default: 'Situacão',
      },
    },

    data () {
      return {
        loading: false,
        model: [],
        situacao: [],
      }
    },

    watch: {
      value (newValue) {
        this.model = newValue
      },
    },

    mounted () {
      this.model = this.value
      this.refresh()
    },

    methods: {
      async refresh () {
        try {
          this.loading = true
          const raw = (await this.$store.dispatch('allMeta')).situacao.sort((a, b) => a.nordem - b.nordem)
          this.situacao = this.$raw2select(raw, 'cd', 'nmsituacao')
        } finally {
          this.loading = false
        }
      },
    },
  }
</script>
