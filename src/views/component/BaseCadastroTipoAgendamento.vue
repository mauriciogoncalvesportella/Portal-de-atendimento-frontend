<template>
  <div>
    <v-simple-table>
      <template #top>
        <div
          class="px-3 py-2 d-flex justify-space-between align-center primary white--text text-h5"
        >
          <span>
            Tipo Agendamento
          </span>
          <div>
            <v-tooltip
              bottom
            >
              <template
                #activator="{ on, attrs }"
              >
                <v-btn
                  fab
                  small
                  elevation="0"
                  class="mr-1 primary"
                  v-bind="attrs"
                  v-on="on"
                  @click="sortAlpha"
                >
                  <v-icon>
                    mdi-sort-alphabetical-ascending
                  </v-icon>
                </v-btn>
              </template>
              Ordernar alfabeticamente
            </v-tooltip>
            <v-dialog
              v-model="dialog"
              max-width="480"
            >
              <template #activator="{ on, attrs }">
                <v-btn
                  fab
                  small
                  elevation="0"
                  v-bind="attrs"
                  v-on="on"
                  @click="resetForm()"
                >
                  <v-icon
                    color="primary"
                  >
                    mdi-table-plus
                  </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <v-icon
                    class="mr-1"
                    color="primary"
                  >
                    mdi-table-{{ cd ? 'edit' : 'plus' }}
                  </v-icon>
                  {{ cd ? 'Editar' : 'Criar' }} Tipo Agendamento
                </v-card-title>
                <v-form
                  ref="form"
                  v-model="valid"
                >
                  <v-card-text>
                    <v-text-field
                      ref="nmtipoagendamento"
                      v-model="nmtipoagendamento"
                      label="Nome Tipo Agendamento"
                      :rules="[RREQUIRED]"
                      filled
                      validate-on-blur
                    />
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn
                      text
                      color="primary"
                      :loading="loading"
                      :disabled="!valid"
                      @click="save"
                    >
                      <v-icon
                        left
                      >
                        mdi-{{ cd ? 'content-save' : 'table-plus' }}
                      </v-icon>
                      {{ cd ? 'Salvar' : 'Criar' }} Tipo Agendamento
                    </v-btn>
                  </v-card-actions>
                </v-form>
              </v-card>
            </v-dialog>
          </div>
        </div>
      </template>
      <template #default>
        <draggable
          v-model="items"
          ghost-class="ghost"
          tag="tbody"
          @change="saveOrder()"
        >
          <tr
            v-for="(item, i) in items"
            :key="`item-${item.cd}`"
            style="cursor: grab"
          >
            <td> {{ i + 1 }} </td>
            <td> {{ item.nmtipoagendamento }} </td>
            <td
              class="text-right"
            >
              <v-btn
                icon
                @click="openDialog(item.cd)"
              >
                <v-icon
                  color="primary"
                >
                  mdi-table-edit
                </v-icon>
              </v-btn>
              <v-btn
                icon
                class="ml-3"
                @click="destroy(item.cd)"
              >
                <v-icon
                  color="red"
                >
                  mdi-delete
                </v-icon>
              </v-btn>
            </td>
          </tr>
        </draggable>
      </template>
    </v-simple-table>
  </div>
</template>

<script>
  import draggable from 'vuedraggable'

  export default {
    components: {
      draggable,
    },

    data () {
      return {
        dialog: false,
        valid: true,
        items: [],
        loading: false,
        nmtipoagendamento: '',
        cd: null,
      }
    },

    created () {
      this.refresh()
    },

    methods: {
      async refresh (force = false) {
        this.items = await this.$store.dispatch('allTipoAgendamento', force)
        this.items.sort((a, b) => a.nordem - b.nordem)
      },

      async save () {
        this.loading = true
        try {
          if (this.$refs.form.validate()) {
            const tipoAgendamento = {
              nmtipoagendamento: this.nmtipoagendamento,
            }
            if (this.cd) {
              tipoAgendamento.cd = this.cd
            }
            await this.$store.dispatch('addTipoAgendamento', [tipoAgendamento])
            await this.refresh(true)
          }
        } finally {
          this.dialog = false
          this.loading = false
        }
      },

      async destroy (cd) {
        try {
          await this.$store.dispatch('deleteTipoAgendamento', cd)
          await this.refresh(true)
        } catch (err) {
          this.$notifier({ content: 'Impossível Remover Tipo Agendamento com Evento vinculado', color: 'orange' })
        }
      },

      async saveOrder () {
        for (const [i, tipoagendamento] of Object.entries(this.items)) {
          tipoagendamento.nordem = i
        }
        await this.$store.dispatch('updateTipoAgendamento', this.items)
      },

      async sortAlpha () {
        this.items.sort((a, b) => {
          if (a.nmtipoagendamento < b.nmtipoagendamento) {
            return -1
          }
          if (a.nmtipoagendamento > b.nmtipoagendamento) {
            return 1
          }
          return 0
        })
        await this.saveOrder()
      },

      openDialog (cd) {
        if (cd == null) {
          this.resetForm()
        } else {
          this.valid = true
          this.cd = cd
          const tipoagendamento = this.items.find(item => item.cd === this.cd)
          this.nmtipoagendamento = tipoagendamento.nmtipoagendamento
        }
        this.dialog = true
      },

      resetForm () {
        this.cd = null
        this.nmtipoagendamento = ''
        if (this.$refs.form) {
          this.$refs.form.reset()
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  tbody {
     tr:hover {
        background-color: transparent !important;
     }
  }
  .ghost {
    background: rgba(120, 120, 120, 0.25) !important;
    /*border: 0.5px solid red !important;*/
    /*border-style: dashed !important;*/
    color: rgba(0, 0, 0, 0.25) !important;
    /*outline: 1px dashed red;*/
    box-shadow: 0 0 3px #ddd;
    /*box-shadow:0px 0px 0px 10px black inset;*/
  }
</style>
