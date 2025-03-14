<template>
  <v-dialog
    v-model="dialog"
    max-width="480"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        fab
        light
        small
        elevation="0"
        color="white"
        v-bind="attrs"
        v-on="on"
      >
        <v-icon
          color="primary"
        >
          mdi-account-plus
        </v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <v-icon
          class="mr-1"
          color="indigo"
        >
          mdi-account-plus
        </v-icon>
        Novo Usuário
      </v-card-title>

      <v-form
        ref="form"
        v-model="valid"
      >
        <v-card-text class="ma-0">
          <v-text-field
            v-model="idlogin"
            label="Login"
            :rules="[RREQUIRED, RMIN(5), RNOSPECIAL]"
            validate-on-blur
          />

          <v-text-field
            v-model="idsenha"
            label="Senha"
            type="password"
            :rules="[RREQUIRED, RMIN(5)]"
            validate-on-blur
          />

          <v-text-field
            v-model="idnome"
            label="Nome"
            :rules="[RREQUIRED, RNAME, RNODOUBLESPACE, RMIN(5)]"
            validate-on-blur
          />

          <v-text-field
            v-model="idemail"
            label="Email"
            type="email"
            :rules="[RREQUIRED, REMAIL]"
            validate-on-blur
          />
          <v-checkbox
            v-model="checkBox"
            label="Administrador"
          />
        </v-card-text>
        <v-card-actions
          class="ma-0"
        >
          <v-spacer />
          <v-btn
            text
            :disabled="!valid"
            :loading="loading"
            color="primary"
            @click="send"
          >
            Enviar
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    name: 'BaseNovoUsuario',
    data () {
      return {
        dialog: false,
        valid: true,
        loading: false,
        idlogin: '',
        idnome: '',
        idsenha: '',
        idemail: '',
        checkBox: false,
      }
    },

    methods: {
      async send () {
        this.loading = true
        let check = true;
        [
          'idlogin',
          'idnome',
          'idsenha',
          'idemail',
        ].forEach(id => {
          if (this[id] === '') {
            this.$notifier({ content: 'Campos inválidos', color: 'red' })
            check = false
          }
        })

        try {
          if (check) {
            await this.$store.dispatch('createUser', {
              idlogin: this.idlogin,
              idsenha: this.idsenha,
              idemail: this.idemail,
              idnome: this.idnome,
            })

            this.$emit('send')
            this.$notifier({ content: 'Usuário criado', color: 'green' })
          }
          this.dialog = false
        } finally {
          this.loading = false
        }
      },
    },
  }
</script>
