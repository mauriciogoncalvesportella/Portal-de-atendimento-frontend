<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="290"
  >
    <v-card>
      <v-subheader>
        {{ idFantasia }}
      </v-subheader>
      <v-card-text>
        <blue-print-input
          ref="idnomeInput"
          v-slot="{ errorMessages }"
          v-model="idNome"
          :rules="[RONLYLETTERUPPER]"
        >
          <v-text-field
            v-model="idNome"
            dense
            maxlength="10"
            label="Apelido"
            placeholder="PITAYA"
            style="text-transform: uppercase;"
            messages="Somente letras maiúsculas"
            :error-messages="errorMessages"
            filled
            @keyup="updateIdNome"
          />
        </blue-print-input>
        <blue-print-input
          ref="idfoneInput"
          v-slot="{ errorMessages }"
          v-model="idFone"
          :rules="[RONLYNUMBERS]"
        >
          <v-text-field
            v-model="idFone"
            messages="Inicie o número com DDD, use apenas números"
            label="Telefone"
            maxlength="12"
            placeholder="47999999999"
            :error-messages="errorMessages"
            pattern="[0-9]+"
            dense
            filled
          />
        </blue-print-input>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="red darken-1"
          text
          @click="dialog = false"
        >
          Fechar
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary darken-1"
          text
          :loading="loading"
          @click="save"
        >
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import API from '@/api/'
  export default {
    data: () => ({
      openAs: '',
      idNome: '',
      idFone: '',
      idFantasia: '',
      dialog: false,
      obj: {},
      foneIndex: -1,
      loading: false,
    }),

    methods: {
      formValidate () {
        let ret = true;
        [
          'idnomeInput',
          'idfoneInput',
        ].forEach(it => {
          if (!this.$refs[it].validate()) {
            ret = false
          }
        }, this)

        return ret
      },

      openEdit (obj, foneIndex) {
        this.dialog = true
        this.openAs = 'EDIT'
        this.idNome = obj.chaveFones[foneIndex].idnome
        this.idFone = obj.chaveFones[foneIndex].fone
        this.idFantasia = obj.idfantasia
        this.obj = obj
        this.foneIndex = foneIndex
      },

      openNew (obj) {
        this.dialog = true
        this.openAs = 'NEW'
        this.idNome = ''
        this.idFone = ''
        this.idFantasia = obj.idfantasia
        this.obj = obj
        this.foneIndex = -1
      },

      updateIdNome () {
        this.idNome = this.idNome?.toUpperCase() ?? ''
      },

      async save () {
        if (this.formValidate()) {
          this.loading = true
          if (this.openAs === 'NEW') {
            try {
              const chaveFone = await API.Chave.createChaveFone({
                cdchave: this.obj.cd,
                fone: this.idFone,
                idnome: this.idNome,
              })
              this.obj.chaveFones.push(chaveFone)
              this.dialog = false
            } finally {
              this.loading = false
            }
          } else if (this.openAs === 'EDIT') {
            try {
              const chaveFone = this.obj.chaveFones[this.foneIndex]
              await API.Chave.updateChaveFone({
                cd: chaveFone.cd,
                fone: this.idFone,
                idnome: this.idNome,
              })
              chaveFone.fone = this.idFone
              chaveFone.idnome = this.idNome
              this.dialog = false
            } finally {
              this.loading = false
            }
          }
        }
      },
    },
  }
</script>
