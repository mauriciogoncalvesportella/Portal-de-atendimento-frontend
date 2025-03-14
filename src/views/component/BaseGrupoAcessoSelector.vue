<template>
  <v-autocomplete
    v-model="model"
    :loading="false"
    :items="list"
    prepend-icon="mdi-badge-account-horizontal"
    label="Perfil de Acesso"
    :multiple="false"
    validate-on-blur
    solo
    :rules="rules"
    @change="$emit('input', model)"
  >
    <template v-slot:selection="data">
      <v-chip
        small
        color="white"
        light
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
  export default {
    props: {
      value: {
        type: Number,
        default: -1,
      },
      rules: {
        type: Array,
        default: () => [],
      },
    },

    data () {
      return {
        loading: false,
        model: null,
        list: [],
      }
    },

    watch: {
      value (val) {
        this.model = val
      },
    },

    mounted () {
      this.refresh()
    },

    methods: {
      async refresh () {
        try {
          this.model = null
          const raw = await this.$store.dispatch('allGrupoAcesso')
          this.list = this.$raw2select(raw, 'cd', 'idnome')
          if (this.value) {
            this.model = this.value
          }
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
