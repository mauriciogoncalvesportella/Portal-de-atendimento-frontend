<template>
  <div>
    <v-simple-table>
      <template #top>
        <div
          class="px-3 py-2 d-flex justify-space-between align-center primary white--text text-h5"
        >
          <span>
            Situações
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
                  {{ cd ? 'Editar' : 'Criar' }} Situacao
                </v-card-title>
                <v-form
                  ref="form"
                  v-model="valid"
                >
                  <v-card-text>
                    <v-text-field
                      v-model="nmsituacao"
                      label="Nome Situacao"
                      :rules="[RREQUIRED]"
                      filled
                      validate-on-blur
                    />
                    <v-text-field
                      v-model.lazy="idicon"
                      label="Código ícone"
                      :rules="[RREQUIRED]"
                      :append-icon="appendIcon"
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
                      {{ cd ? 'Salvar' : 'Criar' }} Situacao
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
            <td> {{ item.nmsituacao }} </td>
            <td
              class="text-center"
            >
              <v-icon>
                {{ item.idicon }}
              </v-icon>
            </td>
            <td
              class="text-right"
            >
              <v-btn
                icon
                @click="openEdit(item.cd)"
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
        valid: true,
        items: [],
        loading: false,
        dialog: false,
        nmsituacao: '',
        idicon: '',
        cd: null,
      }
    },

    computed: {
      appendIcon () {
        return (this.idicon?.includes('mdi-') ? this.idicon : '')
      },
    },

    created () {
      this.refresh()
    },

    methods: {
      async refresh (force = false) {
        this.items = await this.$store.dispatch('allSituacao', force)
        this.items.sort((a, b) => a.nordem - b.nordem)
      },

      async save () {
        this.loading = true
        try {
          if (this.$refs.form.validate()) {
            const situacao = {
              nmsituacao: this.nmsituacao,
              idicon: this.idicon,
            }
            if (this.cd) {
              situacao.cd = this.cd
            }
            await this.$store.dispatch('addSituacao', [situacao])
            await this.refresh(true)
          }
        } finally {
          this.dialog = false
          this.loading = false
        }
      },

      async destroy (cd) {
        try {
          await this.$store.dispatch('deleteSituacao', cd)
          await this.refresh(true)
        } catch (err) {
          this.$notifier({ content: 'Impossível Remover Situacao com Ticket vinculado', color: 'orange' })
        }
      },

      async saveOrder () {
        for (const [i, situacao] of Object.entries(this.items)) {
          situacao.nordem = i
        }
        await this.$store.dispatch('updateSituacao', this.items)
      },

      async sortAlpha () {
        this.items.sort((a, b) => {
          if (a.nmsituacao < b.nmsituacao) {
            return -1
          }
          if (a.nmsituacao > b.nmsituacao) {
            return 1
          }
          return 0
        })
        await this.saveOrder()
      },

      openEdit (cd) {
        this.valid = true
        this.cd = cd
        this.dialog = true
        const situacao = this.items.find(item => item.cd === this.cd)
        this.nmsituacao = situacao.nmsituacao
        this.idicon = situacao.idicon
      },

      resetForm () {
        this.cd = null
        this.nmsituacao = ''
        this.idicon = ''
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
