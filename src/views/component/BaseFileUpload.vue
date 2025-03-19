<template>
  <div class="d-flex flex-row">
    <input
      ref="file"
      type="file"
      style="display: none"
      multiple
      @change="hideInputDialog"
    >
    <v-btn
      tile
      depressed
      :height="btnHeight"
      :disabled="disabled"
      @click="openInputDialog"
    >
      <v-icon>mdi-paperclip</v-icon>
      Anexar
    </v-btn>
    <v-btn
      id="teste"
      tile
      depressed
      :height="btnHeight"
      :disabled="disabled"
      @click="openTaskList"
    >
      <v-icon class="ListButton">mdi-format-list-checks</v-icon>
      Listar
    </v-btn>
    <div
      style="width: 100%"
    >
      <v-chip
        v-for="(item, i) in items"
        :key="`${item.name}-${i}`"
        class="ma-1"
        close
        @click:close="deleteFile(item)"
      >
        <span
          class="text-truncate mr-1"
          style="max-width: 150px"
        >
          {{ item.name }}
        </span>
        ({{ item.size | bytes2human }})
      </v-chip>
    </div>

    <!-- Diálogo de tarefas embutido -->
    <v-dialog
      v-model="taskDialog"
      max-width="700px"
    >
      <v-card>
        <v-card-title class="primary white--text">
          Controle de Tarefas - {{ assuntoNome }}
          <v-spacer></v-spacer>
          <v-btn icon dark @click="closeTaskDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-4">
          <p>Controle de tarefas a ser executadas e pendentes</p>
          
          <!-- Formulário para adicionar nova tarefa -->
          <v-form ref="taskForm" @submit.prevent="addTask">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newTask"
                  label="Nova tarefa"
                  outlined
                  dense
                  :rules="[v => !!v || 'Digite a descrição da tarefa']"
                  @keyup.enter="addTask"
                  placeholder="Digite a descrição da tarefa"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn color="primary" @click="addTask" :disabled="!newTask.trim()">
                  <v-icon left>mdi-plus</v-icon>
                  Adicionar Tarefa
                </v-btn>
              </v-col>
            </v-row>
          </v-form>

          <v-divider class="my-4"></v-divider>
          
          <!-- Status das tarefas -->
          <div class="mb-3">
            <v-chip-group
              v-model="filterStatus"
              mandatory
            >
              <v-chip outlined value="all">Todas ({{ tasks.length }})</v-chip>
              <v-chip outlined value="pending" color="orange">
                <v-icon left small color="orange">mdi-clock-outline</v-icon>
                Pendentes ({{ getTaskCountByStatus('pending') }})
              </v-chip>
              <v-chip outlined value="completed" color="green">
                <v-icon left small color="green">mdi-check-circle</v-icon>
                Concluídas ({{ getTaskCountByStatus('completed') }})
              </v-chip>
              <v-chip outlined value="not-started" color="red">
                <v-icon left small color="red">mdi-close-circle</v-icon>
                Não iniciadas ({{ getTaskCountByStatus('not-started') }})
              </v-chip>
            </v-chip-group>
          </div>

          <!-- Lista de tarefas com subtarefas -->
          <v-list class="task-list py-0">
            <template v-if="filteredTasks.length > 0">
              <v-list-group
                v-for="(task, index) in filteredTasks"
                :key="index"
                :value="false"
                class="task-item mb-2"
                :class="getTaskClass(task)"
                no-action
              >
                <template v-slot:activator>
                  <v-list-item-action>
                    <v-checkbox
                      v-model="task.completed"
                      :color="getTaskColor(task)"
                      @change="updateTaskStatus(task)"
                    ></v-checkbox>
                  </v-list-item-action>
                  
                  <v-list-item-icon>
                    <v-icon :color="getTaskColor(task)">{{ getTaskIcon(task) }}</v-icon>
                  </v-list-item-icon>
                  
                  <v-list-item-content>
                    <v-list-item-title 
                      :class="{'text-decoration-line-through': task.status === 'completed'}"
                    >
                      {{ task.description }}
                    </v-list-item-title>
                    <v-list-item-subtitle v-if="task.createdAt">
                      Criada em: {{ formatDate(task.createdAt) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  
                  <v-list-item-action>
                    <v-menu offset-y>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn icon v-bind="attrs" v-on="on">
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list dense>
                        <v-list-item @click="setTaskStatus(task, 'completed')" v-if="task.status !== 'completed'">
                          <v-list-item-icon>
                            <v-icon color="green">mdi-check-circle</v-icon>
                          </v-list-item-icon>
                          <v-list-item-title>Marcar como concluída</v-list-item-title>
                        </v-list-item>
                        
                        <v-list-item @click="setTaskStatus(task, 'pending')" v-if="task.status !== 'pending'">
                          <v-list-item-icon>
                            <v-icon color="orange">mdi-clock-outline</v-icon>
                          </v-list-item-icon>
                          <v-list-item-title>Marcar como pendente</v-list-item-title>
                        </v-list-item>
                        
                        <v-list-item @click="setTaskStatus(task, 'not-started')" v-if="task.status !== 'not-started'">
                          <v-list-item-icon>
                            <v-icon color="red">mdi-close-circle</v-icon>
                          </v-list-item-icon>
                          <v-list-item-title>Marcar como não iniciada</v-list-item-title>
                        </v-list-item>
                        
                        <v-divider></v-divider>
                        
                        <v-list-item @click="addSubtask(task)">
                          <v-list-item-icon>
                            <v-icon color="primary">mdi-plus</v-icon>
                          </v-list-item-icon>
                          <v-list-item-title>Adicionar subtarefa</v-list-item-title>
                        </v-list-item>
                        
                        <v-list-item @click="removeTask(index)">
                          <v-list-item-icon>
                            <v-icon color="red">mdi-delete</v-icon>
                          </v-list-item-icon>
                          <v-list-item-title>Remover tarefa</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-list-item-action>
                </template>
                
                <!-- Subtarefas -->
                <v-list-item v-if="!task.subtasks || task.subtasks.length === 0" class="ml-12 my-2">
                  <v-list-item-content>
                    <v-list-item-subtitle class="grey--text">
                      Nenhuma subtarefa adicionada.
                      <v-btn text small color="primary" @click="addSubtask(task)">
                        <v-icon small left>mdi-plus</v-icon> Adicionar subtarefa
                      </v-btn>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                
                <template v-else>
                  <v-list-item
                    v-for="(subtask, subIndex) in task.subtasks"
                    :key="`sub-${index}-${subIndex}`"
                    class="ml-12 my-1 subtask-item"
                    :class="getTaskClass(subtask)"
                  >
                    <v-list-item-action>
                      <v-checkbox
                        v-model="subtask.completed"
                        :color="getTaskColor(subtask)"
                        @change="updateSubtaskStatus(task, subtask)"
                      ></v-checkbox>
                    </v-list-item-action>
                    
                    <v-list-item-content>
                      <v-list-item-title 
                        :class="{'text-decoration-line-through': subtask.status === 'completed'}"
                      >
                        {{ subtask.description }}
                      </v-list-item-title>
                    </v-list-item-content>
                    
                    <v-list-item-action>
                      <v-menu offset-y>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn icon small v-bind="attrs" v-on="on">
                            <v-icon small>mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>
                        <v-list dense>
                          <v-list-item @click="setSubtaskStatus(task, subtask, 'completed')" v-if="subtask.status !== 'completed'">
                            <v-list-item-icon>
                              <v-icon small color="green">mdi-check-circle</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Marcar como concluída</v-list-item-title>
                          </v-list-item>
                          
                          <v-list-item @click="setSubtaskStatus(task, subtask, 'pending')" v-if="subtask.status !== 'pending'">
                            <v-list-item-icon>
                              <v-icon small color="orange">mdi-clock-outline</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Marcar como pendente</v-list-item-title>
                          </v-list-item>
                          
                          <v-list-item @click="setSubtaskStatus(task, subtask, 'not-started')" v-if="subtask.status !== 'not-started'">
                            <v-list-item-icon>
                              <v-icon small color="red">mdi-close-circle</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Marcar como não iniciada</v-list-item-title>
                          </v-list-item>
                          
                          <v-divider></v-divider>
                          
                          <v-list-item @click="removeSubtask(task, subIndex)">
                            <v-list-item-icon>
                              <v-icon small color="red">mdi-delete</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Remover subtarefa</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-list-item-action>
                  </v-list-item>
                  
                  <!-- Botão para adicionar mais subtarefas -->
                  <v-list-item class="ml-12 mt-1">
                    <v-list-item-content>
                      <v-btn text small color="primary" @click="addSubtask(task)">
                        <v-icon small left>mdi-plus</v-icon> Adicionar mais subtarefas
                      </v-btn>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-list-group>
            </template>
            <v-list-item v-else>
              <v-list-item-content>
                <v-list-item-title class="text-center grey--text">
                  Nenhuma tarefa encontrada.
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="closeTaskDialog">Cancelar</v-btn>
          <v-btn color="success" @click="saveTasks">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Diálogo para adicionar subtarefa -->
    <v-dialog
      v-model="subtaskDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title class="primary white--text">
          Adicionar Subtarefa
          <v-spacer></v-spacer>
          <v-btn icon dark @click="closeSubtaskDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pt-4">
          <p v-if="currentTask">Para a tarefa: <strong>{{ currentTask.description }}</strong></p>
          
          <v-form ref="subtaskForm" @submit.prevent="saveSubtask">
            <v-text-field
              v-model="newSubtask"
              label="Descrição da subtarefa"
              outlined
              dense
              :rules="[v => !!v || 'Digite a descrição da subtarefa']"
              @keyup.enter="saveSubtask"
              placeholder="Digite a descrição da subtarefa"
            ></v-text-field>
            
            <v-select
              v-model="newSubtaskStatus"
              :items="statusOptions"
              item-text="text"
              item-value="value"
              label="Status"
              outlined
              dense
            ></v-select>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="closeSubtaskDialog">Cancelar</v-btn>
          <v-btn color="success" @click="saveSubtask" :disabled="!newSubtask.trim()">Adicionar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    assuntoID: {
      type: [String, Number],
      default: null,
    },
    assuntoNome: {
      type: String,
      default: 'Tarefa1',
    },
    value: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    btnHeight: {
      type: Number,
      default: 40,
    },
  },
  data: () => ({
    itemsPerPage: 5,
    files: [],
    filesChecked: {},
    headers: [
      { text: 'Arquivo', value: 'name' },
      { text: 'Tamanho', value: 'size', align: 'end', width: '100px' },
      { text: '', value: 'action', sortable: false, align: 'end', width: '83px' },
    ],
    // Dados para o gerenciamento de tarefas
    taskDialog: false,
    tasks: [],
    newTask: '',
    filterStatus: 'all', // Filtro padrão para exibir todas as tarefas
    
    // Dados para gerenciamento de subtarefas
    subtaskDialog: false,
    currentTask: null,
    newSubtask: '',
    newSubtaskStatus: 'not-started',
    
    // Opções de status
    statusOptions: [
      { text: 'Não iniciada', value: 'not-started' },
      { text: 'Pendente', value: 'pending' },
      { text: 'Concluída', value: 'completed' }
    ]
  }),
  computed: {
    items: function () {
      return this.files.map(item => {
        return {
          name: item.name,
          size: item.size,
        }
      })
    },
    filteredTasks() {
      if (this.filterStatus === 'all') {
        return this.tasks;
      }
      return this.tasks.filter(task => task.status === this.filterStatus);
    }
  },
  watch: {
    files: function (val) {
      this.$emit('input', val)
    },
    value (newValue) {
      this.files = newValue
    },
  },
  methods: {
    openInputDialog () {
      this.$refs.file.click()
    },
    hideInputDialog (value) {
      let tmpFiles = [...value.target.files]
      tmpFiles = tmpFiles.filter(item => {
        if (!this.filesChecked[item.name]) {
          this.filesChecked[item.name] = true
          return true
        }
        return false
      })
      this.files = [...tmpFiles, ...this.files]
    },
    deleteFile (item) {
      this.filesChecked[item.name] = false
      const index = this.files.findIndex(it => it.name === item.name)
      if (this.files[index]) {
        this.files.splice(index, 1)
      }
      if (this.files.length === 0) {
        this.files = []
        this.filesChecked = {}
      }
    },
    
    // Métodos para gerenciamento de tarefas
    openTaskList() {
      this.taskDialog = true;
      this.loadTasks();
    },
    
    closeTaskDialog() {
      this.taskDialog = false;
      this.newTask = '';
    },
    
    loadTasks() {
      try {
        const key = this.getTaskStorageKey();
        const savedTasks = localStorage.getItem(key);
        
        if (savedTasks) {
          this.tasks = JSON.parse(savedTasks);
        } else {
          this.tasks = [];
        }
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        this.tasks = [];
      }
    },
    
    saveTasks() {
      try {
        const key = this.getTaskStorageKey();
        localStorage.setItem(key, JSON.stringify(this.tasks));
        this.$emit('tasks-saved', this.tasks);
        this.taskDialog = false;
        
        // Exibir mensagem de sucesso
        if (this.$store && this.$store.commit) {
          this.$store.commit('setSnackbar', {
            text: 'Tarefas salvas com sucesso!',
            color: 'success'
          });
        }
      } catch (error) {
        console.error('Erro ao salvar tarefas:', error);
        // Exibir mensagem de erro
        if (this.$store && this.$store.commit) {
          this.$store.commit('setSnackbar', {
            text: 'Erro ao salvar tarefas!',
            color: 'error'
          });
        }
      }
    },
    
    addTask() {
      if (!this.newTask.trim()) return;
      
      this.tasks.unshift({
        description: this.newTask,
        status: 'not-started', // Padrão: não iniciada
        completed: false,
        createdAt: new Date().toISOString(),
        subtasks: [] // Array para armazenar subtarefas
      });
      
      this.newTask = '';
    },
    
    removeTask(index) {
      const taskIndex = this.filteredTasks[index] ? this.tasks.findIndex(t => t === this.filteredTasks[index]) : -1;
      if (taskIndex >= 0) {
        this.tasks.splice(taskIndex, 1);
      }
    },
    
    updateTaskStatus(task) {
      // Atualiza o status com base no checkbox
      if (task.completed) {
        task.status = 'completed';
        
        // Também marca todas as subtarefas como concluídas
        if (task.subtasks && task.subtasks.length > 0) {
          task.subtasks.forEach(subtask => {
            subtask.status = 'completed';
            subtask.completed = true;
          });
        }
      } else {
        task.status = 'not-started';
      }
    },
    
    setTaskStatus(task, status) {
      task.status = status;
      task.completed = status === 'completed';
      
      // Se a tarefa for marcada como concluída, todas as subtarefas também são
      if (status === 'completed' && task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(subtask => {
          subtask.status = 'completed';
          subtask.completed = true;
        });
      }
    },
    
    // Métodos para gerenciamento de subtarefas
    addSubtask(task) {
      this.currentTask = task;
      this.newSubtask = '';
      this.newSubtaskStatus = 'not-started';
      this.subtaskDialog = true;
    },
    
    closeSubtaskDialog() {
      this.subtaskDialog = false;
      this.currentTask = null;
      this.newSubtask = '';
    },
    
    saveSubtask() {
      if (!this.newSubtask.trim() || !this.currentTask) return;
      
      // Certifique-se de que o array de subtarefas existe
      if (!this.currentTask.subtasks) {
        this.currentTask.subtasks = [];
      }
      
      // Adicionar nova subtarefa
      this.currentTask.subtasks.push({
        description: this.newSubtask,
        status: this.newSubtaskStatus,
        completed: this.newSubtaskStatus === 'completed',
        createdAt: new Date().toISOString()
      });
      
      // Verifique e atualize o status da tarefa pai com base nas subtarefas
      this.updateParentTaskStatus(this.currentTask);
      
      // Limpa e fecha o diálogo
      this.closeSubtaskDialog();
    },
    
    removeSubtask(task, subIndex) {
      if (task.subtasks && subIndex >= 0 && subIndex < task.subtasks.length) {
        task.subtasks.splice(subIndex, 1);
        
        // Atualiza o status da tarefa pai
        this.updateParentTaskStatus(task);
      }
    },
    
    updateSubtaskStatus(task, subtask) {
      // Atualiza o status com base no checkbox
      if (subtask.completed) {
        subtask.status = 'completed';
      } else {
        subtask.status = 'not-started';
      }
      
      // Atualiza o status da tarefa pai com base nas subtarefas
      this.updateParentTaskStatus(task);
    },
    
    setSubtaskStatus(task, subtask, status) {
      subtask.status = status;
      subtask.completed = status === 'completed';
      
      // Atualiza o status da tarefa pai
      this.updateParentTaskStatus(task);
    },
    
    // Atualiza o status da tarefa pai com base nas subtarefas
    updateParentTaskStatus(task) {
      if (!task.subtasks || task.subtasks.length === 0) return;
      
      const allCompleted = task.subtasks.every(sub => sub.status === 'completed');
      const allNotStarted = task.subtasks.every(sub => sub.status === 'not-started');
      
      if (allCompleted) {
        task.status = 'completed';
        task.completed = true;
      } else if (allNotStarted) {
        task.status = 'not-started';
        task.completed = false;
      } else {
        task.status = 'pending';
        task.completed = false;
      }
    },
    
    getTaskColor(task) {
      switch (task.status) {
        case 'completed': return 'green';
        case 'pending': return 'orange';
        case 'not-started': return 'red';
        default: return 'grey';
      }
    },
    
    getTaskIcon(task) {
      switch (task.status) {
        case 'completed': return 'mdi-check-circle';
        case 'pending': return 'mdi-clock-outline';
        case 'not-started': return 'mdi-close-circle';
        default: return 'mdi-help-circle';
      }
    },
    
    getTaskClass(task) {
      return `task-status-${task.status}`;
    },
    
    getTaskCountByStatus(status) {
      return this.tasks.filter(task => task.status === status).length;
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    getTaskStorageKey() {
      return `tasks_${this.assuntoID || 'default'}_${this.assuntoNome || 'default'}`;
    }
  },
}
</script>

<style lang="css" scoped>
#teste{
  margin-left: 10px;
}

/* Estilos para os diferentes status de tarefas */
.task-item {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  margin-bottom: 8px;
}

.task-status-completed {
  background-color: rgba(76, 175, 80, 0.1);
  border-left: 3px solid #4CAF50;
}

.task-status-pending {
  background-color: rgba(255, 152, 0, 0.1);
  border-left: 3px solid #FF9800;
}

.task-status-not-started {
  background-color: rgba(244, 67, 54, 0.1);
  border-left: 3px solid #F44336;
}

.subtask-item {
  border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
}

/* Sobrescreve o estilo do v-list-group para remover o padding padrão */
.task-list .v-list-group__items {
  padding-left: 0 !important;
}
</style>