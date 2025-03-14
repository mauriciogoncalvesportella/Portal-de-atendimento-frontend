<template>
  <div>
    <v-simple-table>
      <template #top>
        <div
          class="px-3 py-2 d-flex justify-space-between align-center primary white--text text-h5"
        >
          <span>
            Motivos
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
                    color="indigo"
                  >
                    mdi-table-{{ cd ? 'edit' : 'plus' }}
                  </v-icon>
                  {{ cd ? 'Editar' : 'Criar' }} Motivo
                </v-card-title>
                <v-form
                  ref="form"
                  v-model="valid"
                >
                  <v-card-text>
                    <v-text-field
                      ref="nmmotivo"
                      v-model="nmmotivo"
                      label="Nome Motivo"
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
                      {{ cd ? 'Salvar' : 'Criar' }} Motivo
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
            <td> {{ item.nmmotivo }} </td>
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
        nmmotivo: '',
        cd: null,
      }
    },

    computed: {
      appendIcon () {
        return (this.idicon?.includes('mdi-') ? this.idicon : '')
      },

      openNew () {
        return this.props?.openNew
      },
    },

    watch: {
      dialog (value) {
        if (value) {
          this.$nextTick(() => {
            // this.$refs.nmmotivo
          })
        }
      },
    },

    created () {
      this.refresh()
    },

    methods: {
      async refresh (force = false) {
        this.items = await this.$store.dispatch('allMotivo', force)
        this.items.sort((a, b) => a.nordem - b.nordem)
      },

      async save () {
        this.loading = true
        try {
          if (this.$refs.form.validate()) {
            const motivo = {
              nmmotivo: this.nmmotivo,
            }
            if (this.cd) {
              motivo.cd = this.cd
            }
            await this.$store.dispatch('addMotivo', [motivo])
            await this.refresh(true)
          }
        } finally {
          this.dialog = false
          this.loading = false
        }
      },

      async destroy (cd) {
        try {
          await this.$store.dispatch('deleteMotivo', cd)
          await this.refresh(true)
        } catch (err) {
          this.$notifier({ content: 'Impossível Remover Motivo com Atendimento vinculado', color: 'orange' })
        }
      },

      async saveOrder () {
        for (const [i, motivo] of Object.entries(this.items)) {
          motivo.nordem = i
        }
        await this.$store.dispatch('updateMotivo', this.items)
      },

      async sortAlpha () {
        this.items.sort((a, b) => {
          if (a.nmmotivo < b.nmmotivo) {
            return -1
          }
          if (a.nmmotivo > b.nmmotivo) {
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
          const motivo = this.items.find(item => item.cd === this.cd)
          this.nmmotivo = motivo.nmmotivo
        }
        this.dialog = true
      },

      resetForm () {
        this.cd = null
        this.nmmotivo = ''
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
