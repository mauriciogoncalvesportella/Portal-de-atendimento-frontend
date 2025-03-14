<template>
  <v-autocomplete
    v-model="model"
    :loading="loading"
    :items="urgencia"
    :error-messages="errMsg"
    :disabled="disabled"
    :class="!errMsg ? 'mb-2' : ''"
    hide-details="auto"
    label="Urgência"
    dense
    chips
    small-chips
    filled
    @change="$emit('input', model)"
  >
    <template v-slot:selection="data">
      <v-chip
        small
      >
        <v-icon
          size="15"
          :color="data.item.raw.idcolor"
          left
        >
          mdi-checkbox-blank-circle
        </v-icon>
        {{ data.item.text }}
        ({{ data.item.raw.nprevisao }} dias)
      </v-chip>
    </template>

    <template
      v-slot:item="data"
      class="red"
    >
      <v-icon
        size="15"
        :color="data.item.raw.idcolor"
        left
      >
        mdi-checkbox-blank-circle
      </v-icon>
      {{ data.item.text }}
      <v-chip
        label
        class="ml-auto"
      >
        {{ data.item.raw.nprevisao }}
      </v-chip>
    </template>
  </v-autocomplete>
</template>

<script>
  import BluePrintValidate from '@/views/component/BluePrintValidate'
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
    },

    data () {
      return {
        loading: false,
        urgencia: [],
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
          const raw = (await this.$store.dispatch('allMeta')).urgencia
          raw.sort((a, b) => a.nordem - b.nordem)
          this.urgencia = this.$raw2select(raw, 'cd', 'nmurgencia')
        } finally {
          this.loading = false
        }
      },
    },
  }
</script>
