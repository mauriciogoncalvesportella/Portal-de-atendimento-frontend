<template>
  <v-menu
    v-model="menu"
    :close-on-click="true"
    :close-on-content-click="false"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        icon
        color="primary"
        :disabled="disabled"
        v-on="on"
        @click="show"
      >
        <v-icon>
          mdi-account-plus
        </v-icon>
      </v-btn>
    </template>

    <v-card
      width="350"
    >
      <v-form
        ref="form"
        v-model="valid"
      >
        <v-card-title>
          Novo Solicitante
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="idsolicitante"
            label="ID Solicitante *"
            :rules="[RREQUIRED, RNOSPECIAL]"
            prepend-icon="mdi-account"
          />
          <v-text-field
            v-model="idgpacesso"
            label="Setor"
            :rules="[RNOSPECIAL]"
            prepend-icon="mdi-card-account-details"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn
            text
            color="red"
            @click="menu = false"
          >
            Cancelar
          </v-btn>
          <v-spacer />
          <v-btn
            text
            color="primary"
            :loading="loading"
            :disabled="!valid"
            @click="save"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-menu>
</template>

<script>
  export default {
    props: {
      cdchave: {
        type: Number,
        default: -1,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },

    data () {
      return {
        valid: true,
        menu: false,
        idgpacesso: null,
        idsolicitante: '',
        loading: false,
      }
    },

    methods: {
      async save () {
        try {
          this.loading = true
          const cdsolicitante = await this.$store.dispatch('addSolicitante', {
            idsolicitante: this.idsolicitante,
            idgpacesso: this.idgpacesso,
            cdchave: this.cdchave,
          })
          this.menu = false
          this.$emit('afterAdd', cdsolicitante)
        } finally {
          this.loading = false
        }
      },

      show () {
        if (this.$refs.form) {
          this.$refs.form.reset()
        }
        this.idsolicitante = ''
        this.idgpacesso = ''
      },
    },
  }
</script>
