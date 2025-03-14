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
          color="primary"
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
            prepend-icon="mdi-account-circle"
            filled
            validate-on-blur
          />

          <grupo-acesso-selector
            v-model="grupoacesso"
            :rules="[RREQUIRED]"
          />

          <v-text-field
            v-model="idsenha"
            label="Senha"
            type="password"
            prepend-icon="mdi-account-key"
            :rules="[RREQUIRED, RMIN(5)]"
            validate-on-blur
            filled
          />

          <v-text-field
            v-model="idnome"
            label="Nome"
            prepend-icon="mdi-account-details"
            :rules="[RREQUIRED, RNAME, RNODOUBLESPACE, RMIN(5)]"
            validate-on-blur
            filled
          />

          <v-text-field
            v-model="idemail"
            label="Email"
            type="email"
            prepend-icon="mdi-card-account-mail"
            :rules="[RREQUIRED, REMAIL]"
            validate-on-blur
            filled
          />

          <color-picker
            ref="idcolor"
            v-model="idcolor"
          />

          <div
            class="d-flex justify-space-around"
          >
            <div
              v-for="(turno, i) in jsturnos"
              :key="`turno-${i}`"
              class="d-flex flex-column font-weight-light"
            >
              {{ i === 0 ? 'Primeiro' : 'Segundo' }} turno
              <v-divider />
              <div
                class="d-flex"
              >
                <v-text-field
                  v-model="turno.dtinicio"
                  type="time"
                  class="mr-1"
                  dense
                />
                <v-text-field
                  v-model="turno.dtfim"
                  type="time"
                  class="ml-1"
                  dense
                />
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions
          class="ma-0"
        >
          <v-spacer />
          <v-btn
            text
            :disabled="!valid || !checkTurnos"
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
  import ColorPicker from '@/views/component/BaseColorPicker'
  export default {
    name: 'BaseNovoUsuario',
    components: {
      GrupoAcessoSelector: () => import('@/views/component/BaseGrupoAcessoSelector.vue'),
      ColorPicker,
    },

    data () {
      return {
        dialog: false,
        valid: true,
        loading: false,
        idlogin: '',
        idnome: '',
        idsenha: '',
        idemail: '',
        idcolor: '',
        grupoacesso: null,
        jsturnos: [{ dtinicio: '08:00', dtfim: '12:00' }, { dtinicio: '13:15', dtfim: '18:00' }],
      }
    },

    computed: {
      checkTurnos () {
        return this.jsturnos[0]?.dtinicio &&
          this.jsturnos[0]?.dtfim &&
          this.jsturnos[1]?.dtinicio &&
          this.jsturnos[1]?.dtfim
      },
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
          'idcolor',
          'grupoacesso',
        ].forEach(id => {
          if (this[id] === '') {
            this.$notifier({ content: 'Campos inválidos', color: 'red' })
            check = false
          }
        })

        try {
          if (check) {
            const user = await this.$store.dispatch('createUser', {
              idlogin: this.idlogin,
              idsenha: this.idsenha,
              idemail: this.idemail,
              idnome: this.idnome,
              grupoacesso: this.grupoacesso,
              jsturnos: this.jsturnos,
              idcolor: this.idcolor,
            })
            this.$emit('userCreated', user)
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
