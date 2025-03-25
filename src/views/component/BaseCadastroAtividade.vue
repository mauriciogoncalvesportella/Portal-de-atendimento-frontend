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
                <v-card-title class="primary white--text">
                  <v-icon
                    class="mr-1"
                    color="white"
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
                    <!-- Campo de título no topo -->
                    <v-text-field
                      v-model="nmurgencia"
                      label="Título"
                      :rules="[RREQUIRED]"
                      filled
                      validate-on-blur
                    />
                    
                    <!-- Seção de tarefas logo após o título -->
                    <div class="mt-4 mb-2">
                      <div class="d-flex justify-space-between align-center mb-2">
                        <div class="subtitle-1 font-weight-medium">Tarefas</div>
                        <v-btn
                          color="primary"
                          small
                          text
                          @click="adicionarTarefa"
                        >
                          <v-icon left small>mdi-plus</v-icon>
                          ADICIONAR TAREFA
                        </v-btn>
                      </div>
                      
                      <div v-if="tarefas.length === 0" class="text-center grey--text pa-4">
                        Nenhuma tarefa adicionada
                      </div>
                      
                      <div v-for="(tarefa, index) in tarefas" :key="`tarefa-${index}`" class="d-flex align-center mb-2">
                        <v-checkbox
                          v-model="tarefa.concluida"
                          :color="idcolor || '#1976D2'"
                          class="mr-2"
                          hide-details
                          dense
                        ></v-checkbox>
                        <v-text-field
                          v-model="tarefa.texto"
                          label="Descrição da tarefa"
                          outlined
                          dense
                          hide-details
                          class="flex-grow-1"
                        ></v-text-field>
                        <v-btn
                          icon
                          small
                          class="ml-1"
                          @click="removerTarefa(index)"
                        >
                          <v-icon small color="red">mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </div>
                    
                    <!-- Separador visual -->
                    <v-divider class="my-4"></v-divider>
                    
                    <!-- Demais campos do formulário -->
                    <v-text-field
                      v-model="nprevisao"
                      label="Previsão de Conclusão Máxima"
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
                      {{ cd ? 'SALVAR URGÊNCIA' : 'CRIAR URGÊNCIA' }}
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
        // Array para armazenar as tarefas do usuário
        tarefas: [],
        RREQUIRED: value => !!value || 'Campo obrigatório',
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
        try {
          this.items = await this.$store.dispatch('allUrgencia', force)
          this.items.sort((a, b) => a.nordem - b.nordem)
          
          // Assegure-se de que todas as urgências têm uma cor definida
          this.items.forEach(item => {
            if (!item.idcolor) {
              item.idcolor = '#1976D2' // Cor padrão se não houver cor definida
            }
          })
        } catch (error) {
          console.error('Erro ao carregar urgências:', error)
          this.$notifier({ content: 'Erro ao carregar urgências', color: 'error' })
        }
      },

      // Métodos para gerenciar as tarefas
      adicionarTarefa() {
        this.tarefas.push({
          texto: '',
          concluida: false
        })
      },

      removerTarefa(index) {
        this.tarefas.splice(index, 1)
      },

      async save () {
        this.loading = true
        try {
          if (this.$refs.form.validate()) {
            // Prepara os dados da urgência
            const urgencia = {
              nprevisao: parseInt(this.nprevisao),
              nmurgencia: this.nmurgencia,
              idcolor: this.idcolor,
            }
            
            // Adiciona o campo de tarefas como JSON string
            if (this.tarefas.length > 0) {
              // Verifica se você já tem uma coluna tarefas ou precisa usar json_extras
              // Adapte conforme a estrutura do seu banco de dados
              urgencia.tarefas = JSON.stringify(this.tarefas)
              
              // Alternativa: se você tiver um campo de metadados/extras genérico
              if (!urgencia.json_extras) {
                urgencia.json_extras = {}
              } else if (typeof urgencia.json_extras === 'string') {
                try {
                  urgencia.json_extras = JSON.parse(urgencia.json_extras)
                } catch (e) {
                  urgencia.json_extras = {}
                }
              }
              
              urgencia.json_extras.tarefas = this.tarefas
              urgencia.json_extras = JSON.stringify(urgencia.json_extras)
            }
            
            if (this.cd) {
              urgencia.cd = this.cd
            }
            
            // Adiciona informações de debug para verificar o que está sendo enviado
            console.log('Salvando urgência:', JSON.stringify(urgencia))
            
            // Tenta salvar e verifica o resultado
            const resultado = await this.$store.dispatch('addUrgencia', [urgencia])
            console.log('Resultado do salvamento:', resultado)
            
            await this.refresh(true)
            this.$notifier({ content: 'Urgência salva com sucesso!', color: 'success' })
          }
        } catch (error) {
          console.error('Erro ao salvar urgência:', error)
          this.$notifier({ content: 'Erro ao salvar urgência: ' + (error.message || error), color: 'error' })
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
        try {
          await this.$store.dispatch('updateUrgencia', this.items)
        } catch (error) {
          console.error('Erro ao salvar ordem:', error)
          this.$notifier({ content: 'Erro ao atualizar ordem das urgências', color: 'error' })
        }
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
        this.idcolor = urgencia.idcolor || '#1976D2' // Garante que sempre há uma cor
        this.nprevisao = urgencia.nprevisao
        
        // Tenta carregar as tarefas de diferentes possíveis campos
        try {
          // Tentativa 1: Carregar do campo tarefas (se for string JSON)
          if (urgencia.tarefas && typeof urgencia.tarefas === 'string') {
            this.tarefas = JSON.parse(urgencia.tarefas)
          } 
          // Tentativa 2: Carregar do campo json_extras (se existir)
          else if (urgencia.json_extras) {
            let extras = urgencia.json_extras
            if (typeof extras === 'string') {
              extras = JSON.parse(extras)
            }
            
            if (extras.tarefas) {
              this.tarefas = extras.tarefas
            } else {
              this.tarefas = []
            }
          } else {
            this.tarefas = []
          }
        } catch (e) {
          console.error('Erro ao carregar tarefas:', e)
          this.tarefas = []
        }
      },

      resetForm () {
        this.cd = null
        this.nmurgencia = ''
        this.idcolor = '#FFFFFFFF'
        this.nprevisao = null
        this.tarefas = [] // Reiniciar o array de tarefas
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