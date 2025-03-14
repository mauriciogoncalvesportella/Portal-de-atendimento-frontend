<template>
  <div>
    <v-simple-table>
      <template #top>
        <div
          class="px-3 py-2 d-flex justify-space-between align-center primary white--text text-h5"
        >
          <span>
            Urgências
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
                  {{ cd ? 'Editar' : 'Criar' }} Urgência
                </v-card-title>
                <v-form
                  ref="form"
                  v-model="valid"
                >
                  <v-card-text>
                    <v-text-field
                      v-model="nmurgencia"
                      label="Nome Urgência"
                      :rules="[RREQUIRED]"
                      filled
                      validate-on-blur
                    />
                    <v-text-field
                      v-model="nprevisao"
                      label="Previsão máxima em dias"
                      filled
                      type="number"
                      max="15"
                      min="1"
                      :rules="[RREQUIRED]"
                      validate-on-blur
                    />
                    <v-text-field
                      v-model.lazy="idcolor"
                      label="Código cor"
                      :rules="[RREQUIRED]"
                      filled
                      read-only
                      validate-on-blur
                    >
                      <template #append>
                        <v-icon
                          size="15"
                          :color="idcolor"
                          right
                        >
                          mdi-checkbox-blank-circle
                        </v-icon>
                      </template>
                    </v-text-field>
                    <v-color-picker
                      v-model="idcolor"
                      class="mx-auto"
                      hide-inputs
                      mode="hexa"
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
                      {{ cd ? 'Salvar' : 'Criar' }} Urgência
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
            <td> {{ item.nmurgencia }} </td>
            <td
              class="text-center"
            >
              <v-chip
                v-if="item.nprevisao != null"
              >
                {{ item.nprevisao }} dia{{ item.nprevisao > 1 ? 's' : '' }}
              </v-chip>
            </td>
            <td
              class="text-center"
            >
              <v-icon
                :color="item.idcolor"
              >
                mdi-checkbox-blank-circle
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
        nmurgencia: '',
        nprevisao: null,
        idcolor: '',
        cd: null,
      }
    },

    watch: {
      nprevisao (val) {
        if (val < 1) {
          this.nprevisao = 1
        }
        if (val > 30) {
          this.nprevisao = 15
        }
      },
    },

    created () {
      this.refresh()
    },

    methods: {
      async refresh (force = false) {
        this.items = await this.$store.dispatch('allUrgencia', force)
        this.items.sort((a, b) => a.nordem - b.nordem)
      },

      async save () {
        this.loading = true
        try {
          if (this.$refs.form.validate()) {
            const urgencia = {
              nprevisao: parseInt(this.nprevisao),
              nmurgencia: this.nmurgencia,
              idcolor: this.idcolor,
            }
            if (this.cd) {
              urgencia.cd = this.cd
            }
            await this.$store.dispatch('addUrgencia', [urgencia])
            await this.refresh(true)
          }
        } finally {
          this.dialog = false
          this.loading = false
        }
      },

      async destroy (cd) {
        try {
          await this.$store.dispatch('deleteUrgencia', cd)
          await this.refresh(true)
        } catch (err) {
          this.$notifier({ content: 'Impossível Remover Urgência com Ticket vinculado', color: 'orange' })
        }
      },

      async saveOrder () {
        for (const [i, urgencia] of Object.entries(this.items)) {
          urgencia.nordem = i
        }
        await this.$store.dispatch('updateUrgencia', this.items)
      },

      async sortAlpha () {
        this.items.sort((a, b) => {
          if (a.nmurgencia < b.nmurgencia) {
            return -1
          }
          if (a.nmurgencia > b.nmurgencia) {
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
        const urgencia = this.items.find(item => item.cd === this.cd)
        this.nmurgencia = urgencia.nmurgencia
        this.idcolor = urgencia.idcolor
        this.nprevisao = urgencia.nprevisao
      },

      resetForm () {
        this.cd = null
        this.nmurgencia = ''
        this.idcolor = '#FFFFFFFF'
        this.nprevisao = null
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
