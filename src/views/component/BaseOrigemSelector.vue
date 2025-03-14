<template>
  <v-autocomplete
    v-model="model"
    :loading="false"
    :items="origemList"
    :filled="filled"
    :class="!errMsg ? 'mb-2' : ''"
    hide-details="auto"
    prepend-inner-icon="mdi-database-search"
    chips
    small-chips
    label="Origens"
    :multiple="false"
    validate-on-blur
    @change="$emit('input', model)"
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
        default: -1,
      },
      filled: {
        type: Boolean,
        default: false,
      },
    },

    data () {
      return {
        loading: false,
        model: null,
        origemList: [],
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
      async refresh () {
        try {
          this.model = null
          const raw = await this.$store.dispatch('allOrigem', { force: false, select: true })
          raw.sort((a, b) => a.nordem - b.nordem)
          this.origemList = this.$raw2select(raw, 'cd', 'nmorigem')
        } finally {
          this.loading = false
        }
      },

      clear () {
        this.model = null
      },
    },
  }
</script>
