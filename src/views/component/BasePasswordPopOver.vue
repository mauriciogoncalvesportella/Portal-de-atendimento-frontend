<template>
  <v-menu
    v-model="menu"
    :close-on-click="true"
    :close-on-content-click="false"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        text
        color="red"
        :disabled="disabled"
        v-on="on"
      >
        <v-icon
          class="mr-1"
          size="15"
        >
          mdi-shield-lock
        </v-icon>
        Trocar senha
      </v-btn>
    </template>

    <v-card
      :width="width"
    >
      <v-card-title>
        Trocar senha
      </v-card-title>
      <v-form
        ref="form"
        v-model="valid"
        :lazy-validation="true"
      >
        <v-card-text>
          <v-text-field
            v-model="idsenha"
            label="Nova senha"
            :rules="[ RREQUIRED, RMIN(5) ]"
            :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
            :type="show ? 'text' : 'password'"
            required
            @click:append="show = !show"
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
            :disabled="!valid"
            :loading="loading"
            @click="save"
          >
            Enviar
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-menu>
</template>

<script>
  export default {
    props: {
      cd: {
        type: Number,
        default: null,
      },
      width: {
        type: Number,
        default: 350,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },

    data () {
      return {
        valid: false,
        menu: false,
        loading: false,
        idsenha: '',
        show: false,
      }
    },

    methods: {
      async save () {
        if (this.$refs.form.validate()) {
          try {
            this.loading = true
            this.$store.dispatch('userUpdate', {
              cd: this.cd,
              idsenha: this.idsenha,
            })
            this.menu = false
          } finally {
            this.$notifier({ content: 'Senha alterada com sucesso', color: 'primary', valign: 'bottom' })
            this.loading = false
          }
        }
      },
    },
  }
</script>
