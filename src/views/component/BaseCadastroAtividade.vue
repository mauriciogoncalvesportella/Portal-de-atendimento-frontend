<template>
  <div>
    <v-simple-table>
      <template #top>
        <div>

          <div>
            <v-dialog
              v-model="dialog"
              max-width="900"
              persistent
            >
              <template #activator="{ on, attrs }">
              </template>
              <v-card>
                <v-card-title class="primary white--text">
                  <v-icon
                    class="mr-1"
                    color="white"
                  >
                    mdi-table-{{ cd ? 'edit' : 'plus' }}
                  </v-icon>
                  Criar Atividade
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
                      class="mb-4"
                      maxlength="100"
                      counter="100"
                    />
                    
                    <!-- Seletor de ícone -->
                    <div class="mb-4">
                      <label class="grey--text text--darken-1 font-weight-medium mb-2 d-block">Ícone</label>
                      <v-select
                        v-model="selectedIcon"
                        :items="availableIcons"
                        item-text="name"
                        item-value="icon"
                        filled
                        return-object
                        class="mb-2"
                      >
                        <template v-slot:selection="{ item }">
                          <v-icon class="mr-2">{{ item.icon }}</v-icon>
                          {{ item.name }}
                        </template>
                        <template v-slot:item="{ item }">
                          <v-icon class="mr-2">{{ item.icon }}</v-icon>
                          {{ item.name }}
                        </template>
                      </v-select>
                    </div>
                    
                    <!-- Separador visual -->
                    <v-divider class="my-4"></v-divider>
                    
                    <!-- Editor de texto simples -->
                    <div class="mb-4">
                      <label class="grey--text text--darken-1 font-weight-medium mb-2 d-block">Assunto</label>
                      
                      <!-- Barra de ferramentas do editor -->
                      <div class="editor-toolbar d-flex flex-wrap align-center mb-2 pa-1 rounded-t" style="border: 1px solid #e0e0e0; background-color: #f5f5f5;">
                        <button type="button" @click="execCommand('bold')" class="editor-btn mr-1" title="Negrito">
                          <span class="font-weight-bold">B</span>
                        </button>
                        <button type="button" @click="execCommand('italic')" class="editor-btn mr-1" title="Itálico">
                          <span class="font-italic">I</span>
                        </button>
                        <button type="button" @click="execCommand('underline')" class="editor-btn mr-1" title="Sublinhado">
                          <span class="text-decoration-underline">U</span>
                        </button>
                        
                        <button type="button" @click="execCommand('justifyLeft')" class="editor-btn mr-1" title="Alinhar à esquerda">
                          <v-icon small>mdi-format-align-left</v-icon>
                        </button>
                        <button type="button" @click="execCommand('justifyCenter')" class="editor-btn mr-1" title="Centralizar">
                          <v-icon small>mdi-format-align-center</v-icon>
                        </button>
                        <button type="button" @click="execCommand('justifyRight')" class="editor-btn mr-1" title="Alinhar à direita">
                          <v-icon small>mdi-format-align-right</v-icon>
                        </button>
                        
                        <button type="button" @click="execCommand('insertUnorderedList')" class="editor-btn mr-1" title="Lista com marcadores">
                          <v-icon small>mdi-format-list-bulleted</v-icon>
                        </button>
                        <button type="button" @click="execCommand('insertOrderedList')" class="editor-btn mr-1" title="Lista numerada">
                          <v-icon small>mdi-format-list-numbered</v-icon>
                        </button>
                        <button type="button" @click="insertCheckbox()" class="editor-btn mr-1" title="Lista de verificação">
                          <v-icon small>mdi-checkbox-marked-outline</v-icon>
                        </button>
                        
                        <input 
                          ref="imageInput" 
                          type="file" 
                          accept="image/*" 
                          style="display: none" 
                          @change="handleImageUpload"
                        >
                        <button type="button" @click="$refs.imageInput.click()" class="editor-btn mr-1" title="Inserir imagem">
                          <v-icon small>mdi-image</v-icon>
                        </button>
                        <button type="button" @click="insertTable()" class="editor-btn mr-1" title="Inserir tabela">
                          <v-icon small>mdi-table</v-icon>
                        </button>
                        <button type="button" @click="insertLink()" class="editor-btn mr-1" title="Inserir link">
                          <v-icon small>mdi-link</v-icon>
                        </button>
                        
                        <button type="button" @click="execCommand('undo')" class="editor-btn mr-1" title="Desfazer">
                          <v-icon small>mdi-undo</v-icon>
                        </button>
                        <button type="button" @click="execCommand('redo')" class="editor-btn" title="Refazer">
                          <v-icon small>mdi-redo</v-icon>
                        </button>
                      </div>
                      
                      <!-- Área de edição (contentEditable) -->
                      <div 
                        ref="editorContent"
                        id="editor-content"
                        contenteditable="true"
                        class="editor-content pa-3 rounded-b"
                        style="border: 1px solid #e0e0e0; border-top: none; min-height: 200px; background-color: white;"
                        @input="updateCharCount"
                        @keydown="handleKeyDown"
                        @keypress="limitCharCount"
                      ></div>
                      
                      <!-- Contador de caracteres com limite -->
                      <div class="d-flex justify-end align-center mt-1">
                        <span class="caption grey--text">{{ charCount }}/255 CARACTERES</span>
                      </div>
                      
                      <!-- Botão ANEXAR e contador -->
                      <div class="d-flex justify-space-between align-center mt-2">
                        <input 
                          ref="fileInput" 
                          type="file" 
                          style="display: none" 
                          @change="handleFileUpload"
                        >
                        <v-btn 
                          small 
                          outlined 
                          color="primary"
                          class="text-none"
                          @click="$refs.fileInput.click()"
                        >
                          <v-icon small left>mdi-paperclip</v-icon>
                          ANEXAR
                        </v-btn>
                        <!-- Lista de arquivos anexados -->
                        <div v-if="currentAttachments.length > 0" class="attached-files">
                          <div v-for="(file, index) in currentAttachments" :key="index" class="attached-file">
                            <span class="caption">{{ file.name }}</span>
                            <v-btn icon x-small @click="removeAttachment(index)">
                              <v-icon x-small>mdi-close</v-icon>
                            </v-btn>
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn
                      text
                      color="grey darken-1"
                      @click="cancelar"
                      class="mr-2"
                    >
                      CANCELAR
                    </v-btn>
                    <v-btn
                      text
                      color="primary"
                      :loading="loading"
                      :disabled="!valid"
                      @click="salvarAtividade"
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
      <template>
        <!-- Cabeçalho da tabela -->
        <div class="primary px-3 py-2 white--text d-flex justify-space-between align-center">
          <span>Cadastros de atividades</span>
          <v-btn
            fab
            small
            elevation="0"
            color="white"
            @click="resetForm(); dialog = true;"
          >
            <v-icon color="primary">mdi-table-plus</v-icon>
          </v-btn>
        </div>
        
        <!-- Tabela de atividades -->
        <table class="v-data-table" style="width: 100%;">
          <tbody>
            <tr v-for="(item, index) in situacoes" :key="item.id">
              <td style="width: 40px; text-align: center;">{{ index + 1 }}</td>
              <td style="width: 40px; text-align: center;">
                <v-icon>{{ item.icon }}</v-icon>
              </td>
              <td>{{ item.nmatividade }}</td>
              <td style="width: 100px; text-align: right;">
                <v-btn
                  icon
                  small
                  @click="openEdit(item.id)"
                  color="primary"
                >
                  <v-icon small>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  @click="deleteItem(item.id)"
                  color="red"
                >
                  <v-icon small>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </v-simple-table>
    
    <!-- Botão SALVAR na parte inferior direita -->
    <div class="d-flex justify-end mt-4">
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      valid: true,
      situacoes: [],
      loading: false,
      dialog: false,
      nmatividade: '',
      cd: null,
      charCount: 0,
      RREQUIRED: value => !!value || 'Campo obrigatório',
      
      // Ícones disponíveis
      selectedIcon: { icon: 'mdi-checkbox-blank-circle-outline', name: 'Padrão' },
      availableIcons: [
        { icon: 'mdi-checkbox-blank-circle-outline', name: 'Padrão' },
        { icon: 'mdi-account-hard-hat', name: 'Análise/Suporte' },
        { icon: 'mdi-clock-outline', name: 'Aguardando' },
        { icon: 'mdi-alert-circle-outline', name: 'Alerta' },
        { icon: 'mdi-calendar', name: 'Agendamento' },
        { icon: 'mdi-tablet', name: 'Dispositivo' },
        { icon: 'mdi-clipboard-check', name: 'Teste' },
        { icon: 'mdi-monitor', name: 'Atualização' },
        { icon: 'mdi-cog', name: 'Configuração' }
      ],
      
      // Anexos - específicos para cada atividade
      currentAttachments: []
    };
  },
  
  // NOVA ADIÇÃO: Lifecycle hook para carregar dados salvos no localStorage
  mounted() {
    // Carrega os dados do localStorage quando o componente é montado
    this.carregarDados();
    
    // Inicializa checkboxes após a montagem do componente
    this.$nextTick(() => {
      this.initExistingCheckboxes();
    });
  },
  
  methods: {
    // NOVA ADIÇÃO: Método para carregar dados do localStorage
    carregarDados() {
      try {
        const savedData = localStorage.getItem('situacoes');
        if (savedData) {
          this.situacoes = JSON.parse(savedData);
          console.log('Atividades carregadas do localStorage:', this.situacoes.length);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    },
    
    // NOVA ADIÇÃO: Método para salvar dados no localStorage
    salvarDados() {
      try {
        localStorage.setItem('situacoes', JSON.stringify(this.situacoes));
        console.log('Atividades salvas no localStorage:', this.situacoes.length);
      } catch (error) {
        console.error('Erro ao salvar dados:', error);
      }
    },
    
    // Executa comando de edição de texto
    execCommand(command, value = null) {
      document.execCommand(command, false, value);
      this.$refs.editorContent.focus();
      this.updateCharCount();
    },
    
    // CORREÇÃO: Função para adicionar checkbox que realmente funciona
    insertCheckbox() {
      // Cria um ID único para o checkbox
      const checkboxId = `check-${Date.now()}`;
      
      // Cria os elementos diretamente ao invés de usar insertHTML
      const container = document.createElement('div');
      container.style.marginBottom = '8px';
      container.style.display = 'flex';
      container.style.alignItems = 'flex-start';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = checkboxId;
      checkbox.style.marginRight = '8px';
      checkbox.style.cursor = 'pointer';
      
      // Adiciona evento de clique explícito
      checkbox.addEventListener('click', function(e) {
        // Garantir que o evento de clique seja processado corretamente
        e.stopPropagation();
      });
      
      const label = document.createElement('label');
      label.htmlFor = checkboxId;
      label.contentEditable = 'true';
      label.style.cursor = 'text';
      label.style.flex = '1';
      
      // Montagem da estrutura
      container.appendChild(checkbox);
      container.appendChild(label);
      
      // Obtém a seleção atual
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      
      // Limpa a seleção atual e insere o novo container
      range.deleteContents();
      range.insertNode(container);
      
      // Move o cursor para o label para digitar
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.setStart(label, 0);
      newRange.collapse(true);
      selection.addRange(newRange);
      
      // Foca no label
      label.focus();
    },
    
    // CORREÇÃO: Manipulador de tecla Enter em checkboxes
    handleKeyDown(e) {
      // Verifica se é Enter sem Shift
      if (e.key === 'Enter' && !e.shiftKey) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        let node = selection.getRangeAt(0).commonAncestorContainer;
        
        // Navega até encontrar o elemento label ou span, se estiver dentro de um textNode
        while (node && node.nodeType === 3) {
          node = node.parentNode;
        }
        
        // Verifica se estamos em um label de checkbox
        if (node && 
            ((node.tagName === 'LABEL' && node.previousElementSibling && node.previousElementSibling.type === 'checkbox') ||
             (node.tagName === 'SPAN' && node.previousElementSibling && node.previousElementSibling.type === 'checkbox'))) {
          
          e.preventDefault();
          // Insere um novo checkbox abaixo do atual
          this.insertCheckbox();
          return;
        }
        
        // Processa outras funcionalidades do editor normalmente
        // (Permitir que manipuladores padrão de Enter funcionem em outros contextos)
      }
      
      // Implementa a limitação de caracteres
      this.limitCharCount(e);
    },
    
    // NOVA FUNÇÃO: Inicializa todos os checkboxes existentes para garantir que funcionem
    initExistingCheckboxes() {
      // Busca todos os checkboxes dentro do editor
      if (this.$refs.editorContent) {
        const checkboxes = this.$refs.editorContent.querySelectorAll('input[type="checkbox"]');
        
        // Adiciona eventos a cada um
        checkboxes.forEach(checkbox => {
          // Remove qualquer listener antigo para evitar duplicação
          checkbox.removeEventListener('click', this.handleCheckboxClick);
          
          // Adiciona o novo listener
          checkbox.addEventListener('click', this.handleCheckboxClick);
        });
      }
    },
    
    // Função auxiliar para lidar com cliques em checkboxes
    handleCheckboxClick(e) {
      // Garantir que o evento de clique seja processado corretamente
      e.stopPropagation();
    },
    
    // Limita a contagem de caracteres
    limitCharCount(event) {
      if (this.charCount >= 255) {
        // Aceitar apenas teclas de controle
        if (!(event.key === 'Backspace' || event.key === 'Delete' || 
              event.key === 'ArrowLeft' || event.key === 'ArrowRight' || 
              event.key === 'ArrowUp' || event.key === 'ArrowDown' || 
              event.ctrlKey || event.metaKey)) {
          event.preventDefault();
        }
      }
    },
    
    // Atualiza a contagem de caracteres
    updateCharCount() {
      if (!this.$refs.editorContent) return;
      
      const content = this.$refs.editorContent.textContent || '';
      this.charCount = Math.min(content.length, 255);
      
      // Se exceder o limite, trunca o conteúdo
      if (content.length > 255) {
        this.truncateContent();
      }
    },
    
    // Trunca o conteúdo para o limite de 255 caracteres
    truncateContent() {
      // Abordagem simplificada para truncar texto
      const content = this.$refs.editorContent.textContent || '';
      if (content.length <= 255) return;
      
      // Usar uma abordagem que preserva a estrutura HTML
      const html = this.$refs.editorContent.innerHTML;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Função recursiva para truncar conteúdo
      function truncateNode(node, charsLeft) {
        if (charsLeft <= 0) return 0;
        
        // Para nós de texto, truncar diretamente
        if (node.nodeType === 3) { // Nó de texto
          if (node.length > charsLeft) {
            node.textContent = node.textContent.substring(0, charsLeft);
            return 0;
          } else {
            return charsLeft - node.length;
          }
        }
        
        // Para elementos, processar filhos
        if (node.nodeType === 1) { // Elemento
          let remaining = charsLeft;
          const childNodes = Array.from(node.childNodes);
          
          for (let i = 0; i < childNodes.length; i++) {
            remaining = truncateNode(childNodes[i], remaining);
            
            // Se não há mais caracteres restantes, remover os nós subsequentes
            if (remaining <= 0) {
              for (let j = i + 1; j < childNodes.length; j++) {
                node.removeChild(childNodes[j]);
              }
              break;
            }
          }
          
          return remaining;
        }
        
        return charsLeft;
      }
      
      truncateNode(tempDiv, 255);
      
      // Aplicar o HTML truncado de volta ao editor
      this.$refs.editorContent.innerHTML = tempDiv.innerHTML;
    },
    
    // Manipula o upload de imagem
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Verifica se é uma imagem
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        // Cria uma imagem para obter dimensões
        const img = new Image();
        img.onload = () => {
          // Calcula tamanho proporcional limitado
          const maxWidth = 300;
          const maxHeight = 200;
          
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          
          // Cria o código HTML da imagem
          const imgHtml = `<img src="${e.target.result}" style="width: ${width}px; height: ${height}px; max-width: 100%;" />`;
          
          // Insere a imagem
          this.execCommand('insertHTML', imgHtml);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
      
      // Limpa o campo de arquivo
      this.$refs.imageInput.value = '';
    },
    
    // Inserir tabela
    insertTable() {
      const rows = parseInt(prompt('Número de linhas:', '3')) || 3;
      const cols = parseInt(prompt('Número de colunas:', '3')) || 3;
      
      let tableHtml = '<table class="editor-table" style="width: 100%; border-collapse: collapse; margin: 10px 0;">';
      
      // Cria o cabeçalho
      tableHtml += '<tr>';
      for (let j = 0; j < cols; j++) {
        tableHtml += '<th style="border: 1px solid #ddd; padding: 8px; min-width: 50px;"></th>';
      }
      tableHtml += '</tr>';
      
      // Cria as linhas e colunas
      for (let i = 1; i < rows; i++) {
        tableHtml += '<tr>';
        for (let j = 0; j < cols; j++) {
          tableHtml += '<td style="border: 1px solid #ddd; padding: 8px; min-width: 50px;"></td>';
        }
        tableHtml += '</tr>';
      }
      
      tableHtml += '</table>';
      
      this.execCommand('insertHTML', tableHtml);
    },
    
    // Inserir link
    insertLink() {
      const url = prompt('Informe a URL do link:', 'http://');
      if (url) {
        this.execCommand('createLink', url);
      }
    },
    
    // Trata o upload de arquivos
    handleFileUpload(event) {
      const files = event.target.files;
      if (files.length > 0) {
        Array.from(files).forEach(file => {
          // Adiciona ao array de anexos atuais
          this.currentAttachments.push({
            name: file.name,
            file: file
          });
        });
      }
      // Limpa o input
      this.$refs.fileInput.value = '';
    },
    
    // Remove um anexo
    removeAttachment(index) {
      this.currentAttachments.splice(index, 1);
    },
    
    // Obtém o conteúdo HTML do editor
    getEditorContent() {
      return this.$refs.editorContent ? this.$refs.editorContent.innerHTML : '';
    },
    
    // Define o conteúdo do editor
    setEditorContent(html) {
      if (this.$refs.editorContent) {
        this.$refs.editorContent.innerHTML = html || '';
        this.updateCharCount();
        
        // Inicializa checkboxes após definir conteúdo
        this.$nextTick(() => {
          this.initExistingCheckboxes();
        });
      }
    },
    
    // Redefine o formulário
    resetForm() {
      this.cd = null;
      this.nmatividade = '';
      this.charCount = 0;
      this.selectedIcon = this.availableIcons[0]; // Ícone padrão
      this.currentAttachments = []; // Limpa os anexos
      
      // Limpar o editor
      this.$nextTick(() => {
        this.setEditorContent('');
      });
      
      if (this.$refs.form) {
        this.$refs.form.reset();
      }
    },
    
    // Cancela o modal
    cancelar() {
      this.dialog = false;
    },
    
    // Salva a atividade
    async salvarAtividade() {
      this.loading = true;
      try {
        if (this.$refs.form.validate()) {
          // Obter conteúdo do editor
          const conteudoAssunto = this.getEditorContent();
          
          // Construir o objeto de atividade
          const atividade = {
            id: this.cd || Date.now(), // Usa um timestamp como ID para novas atividades
            nmatividade: this.nmatividade,
            assunto: conteudoAssunto,
            icon: this.selectedIcon.icon,
            attachments: [...this.currentAttachments] // Cópia dos anexos atuais
          };
          
          // Verificar se é uma edição ou uma nova atividade
          if (this.cd) {
            // Atualização de item existente
            const index = this.situacoes.findIndex(item => item.id === this.cd);
            if (index !== -1) {
              // Substituir o item no array
              this.situacoes.splice(index, 1, atividade);
            }
          } else {
            // Novo item - adicionar ao final do array
            this.situacoes.push(atividade);
          }
          
          // NOVA ADIÇÃO: Salvar no localStorage
          this.salvarDados();
          
          console.log("Atividade salva:", atividade);
          console.log("Total de atividades:", this.situacoes.length);
          
          // Exibir notificação de sucesso
          try {
            if (this.$notifier) {
              this.$notifier({ content: 'Atividade salva com sucesso!', color: 'success' });
            } else {
              alert('Atividade salva com sucesso!');
            }
          } catch (error) {
            console.log('Atividade salva com sucesso!');
          }
          
          // Fechar o diálogo
          this.dialog = false;
        }
      } catch (error) {
        console.error('Erro ao salvar atividade:', error);
        
        try {
          if (this.$notifier) {
            this.$notifier({ content: 'Erro ao salvar atividade: ' + (error.message || error), color: 'error' });
          } else {
            alert('Erro ao salvar atividade: ' + (error.message || error));
          }
        } catch (e) {
          console.log('Erro ao salvar atividade:', error);
        }
      } finally {
        this.loading = false;
      }
    },
    
    // Salvar todas as atividades no servidor
    async salvarNoServidor() {
      try {
        // Prepara os dados para envio
        const dados = {
          atividades: this.situacoes.map(item => ({
            id: item.id,
            nmatividade: item.nmatividade,
            assunto: item.assunto,
            icon: item.icon,
            anexos: item.attachments ? item.attachments.map(a => a.name) : []
          }))
        };
        
        // Aqui você implementará a chamada ao seu banco de dados
        // Por enquanto, vamos apenas mostrar uma mensagem
        console.log('Dados a serem salvos no banco:', dados);
        
        // Exibe mensagem de sucesso
        try {
          if (this.$notifier) {
            this.$notifier({ content: 'Dados salvos com sucesso!', color: 'success' });
          } else {
            alert('Dados salvos com sucesso!');
          }
        } catch (error) {
          console.log('Dados salvos com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao salvar no servidor:', error);
        
        try {
          if (this.$notifier) {
            this.$notifier({ content: 'Erro ao salvar no servidor: ' + (error.message || error), color: 'error' });
          } else {
            alert('Erro ao salvar no servidor: ' + (error.message || error));
          }
        } catch (e) {
          console.log('Erro ao salvar no servidor:', error);
        }
      }
    },
    
    // Abre o formulário para edição
    openEdit(id) {
      this.valid = true;
      this.cd = id;
      
      // Buscar dados da atividade
      const atividade = this.situacoes.find(item => item.id === id);
      if (atividade) {
        this.nmatividade = atividade.nmatividade || '';
        
        // Definir o ícone
        const icon = atividade.icon || 'mdi-checkbox-blank-circle-outline';
        this.selectedIcon = this.availableIcons.find(item => item.icon === icon) || this.availableIcons[0];
        
        // Carregar os anexos específicos desta atividade
        this.currentAttachments = atividade.attachments ? [...atividade.attachments] : [];
        
        // Definir o conteúdo do editor
        this.$nextTick(() => {
          const conteudo = atividade.assunto || '';
          this.setEditorContent(conteudo);
          
          // Inicializa os checkboxes após carregar o conteúdo
          this.initExistingCheckboxes();
        });
      }
      
      this.dialog = true;
    },
    
    // Exclui um item
    deleteItem(id) {
      const index = this.situacoes.findIndex(item => item.id === id);
      if (index !== -1) {
        // Remover o item do array
        this.situacoes.splice(index, 1);
        
        // NOVA ADIÇÃO: Salvar após exclusão
        this.salvarDados();
        
        try {
          if (this.$notifier) {
            this.$notifier({ content: 'Atividade excluída com sucesso!', color: 'success' });
          } else {
            alert('Atividade excluída com sucesso!');
          }
        } catch (error) {
          console.log('Atividade excluída com sucesso!');
        }
      }
    },
    
    // Ordenação alfabética
    sortAlpha() {
      this.situacoes.sort((a, b) => {
        return a.nmatividade.localeCompare(b.nmatividade);
      });
      
      // NOVA ADIÇÃO: Salvar após ordenação
      this.salvarDados();
      
      try {
        if (this.$notifier) {
          this.$notifier({ content: 'Atividades ordenadas alfabeticamente!', color: 'success' });
        } else {
          alert('Atividades ordenadas alfabeticamente!');
        }
      } catch (error) {
        console.log('Atividades ordenadas alfabeticamente!');
      }
    }
  }
}
</script>

<style>
/* Estilos básicos para o editor */
.editor-content {
  outline: none;
  min-height: 200px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-top: none;
  background-color: white;
}

.editor-content:focus {
  outline: none;
}

/* Estilos para botões do editor */
.editor-btn {
  min-width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.editor-btn:focus {
  outline: none;
}

/* Estilos específicos para elementos no editor */
.editor-content img {
  max-width: 300px;
  max-height: 200px;
  display: inline-block;
  margin: 5px 0;
}

.editor-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
}

.editor-content th,
.editor-content td {
  border: 1px solid #ddd;
  padding: 8px;
  min-width: 50px;
}

/* Estilos para checkbox no editor - estilos simplificados */
.checkbox-container {
  display: block;
  margin-bottom: 8px;
}

/* Estilos para anexos */
.attached-files {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.attached-file {
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 4px;
  padding: 2px 8px;
}

/* Estilos para a tabela */
.v-data-table {
  border-collapse: collapse;
  width: 100%;
}

.v-data-table td {
  padding: 8px 16px;
  border-bottom: 1px solid #e0e0e0;
}

/* Estilo para o botão no cabeçalho da tabela */
.primary {
  position: relative;
}
</style>