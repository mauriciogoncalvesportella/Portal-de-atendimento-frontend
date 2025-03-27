<template>
  <div>
    <v-simple-table>
      <template #top>
        <div
          class="px-3 py-2 d-flex justify-space-between align-center primary white--text text-h5"
        >
          <span>
            Atividades
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
              max-width="900"
              persistent
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
              <!-- AQUI COMEÇA O MODAL - MANTENDO EXATAMENTE COMO ESTAVA -->
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
              <!-- AQUI TERMINA O MODAL -->
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
            <td> {{ item.nmatividade }} </td>
            <td
              class="text-center"
            >
              <v-icon>
                {{ item.icon || item.idicon }}
              </v-icon>
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
                @click="deleteItem(item.id || item.cd)"
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

    data() {
      return {
        valid: true,
        items: [],
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
      }
    },

    created() {
      // Inicializar array de items vazio
      this.items = [];
      
      // Tentar carregar dados
      this.refresh();
      
      // Adicionar listener para clicks
      document.addEventListener('click', this.handleDocumentClick);
    },
    
    beforeDestroy() {
      // Remover listener
      document.removeEventListener('click', this.handleDocumentClick);
    },

    methods: {
      async refresh(force = false) {
        try {
          // Tentar carregar do store primeiro
          this.items = await this.$store.dispatch('allAtividade', force);
          
          // Se o store não devolver dados, carregar do localStorage
          if (!Array.isArray(this.items) || this.items.length === 0) {
            this.carregarDados();
          }
          
          // Ordenar items
          if (Array.isArray(this.items)) {
            // Ordenar por campo nordem se existir
            this.items.sort((a, b) => (a.nordem || 0) - (b.nordem || 0));
          }
        } catch (error) {
          console.error('Erro ao carregar atividades:', error);
          // Carregar dados do localStorage como fallback
          this.carregarDados();
        }
      },
      
      carregarDados() {
        try {
          // Garantir que items seja um array
          if (!Array.isArray(this.items)) {
            this.items = [];
          }
          
          const savedData = localStorage.getItem('atividades');
          if (savedData) {
            const parsed = JSON.parse(savedData);
            if (Array.isArray(parsed)) {
              this.items = parsed;
              console.log('Atividades carregadas do localStorage:', this.items.length);
            }
          } else {
            // Dados iniciais de exemplo
            this.items = [
              { id: 1, cd: 1, nmatividade: 'Análise Suporte N1', icon: 'mdi-account-hard-hat', nordem: 0 },
              { id: 2, cd: 2, nmatividade: 'Aguardando Ret. Interno', icon: 'mdi-clock-outline', nordem: 1 },
              { id: 3, cd: 3, nmatividade: 'Aguardando Ret. Cliente', icon: 'mdi-clock-outline', nordem: 2 },
              { id: 4, cd: 4, nmatividade: 'Análise N2', icon: 'mdi-account-hard-hat', nordem: 3 },
              { id: 5, cd: 5, nmatividade: 'Correções - Programação', icon: 'mdi-alert-circle-outline', nordem: 4 },
              { id: 6, cd: 6, nmatividade: 'Melhorias - Programação', icon: 'mdi-calendar', nordem: 5 },
              { id: 7, cd: 7, nmatividade: 'Aguardando Gilson', icon: 'mdi-clock-outline', nordem: 6 },
              { id: 8, cd: 8, nmatividade: 'Tablet - Programação', icon: 'mdi-tablet', nordem: 7 },
              { id: 9, cd: 9, nmatividade: 'Teste', icon: 'mdi-clipboard-check', nordem: 8 },
              { id: 10, cd: 10, nmatividade: 'Atualizar Cliente', icon: 'mdi-monitor', nordem: 9 },
              { id: 11, cd: 11, nmatividade: 'Consulta Interna', icon: 'mdi-account-hard-hat', nordem: 10 },
              { id: 12, cd: 12, nmatividade: 'Finalizado', icon: 'mdi-checkbox-blank-circle-outline', nordem: 11 }
            ];
            this.salvarDados();
          }
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
          // Garantir que items seja sempre um array
          this.items = [];
        }
      },
      
      salvarDados() {
        try {
          if (!Array.isArray(this.items)) {
            this.items = [];
          }
          localStorage.setItem('atividades', JSON.stringify(this.items));
          console.log('Atividades salvas no localStorage:', this.items.length);
        } catch (error) {
          console.error('Erro ao salvar dados:', error);
        }
      },
      
      async saveOrder() {
        // Atualizar ordens 
        if (Array.isArray(this.items)) {
          for (const [i, item] of Object.entries(this.items)) {
            item.nordem = parseInt(i);
          }
          
          // Tentar salvar no store
          try {
            await this.$store.dispatch('updateAtividade', this.items);
          } catch (err) {
            console.error('Falha ao salvar ordem no store:', err);
            // Salvar no localStorage
            this.salvarDados();
          }
        }
      },
      
      async sortAlpha() {
        if (!Array.isArray(this.items)) {
          this.items = [];
          return;
        }
        
        this.items.sort((a, b) => {
          const nameA = a.nmatividade || a.nmsituacao || '';
          const nameB = b.nmatividade || b.nmsituacao || '';
          
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
        
        // Atualizar ordens após ordenar
        await this.saveOrder();
      },
      
      // Methods específicos para o modal, mantidos exatamente como estavam
      
      // Handler para cliques no documento
      handleDocumentClick(event) {
        // Verifica se o clique foi em um checkbox dentro do editor
        if (event.target.type === 'checkbox' && this.$refs.editorContent && 
            this.$refs.editorContent.contains(event.target)) {
          // Impede a propagação mas permite que o checkbox funcione normalmente
          event.stopPropagation();
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
        
        // Cria container externo para forçar posicionamento vertical
        const container = document.createElement('div');
        container.className = 'checkbox-item';
        container.style.display = 'block';
        container.style.marginBottom = '8px';
        container.style.position = 'relative';
        
        // Criar a estrutura interna do item de checkbox
        const innerContainer = document.createElement('div');
        innerContainer.style.display = 'flex';
        innerContainer.style.alignItems = 'flex-start';
        
        // Criar o input do checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = checkboxId;
        checkbox.className = 'editor-checkbox';
        checkbox.style.marginRight = '8px';
        checkbox.style.marginTop = '3px';
        checkbox.style.cursor = 'pointer';
        
        // Adicionar evento de clique
        checkbox.addEventListener('click', function(e) {
          e.stopPropagation();
        });
        
        // Criar o span editável para o texto
        const label = document.createElement('span');
        label.contentEditable = 'true';
        label.dataset.for = checkboxId;
        label.className = 'checkbox-text';
        label.style.cursor = 'text';
        label.style.flex = '1';
        label.style.display = 'inline-block';
        label.style.minHeight = '1.2em';
        
        // Montar a estrutura
        innerContainer.appendChild(checkbox);
        innerContainer.appendChild(label);
        container.appendChild(innerContainer);
        
        // Obter a seleção atual
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        // Limpar a seleção atual e inserir o novo container
        range.deleteContents();
        range.insertNode(container);
        
        // Focar no label para digitação
        const newRange = document.createRange();
        newRange.setStart(label, 0);
        newRange.collapse(true);
        
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        // Forçar o foco no label
        label.focus();
      },
      
      // CORREÇÃO: Manipulador de tecla Enter em checkboxes
      handleKeyDown(e) {
        // Tratamento especial para listas de checkbox
        if (e.key === 'Enter' && !e.shiftKey) {
          // Obter seleção atual
          const selection = window.getSelection();
          if (!selection.rangeCount) return;
          
          // Encontrar se estamos dentro de um texto de checkbox
          let node = selection.anchorNode;
          let checkboxText = null;
          
          // Navegar para cima para encontrar o texto de checkbox
          while (node && node !== this.$refs.editorContent) {
            if (node.classList && node.classList.contains('checkbox-text')) {
              checkboxText = node;
              break;
            }
            if (node.nodeType === 3 && node.parentNode.classList && 
                node.parentNode.classList.contains('checkbox-text')) {
              checkboxText = node.parentNode;
              break;
            }
            node = node.parentNode;
          }
          
          // Se estamos dentro de um texto de checkbox
          if (checkboxText) {
            e.preventDefault(); // Impedir comportamento padrão do Enter
            
            // Encontrar o item de checkbox completo (div container externo)
            let checkboxItem = checkboxText.parentNode.parentNode;
            
            // Verificar se estamos realmente em um item de checkbox
            if (checkboxItem && checkboxItem.classList.contains('checkbox-item')) {
              // Inserir um novo checkbox após o atual
              this.insertCheckboxAfter(checkboxItem);
              return;
            }
          }
        }
        
        // Limitar contagem de caracteres
        this.limitCharCount(e);
      },
      
      // Inserir um novo checkbox após outro existente
      insertCheckboxAfter(afterElement) {
        if (!afterElement) return;
        
        // Criar um novo checkbox com estrutura completa
        const checkboxId = `check-${Date.now()}`;
        
        // Criar container externo com display block para posicionamento adequado
        const container = document.createElement('div');
        container.className = 'checkbox-item';
        container.style.display = 'block'; // Garante que fique abaixo
        container.style.marginBottom = '8px';
        container.style.position = 'relative';
        
        // Container interno para flex layout
        const innerContainer = document.createElement('div');
        innerContainer.style.display = 'flex';
        innerContainer.style.alignItems = 'flex-start';
        
        // Input checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = checkboxId;
        checkbox.className = 'editor-checkbox';
        checkbox.style.marginRight = '8px';
        checkbox.style.marginTop = '3px';
        checkbox.style.cursor = 'pointer';
        
        // Texto editável
        const label = document.createElement('span');
        label.contentEditable = 'true';
        label.dataset.for = checkboxId;
        label.className = 'checkbox-text';
        label.style.cursor = 'text';
        label.style.flex = '1';
        label.style.display = 'inline-block';
        label.style.minHeight = '1.2em';
        
        // Montar a estrutura
        innerContainer.appendChild(checkbox);
        innerContainer.appendChild(label);
        container.appendChild(innerContainer);
        
        // Inserir após o elemento existente
        afterElement.parentNode.insertBefore(container, afterElement.nextSibling);
        
        // Focar no novo texto
        label.focus();
      },
      
      // Inicialização para checkboxes existentes
      initExistingCheckboxes() {
        if (!this.$refs.editorContent) return;
        
        // Buscar todos os checkboxes
        const checkboxes = this.$refs.editorContent.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
          // Verificar e corrigir a estrutura HTML necessária
          this.ensureCorrectCheckboxStructure(checkbox);
          
          // Adicionar eventos
          checkbox.onclick = (e) => {
            e.stopPropagation();
          };
        });
        
        // Também corrigir todos os spans editáveis de checkbox
        const checkboxTexts = this.$refs.editorContent.querySelectorAll('.checkbox-text');
        checkboxTexts.forEach(text => {
          text.addEventListener('click', (e) => {
            e.stopPropagation();
            text.focus();
          });
        });
      },
      
      // Garantir que cada checkbox tenha a estrutura correta
      ensureCorrectCheckboxStructure(checkbox) {
        // Encontrar o elemento pai que deve conter a estrutura correta
        let currentParent = checkbox.parentNode;
        
        // Se o pai não tem display flex ou não é o container interno correto
        if (window.getComputedStyle(currentParent).display !== 'flex') {
          // Precisamos corrigir a estrutura
          
          // 1. Criar container externo se necessário
          let outerContainer;
          if (!currentParent.classList.contains('checkbox-item')) {
            outerContainer = document.createElement('div');
            outerContainer.className = 'checkbox-item';
            outerContainer.style.display = 'block';
            outerContainer.style.marginBottom = '8px';
            outerContainer.style.position = 'relative';
            
            // Inserir antes do elemento atual
            currentParent.parentNode.insertBefore(outerContainer, currentParent);
          } else {
            outerContainer = currentParent;
          }
          
          // 2. Criar container interno para flex layout
          const innerContainer = document.createElement('div');
          innerContainer.style.display = 'flex';
          innerContainer.style.alignItems = 'flex-start';
          
          // 3. Mover o checkbox para o container interno
          currentParent.removeChild(checkbox);
          innerContainer.appendChild(checkbox);
          
          // 4. Criar ou mover o texto editável
          let textElement;
          const checkboxId = checkbox.id || `check-${Date.now()}`;
          checkbox.id = checkboxId;
          
          // Procurar por um elemento de texto associado (span ou label)
          const existingText = currentParent.querySelector(`[data-for="${checkboxId}"]`) || 
                             currentParent.querySelector(`label[for="${checkboxId}"]`);
          
          if (existingText) {
            // Usar o elemento existente, mas garantir que é um span com a classe correta
            if (existingText.tagName !== 'SPAN') {
              textElement = document.createElement('span');
              textElement.innerHTML = existingText.innerHTML;
              textElement.contentEditable = 'true';
              currentParent.removeChild(existingText);
            } else {
              textElement = existingText;
              currentParent.removeChild(textElement);
            }
          } else {
            // Criar um novo elemento de texto
            textElement = document.createElement('span');
            textElement.contentEditable = 'true';
            
            // Se houver texto próximo ao checkbox, usá-lo
            if (checkbox.nextSibling && checkbox.nextSibling.nodeType === 3) {
              textElement.textContent = checkbox.nextSibling.textContent.trim();
              if (checkbox.nextSibling.parentNode) {
                checkbox.nextSibling.parentNode.removeChild(checkbox.nextSibling);
              }
            }
          }
          
          // Configurar o elemento de texto
          textElement.className = 'checkbox-text';
          textElement.dataset.for = checkboxId;
          textElement.style.cursor = 'text';
          textElement.style.flex = '1';
          textElement.style.display = 'inline-block';
          textElement.style.minHeight = '1.2em';
          
          // Adicionar o texto ao container interno
          innerContainer.appendChild(textElement);
          
          // Adicionar o container interno ao container externo
          outerContainer.appendChild(innerContainer);
          
          // Se o parent atual não for o container externo e estiver vazio, removê-lo
          if (currentParent !== outerContainer && 
              (!currentParent.hasChildNodes() || currentParent.childNodes.length === 0)) {
            currentParent.parentNode.removeChild(currentParent);
          }
        }
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
        // Abordagem para truncar texto preservando a estrutura HTML
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
        
        // Reinicializar os checkboxes após truncar
        this.$nextTick(() => {
          this.initExistingCheckboxes();
        });
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
          if (this.$refs.editorContent) {
            this.setEditorContent('');
          }
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
            // Inicializar array de items se necessário
            if (!Array.isArray(this.items)) {
              this.items = [];
            }
            
            // Obter conteúdo do editor
            const conteudoAssunto = this.getEditorContent();
            
            // Construir o objeto de atividade
            const atividade = {
              id: this.cd || Date.now(),
              cd: this.cd || Date.now(),
              nmatividade: this.nmatividade,
              assunto: conteudoAssunto,
              icon: this.selectedIcon.icon,
              idicon: this.selectedIcon.icon,
              attachments: [...this.currentAttachments],
              nordem: this.items.length // Nova atividade fica no final por padrão
            };
            
            // Verificar se é uma edição ou uma nova atividade
            if (this.cd) {
              // Atualização de item existente
              const index = this.items.findIndex(item => (item.id || item.cd) === this.cd);
              if (index !== -1) {
                // Manter a ordem original
                atividade.nordem = this.items[index].nordem || index;
                // Substituir o item no array
                this.items.splice(index, 1, atividade);
              } else {
                // Se não encontrar, adicionar como novo
                this.items.push(atividade);
              }
            } else {
              // Novo item - adicionar ao final do array
              this.items.push(atividade);
            }
            
            // Tentar salvar no store
            try {
              await this.$store.dispatch('addAtividade', [atividade]);
              await this.refresh(true);
            } catch (error) {
              console.error('Falha ao salvar no store, salvando no localStorage:', error);
              // Se falhar, salvar no localStorage
              this.salvarDados();
            }
            
            // Notificação de sucesso
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
          alert('Erro ao salvar atividade: ' + (error.message || error));
        } finally {
          this.loading = false;
        }
      },
      
      // Abre o formulário para edição
      openEdit(id) {
        this.valid = true;
        this.cd = id;
        
        // Buscar dados da atividade
        const atividade = this.items.find(item => (item.id || item.cd) === id);
        if (atividade) {
          this.nmatividade = atividade.nmatividade || atividade.nmsituacao || '';
          
          // Definir o ícone
          const icon = atividade.icon || atividade.idicon || 'mdi-checkbox-blank-circle-outline';
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
      async deleteItem(id) {
        // Confirmar exclusão
        if (!confirm('Deseja realmente excluir este item?')) {
          return;
        }
        
        try {
          // Tentar excluir via store
          try {
            await this.$store.dispatch('deleteAtividade', id);
            await this.refresh(true);
          } catch (err) {
            console.error('Falha ao excluir do store, removendo localmente:', err);
            // Remover localmente
            const index = this.items.findIndex(item => (item.id || item.cd) === id);
            if (index !== -1) {
              this.items.splice(index, 1);
              this.salvarDados();
            }
          }
          
          // Notificação
          try {
            if (this.$notifier) {
              this.$notifier({ content: 'Atividade excluída com sucesso!', color: 'success' });
            } else {
              alert('Atividade excluída com sucesso!');
            }
          } catch (error) {
            console.log('Atividade excluída com sucesso!');
          }
        } catch (err) {
          console.error('Erro ao excluir:', err);
          alert('Erro ao excluir atividade: ' + (err.message || err));
        }
      }
    }
  }
</script>

<style lang="scss">
  /* Estilos do componente BaseCadastroSituacao */
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

  /* Estilos do modal e editor */
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

  /* Estilos para items de checkbox no editor */
  .checkbox-item {
    display: block !important; /* Força display block para garantir posicionamento vertical */
    margin-bottom: 8px;
    position: relative;
  }

  /* Estilo para o container interno flex */
  .checkbox-item > div {
    display: flex;
    align-items: flex-start;
  }

  /* Estilo para o checkbox */
  .editor-checkbox {
    margin-right: 8px;
    margin-top: 3px;
    cursor: pointer;
    width: 16px;
    height: 16px;
  }

  /* Estilo para o texto editável */
  .checkbox-text {
    flex: 1;
    min-height: 1.2em;
    cursor: text;
    outline: none;
    padding: 1px 0;
  }

  /* Estilo quando o checkbox está marcado */
  input[type="checkbox"]:checked + .checkbox-text {
    color: #757575;
    text-decoration: line-through;
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

  /* Ajuste para garantir que os checkbox-items fiquem verticalmente alinhados */
  #editor-content > .checkbox-item + .checkbox-item {
    margin-top: 8px; /* Espaçamento extra entre checkboxes consecutivos */
  }
</style>