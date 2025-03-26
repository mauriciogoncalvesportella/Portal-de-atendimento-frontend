<template>
  <div>
    <v-simple-table>
      <template #top>
        <div
          class="px-3 py-2 d-flex justify-space-between align-center primary white--text text-h5"
        >
          <span>
            Cadastros de atividades
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
                  {{ cd ? 'Editar' : 'Criar' }} Atividade
                </v-card-title>
                
                <v-form
                  ref="form"
                  v-model="valid"
                >
                  <v-card-text>
                    <!-- Campo de título no topo -->
                    <v-text-field
                      v-model="nmatividade"
                      label="Título"
                      :rules="[RREQUIRED]"
                      filled
                      validate-on-blur
                    />
                    
                    <!-- Seção de assuntos logo após o título -->
                    <div class="mt-4 mb-2">
                      <div class="d-flex justify-space-between align-center mb-2">
                        <div class="subtitle-1 font-weight-medium">Assuntos</div>
                        <v-btn
                          color="primary"
                          small
                          text
                          @click="adicionarAssunto"
                        >
                          <v-icon left small>mdi-plus</v-icon>
                          ADICIONAR ASSUNTO
                        </v-btn>
                      </div>
                      
                      <div v-if="assuntos.length === 0" class="text-center grey--text pa-4">
                        Nenhum assunto adicionado
                      </div>
                      
                      <div v-for="(assunto, index) in assuntos" :key="`assunto-${index}`" class="d-flex align-center mb-2">
                        <v-checkbox
                          v-model="assunto.concluido"
                          :color="idcolor || '#1976D2'"
                          class="mr-2"
                          hide-details
                          dense
                        ></v-checkbox>
                        <v-text-field
                          v-model="assunto.texto"
                          label="Descrição do assunto"
                          outlined
                          dense
                          hide-details
                          class="flex-grow-1"
                        ></v-text-field>
                        <v-btn
                          icon
                          small
                          class="ml-1"
                          @click="removerAssunto(index)"
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
                      {{ cd ? 'SALVAR ATIVIDADE' : 'CRIAR ATIVIDADE' }}
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
            :key="`item-${item.id || item.cd}`"
            style="cursor: grab"
          >
            <td> {{ i + 1 }} </td>
            <td> {{ item.nmatividade || item.titulo || item.nmurgencia }} </td>
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
            <td class="text-center">
              <v-chip
                v-if="getAssuntosCount(item) > 0"
                class="ma-2"
                color="primary"
                outlined
              >
                <v-icon left small>
                  mdi-format-list-bulleted
                </v-icon>
                {{ getAssuntosCount(item) }} assunto{{ getAssuntosCount(item) != 1 ? 's' : '' }}
              </v-chip>
              <v-chip
                v-else
                class="ma-2"
                outlined
              >
                <v-icon left small>
                  mdi-format-list-bulleted
                </v-icon>
                Sem assuntos
              </v-chip>
            </td>
            <td
              class="text-right"
            >
              <v-btn
                icon
                @click="openEdit(item.id || item.cd)"
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
                @click="destroy(item.id || item.cd)"
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
        nmatividade: '',
        nprevisao: null,
        idcolor: '',
        cd: null,
        // Array para armazenar os assuntos do usuário
        assuntos: [],
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
      // Método para contar assuntos de um item
      getAssuntosCount(item) {
        // Tenta diferentes possíveis lugares onde os assuntos podem estar armazenados
        if (item.assuntos) {
          if (typeof item.assuntos === 'string') {
            try {
              return JSON.parse(item.assuntos).length;
            } catch (e) {
              return 0;
            }
          }
          return Array.isArray(item.assuntos) ? item.assuntos.length : 0;
        }

        // Tenta verificar no json_extras
        if (item.json_extras) {
          let extras;
          try {
            extras = typeof item.json_extras === 'string' ? 
              JSON.parse(item.json_extras) : item.json_extras;
          } catch (e) {
            return 0;
          }
          
          if (extras.assuntos && Array.isArray(extras.assuntos)) {
            return extras.assuntos.length;
          }
        }
        
        return 0;
      },

      async refresh(force = false) {
        try {
        console.log('Carregando atividades do store...');
        
        // Use a ação fetchAtividades que já existe no seu store
        this.items = await this.$store.dispatch('atividades/fetchAtividades');
        console.log('Atividades carregadas:', this.items);
        
        // Verifica se os itens têm formato específico para ordená-los
        if (this.items && this.items.length > 0 && 'nordem' in this.items[0]) {
          this.items.sort((a, b) => a.nordem - b.nordem);
        }
        
        // Assegure-se de que todas as atividades têm uma cor definida
        this.items.forEach(item => {
          if (!item.idcolor) {
            item.idcolor = '#1976D2' // Cor padrão se não houver cor definida
          }
        });
      } catch (error) {
        console.error('Erro ao carregar atividades:', error);
        this.$notifier({ content: 'Erro ao carregar atividades', color: 'error' });
      }
  },

      // Métodos para gerenciar os assuntos
      adicionarAssunto() {
        this.assuntos.push({
          texto: '',
          concluido: false
        });
      },

      removerAssunto(index) {
        this.assuntos.splice(index, 1);
      },

  async save() {
    this.loading = true;
    try {
      if (this.$refs.form.validate()) {
        // Filtra assuntos vazios
        const assuntosValidos = this.assuntos.filter(a => a.texto && a.texto.trim() !== '');
        
        // Prepara os dados da atividade
        const atividade = {
          nprevisao: parseInt(this.nprevisao),
          nmatividade: this.nmatividade,
          idcolor: this.idcolor,
          // Adapta para a estrutura que o store espera
          titulo: this.nmatividade, // Caso o campo usado no store seja 'titulo'
        };
        
        // Adiciona os assuntos à atividade
        if (assuntosValidos.length > 0) {
          atividade.assuntos = assuntosValidos;
          
          // Alternativa: usando json_extras se necessário
          atividade.json_extras = {
            assuntos: assuntosValidos
          };
        }
        
        if (this.cd) {
          atividade.cd = this.cd;
          atividade.id = this.cd; // Certifica-se de que ambos id e cd estão configurados
          
          // Usar atualizarAtividade para editar uma atividade existente
          await this.$store.dispatch('atividades/atualizarAtividade', atividade);
        } else {
          // Usar criarAtividade para nova atividade
          await this.$store.dispatch('atividades/criarAtividade', atividade);
        }
        
        await this.refresh(true);
        this.$notifier({ content: 'Atividade salva com sucesso!', color: 'success' });
      }
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
      this.$notifier({ content: 'Erro ao salvar atividade: ' + (error.message || error), color: 'error' });
    } finally {
      this.dialog = false;
      this.loading = false;
    }
  },

  async destroy(id) {
    try {
      // Usa excluirAtividade em vez de deleteAtividade
      await this.$store.dispatch('atividades/excluirAtividade', id);
      await this.refresh(true);
    } catch (err) {
      this.$notifier({ content: 'Impossível Remover Atividade', color: 'orange' });
    }
  },

  async saveOrder() {
    for (const [i, atividade] of Object.entries(this.items)) {
      atividade.nordem = i;
    }
    try {
      // Usa atualizarAtividade em vez de updateAtividade
      for (const atividade of this.items) {
        await this.$store.dispatch('atividades/atualizarAtividade', atividade);
      }
    } catch (error) {
      console.error('Erro ao salvar ordem:', error);
      this.$notifier({ content: 'Erro ao atualizar ordem das atividades', color: 'error' });
    }
  },

  async sortAlpha () {
    this.items.sort((a, b) => {
      const nomeA = a.nmatividade || a.titulo || '';
      const nomeB = b.nmatividade || b.titulo || '';
      
      if (nomeA < nomeB) {
        return -1;
      }
      if (nomeA > nomeB) {
        return 1;
      }
      return 0;
    });
    await this.saveOrder();
  },

      openEdit (id) {
        this.valid = true;
        this.cd = id;
        this.dialog = true;
        
        // Encontra o item usando id ou cd para compatibilidade
        const atividade = this.items.find(item => (item.id === id || item.cd === id));
        
        // Carrega os dados básicos da atividade
        this.nmatividade = atividade.nmatividade || atividade.titulo || '';
        this.idcolor = atividade.idcolor || '#1976D2'; // Garante que sempre há uma cor
        this.nprevisao = atividade.nprevisao || 1;
        
        // Tenta carregar os assuntos de diferentes possíveis campos
        try {
          if (atividade.assuntos) {
            // Se for um array, usa diretamente
            if (Array.isArray(atividade.assuntos)) {
              this.assuntos = [...atividade.assuntos];
            } 
            // Se for uma string JSON, converte para array
            else if (typeof atividade.assuntos === 'string') {
              this.assuntos = JSON.parse(atividade.assuntos);
            } else {
              this.assuntos = [];
            }
          } 
          // Alternativa: tenta carregar do json_extras
          else if (atividade.json_extras) {
            let extras = atividade.json_extras;
            if (typeof extras === 'string') {
              extras = JSON.parse(extras);
            }
            
            if (extras.assuntos && Array.isArray(extras.assuntos)) {
              this.assuntos = extras.assuntos;
            } else {
              this.assuntos = [];
            }
          } else {
            this.assuntos = [];
          }
        } catch (e) {
          console.error('Erro ao carregar assuntos:', e);
          this.assuntos = [];
        }
      },

      resetForm () {
        this.cd = null;
        this.nmatividade = '';
        this.idcolor = '#FFFFFFFF';
        this.nprevisao = null;
        this.assuntos = []; // Reiniciar o array de assuntos
        if (this.$refs.form) {
          this.$refs.form.reset();
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
    color: rgba(0, 0, 0, 0.25) !important;
    box-shadow: 0 0 3px #ddd;
  }
</style>