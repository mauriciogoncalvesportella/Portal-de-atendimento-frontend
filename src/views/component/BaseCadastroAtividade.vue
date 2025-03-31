<template>
  <div>
    <v-simple-table>
      <template #top>
        <div class="px-3 py-2 d-flex justify-space-between align-center primary white--text text-h5">
          <span>Atividades</span>
          <div>
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  fab
                  small
                  elevation="0"
                  class="mr-1 primary"
                  v-bind="attrs"
                  v-on="on"
                  @click="sortAlpha"
                >
                  <v-icon>mdi-sort-alphabetical-ascending</v-icon>
                </v-btn>
              </template>
              Ordenar alfabeticamente
            </v-tooltip>

            <v-dialog v-model="dialog" max-width="900" persistent>
              <template #activator="{ on, attrs }">
                <v-btn fab small elevation="0" v-bind="attrs" v-on="on" @click="resetForm">
                  <v-icon color="primary">mdi-table-plus</v-icon>
                </v-btn>
              </template>

              <v-card>
                <v-card-title class="primary white--text">
                  <v-icon class="mr-1" color="white">
                    mdi-table-{{ cd ? 'edit' : 'plus' }}
                  </v-icon>
                  {{ cd ? 'Editar' : 'Criar' }} Atividade
                </v-card-title>

                <v-form ref="form" v-model="valid">
                  <v-card-text>
                    <v-text-field
                      v-model="nmatividade"
                      label="Título"
                      :rules="[rules.required, rules.maxLength]"
                      filled
                      validate-on-blur
                      class="mb-4"
                      maxlength="100"
                      counter="100"
                    />

                    <!-- Campo para selecionar status da atividade -->
                    <v-select
                      v-model="selectedStatus"
                      :items="statusOptions"
                      label="Status da Atividade"
                      filled
                      class="mb-4"
                      @change="updateIconBasedOnStatus"
                    >
                      <template #selection="{ item }">
                        <div class="d-flex align-center">
                          <v-icon left small :color="getStatusColor(item)">
                            {{ getDefaultIconForStatus(item) }}
                          </v-icon>
                          {{ item }}
                        </div>
                      </template>
                      <template #item="{ item }">
                        <div class="d-flex align-center">
                          <v-icon left small :color="getStatusColor(item)">
                            {{ getDefaultIconForStatus(item) }}
                          </v-icon>
                          {{ item }}
                        </div>
                      </template>
                    </v-select>

                    <v-divider class="my-4"></v-divider>

                    <div class="mb-4">
                      <label class="grey--text text--darken-1 font-weight-medium mb-2 d-block">
                        Assunto
                      </label>

                      <div class="editor-toolbar d-flex flex-wrap align-center mb-2 pa-1 rounded-t">
                        <v-btn icon small class="mr-1" @click="execCommand('bold')" title="Negrito">
                          <span class="font-weight-bold">B</span>
                        </v-btn>
                        <v-btn icon small class="mr-1" @click="execCommand('italic')" title="Itálico">
                          <span class="font-italic">I</span>
                        </v-btn>
                        <v-btn icon small class="mr-1" @click="execCommand('underline')" title="Sublinhado">
                          <span class="text-decoration-underline">U</span>
                        </v-btn>

                        <v-btn-toggle dense>
                          <v-btn icon small @click="execCommand('justifyLeft')" title="Alinhar à esquerda">
                            <v-icon small>mdi-format-align-left</v-icon>
                          </v-btn>
                          <v-btn icon small @click="execCommand('justifyCenter')" title="Centralizar">
                            <v-icon small>mdi-format-align-center</v-icon>
                          </v-btn>
                          <v-btn icon small @click="execCommand('justifyRight')" title="Alinhar à direita">
                            <v-icon small>mdi-format-align-right</v-icon>
                          </v-btn>
                        </v-btn-toggle>

                        <v-btn-toggle dense>
                          <v-btn icon small @click="execCommand('insertUnorderedList')" title="Lista com marcadores">
                            <v-icon small>mdi-format-list-bulleted</v-icon>
                          </v-btn>
                          <v-btn icon small @click="execCommand('insertOrderedList')" title="Lista numerada">
                            <v-icon small>mdi-format-list-numbered</v-icon>
                          </v-btn>
                        </v-btn-toggle>

                        <v-btn icon small class="mr-1" @click="insertCheckbox" title="Lista de verificação">
                          <v-icon small>mdi-checkbox-marked-outline</v-icon>
                        </v-btn>

                        <input ref="imageInput" type="file" accept="image/*" style="display: none" @change="handleImageUpload">
                        <v-btn icon small class="mr-1" @click="$refs.imageInput.click()" title="Inserir imagem">
                          <v-icon small>mdi-image</v-icon>
                        </v-btn>

                        <v-btn icon small class="mr-1" @click="insertTable" title="Inserir tabela">
                          <v-icon small>mdi-table</v-icon>
                        </v-btn>

                        <v-btn icon small class="mr-1" @click="insertLink" title="Inserir link">
                          <v-icon small>mdi-link</v-icon>
                        </v-btn>
                      </div>

                      <div
                        ref="editorContent"
                        id="editor-content"
                        contenteditable="true"
                        class="editor-content pa-3 rounded-b"
                        @input="updateCharCount"
                        @keydown="handleKeyDown"
                      ></div>

                      <div class="d-flex justify-end align-center mt-1">
                        <span class="caption grey--text">
                          {{ charCount }}/255 CARACTERES
                        </span>
                      </div>

                      <div class="d-flex justify-space-between align-center mt-2">
                        <input ref="fileInput" type="file" multiple style="display: none" @change="handleFileUpload">
                        <v-btn small outlined color="primary" class="text-none" @click="$refs.fileInput.click()">
                          <v-icon small left>mdi-paperclip</v-icon>
                          ANEXAR
                        </v-btn>

                        <v-chip-group v-if="currentAttachments.length" column>
                          <v-chip
                            v-for="(file, index) in currentAttachments"
                            :key="index"
                            close
                            small
                            @click:close="removeAttachment(index)"
                          >
                            {{ file.name }}
                          </v-chip>
                        </v-chip-group>
                      </div>
                    </div>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer />
                    <v-btn text color="grey darken-1" @click="cancelar" class="mr-2">
                      CANCELAR
                    </v-btn>
                    <v-btn text color="primary" :loading="loading" :disabled="!valid" @click="salvarAtividade">
                      <v-icon left>
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
          @change="saveOrder"
        >
          <tr v-for="(item, i) in items" :key="`item-${item.id || item.cd}`" style="cursor: grab">
            <td>{{ i + 1 }}</td>
            <td>
              <div class="d-flex align-center">
                <!-- Mostra o ícone baseado no status da atividade -->
                <v-icon class="mr-2" :color="getStatusColor(item.status)">
                  {{ item.icon || getDefaultIconForStatus(item.status) }}
                </v-icon>
                {{ item.nmatividade }}
              </div>
            </td>
            <td class="text-right d-flex justify-end align-center">
              <!-- Status do item -->
              <v-chip v-if="item.status" small class="mr-2" :color="getStatusColor(item.status)">
                {{ item.status }}
              </v-chip>
              
              <!-- Ícones de ação -->
              <v-btn icon @click="openEdit(item.id || item.cd)">
                <v-icon color="primary">mdi-table-edit</v-icon>
              </v-btn>
              <v-btn icon class="ml-3" @click="deleteItem(item.id || item.cd)">
                <v-icon color="red">mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </draggable>
      </template>
    </v-simple-table>
  </div>
</template>


<script>
import draggable from 'vuedraggable';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'BaseCadastroAtividade',
  components: { draggable },
  props: {
    initialData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      valid: true,
      items: [],
      dialog: false,
      nmatividade: '',
      cd: null,
      charCount: 0,
      selectedStatus: 'Pendente',
      statusOptions: [
        'Pendente',
        'Em andamento',
        'Concluídos',
        'Em Treinamento',
        'Finalizado',
        'Análise Suporte N1',
        'Aguardando Ret. Interno',
        'Aguardando Ret. Cliente',
        'Análise N2',
        'Correções - Programação',
        'Melhorias - Programação',
        'Aguardando Gilson',
        'Tablet - Programação',
        'Teste',
        'Atualizar Cliente',
        'Consulta Interna',
        'A Verificar',
        'Pendentes',
        'Via Suporte'
      ],
      rules: {
        required: value => !!value || 'Campo obrigatório',
        maxLength: value => (value && value.length <= 100) || 'Máximo 100 caracteres'
      },
      currentAttachments: []
    };
  },
  computed: {
    ...mapState('atividades', ['loading'])
  },
  created() {
    // Carregar atividades do backend via store
    this.carregarDadosBackend();
    document.addEventListener('click', this.handleDocumentClick);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleDocumentClick);
  },
  methods: {
    ...mapActions('atividades', [
      'fetchAtividades',
      'criarAtividade',
      'atualizarAtividade',
      'excluirAtividade'
    ]),
    
    // Método para definir a cor do status
    getStatusColor(status) {
      const statusColors = {
        'Pendente': 'orange',
        'Em andamento': 'primary',
        'Concluídos': 'success',
        'Em Treinamento': 'purple',
        'Finalizado': 'green',
        'Análise Suporte N1': 'blue lighten-2',
        'Aguardando Ret. Interno': 'amber',
        'Aguardando Ret. Cliente': 'orange lighten-1',
        'Análise N2': 'blue darken-1',
        'Correções - Programação': 'red lighten-2',
        'Melhorias - Programação': 'green lighten-1',
        'Aguardando Gilson': 'lime darken-1',
        'Tablet - Programação': 'indigo',
        'Teste': 'purple lighten-3',
        'Atualizar Cliente': 'teal',
        'Consulta Interna': 'cyan darken-1',
        'A Verificar': 'deep-orange',
        'Pendentes': 'orange darken-2',
        'Via Suporte': 'blue'
      };
      
      return statusColors[status] || 'grey';
    },
    
    // Método para atribuir ícone padrão com base no status
    getDefaultIconForStatus(status) {
      const statusIcons = {
        'Pendente': 'mdi-clipboard-clock',
        'Em andamento': 'mdi-clipboard-play',
        'Concluídos': 'mdi-clipboard-check',
        'Em Treinamento': 'mdi-school',
        'Finalizado': 'mdi-check-circle',
        'Análise Suporte N1': 'mdi-headset',
        'Aguardando Ret. Interno': 'mdi-timer-sand',
        'Aguardando Ret. Cliente': 'mdi-account-clock',
        'Análise N2': 'mdi-magnify',
        'Correções - Programação': 'mdi-bug',
        'Melhorias - Programação': 'mdi-trending-up',
        'Aguardando Gilson': 'mdi-account-clock',
        'Tablet - Programação': 'mdi-tablet',
        'Teste': 'mdi-test-tube',
        'Atualizar Cliente': 'mdi-update',
        'Consulta Interna': 'mdi-database-search',
        'A Verificar': 'mdi-clipboard-alert',
        'Pendentes': 'mdi-clipboard-text',
        'Via Suporte': 'mdi-headset'
      };
      
      return statusIcons[status] || 'mdi-clipboard-text';
    },
    
    // Método para atualizar ícone baseado no status selecionado
    updateIconBasedOnStatus() {
      // O sistema usa automaticamente o ícone padrão para o status selecionado
      // Não é necessário armazenar um valor separado para o ícone
    },
    
    // Método para carregar dados do backend
    async carregarDadosBackend() {
      try {
        // Usar dados iniciais ou carregar do backend
        if (this.initialData && this.initialData.length > 0) {
          this.items = this.initialData;
        } else {
          const data = await this.fetchAtividades();
          // Mapear dados do backend para o formato esperado pelo componente
          this.items = this.mapearDadosBackend(data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar atividades:', error);
        // Fallback para dados padrão ou localStorage
        const saved = localStorage.getItem('atividades');
        try {
          const parsed = JSON.parse(saved);
          this.items = Array.isArray(parsed) ? parsed : this.dadosIniciais();
        } catch (e) {
          this.items = this.dadosIniciais();
        }
      }
    },
    
    // Mapear dados do backend para o formato do frontend
    mapearDadosBackend(atividadesBackend) {
      return atividadesBackend.map((atividade, index) => {
        return {
          id: atividade.id,
          cd: atividade.id,
          nmatividade: atividade.titulo,
          descricao: atividade.descricao,
          status: atividade.status,
          responsavel: atividade.responsavel,
          prioridade: atividade.prioridade,
          nordem: index
        };
      });
    },
    
    dadosIniciais() {
      return [
        { id: 1, cd: 1, nmatividade: 'Análise Suporte N1', status: 'Análise Suporte N1', nordem: 0 },
        { id: 2, cd: 2, nmatividade: 'Aguardando Ret. Interno', status: 'Aguardando Ret. Interno', nordem: 1 },
        { id: 3, cd: 3, nmatividade: 'Aguardando Ret. Cliente', status: 'Aguardando Ret. Cliente', nordem: 2 },
        { id: 4, cd: 4, nmatividade: 'A Verificar', status: 'A Verificar', nordem: 3 },
        { id: 5, cd: 5, nmatividade: 'Pendentes', status: 'Pendentes', nordem: 4 },
        { id: 6, cd: 6, nmatividade: 'Via Suporte', status: 'Via Suporte', nordem: 5 },
        { id: 7, cd: 7, nmatividade: 'Aguardando Gilson', status: 'Aguardando Gilson', nordem: 6 },
        { id: 8, cd: 8, nmatividade: 'Tablet - Programação', status: 'Tablet - Programação', nordem: 7 },
        { id: 9, cd: 9, nmatividade: 'Teste', status: 'Teste', nordem: 8 },
        { id: 10, cd: 10, nmatividade: 'Atualizar Cliente', status: 'Atualizar Cliente', nordem: 9 },
        { id: 11, cd: 11, nmatividade: 'Consulta Interna', status: 'Consulta Interna', nordem: 10 },
        { id: 12, cd: 12, nmatividade: 'Finalizado', status: 'Finalizado', nordem: 11 }
      ];
    },
    
    // Método de salvamento local (fallback)
    salvarDadosLocal() {
      localStorage.setItem('atividades', JSON.stringify(this.items));
      this.$emit('update', this.items);
    },
    
    async sortAlpha() {
      if (!Array.isArray(this.items)) return;
      this.items.sort((a, b) => (a.nmatividade || '').localeCompare(b.nmatividade || ''));
      await this.saveOrder();
    },
    
    async saveOrder() {
      this.items.forEach((item, i) => item.nordem = i);
      try {
        // Tentar atualizar a ordem no backend
        // Nota: isso pode exigir um endpoint específico para atualização em lote
        // Por enquanto, apenas emitimos o evento de alteração
        this.$emit('order-changed', this.items);
        this.salvarDadosLocal(); // Fallback para local
      } catch (e) {
        console.error('Erro ao salvar ordem:', e);
        this.salvarDadosLocal();
      }
    },
    
    resetForm() {
      this.dialog = true;
      this.cd = null;
      this.nmatividade = '';
      this.selectedStatus = 'Pendente';
      this.charCount = 0;
      this.currentAttachments = [];
      if (this.$refs.editorContent) this.$refs.editorContent.innerHTML = '';
    },
    
    async openEdit(id) {
      const item = this.items.find(i => (i.id || i.cd) === id);
      if (!item) return;
      
      this.cd = item.id || item.cd;
      this.nmatividade = item.nmatividade;
      this.selectedStatus = item.status || 'Pendente';
      
      if (this.$refs.editorContent && item.descricao) {
        this.$refs.editorContent.innerHTML = item.descricao;
        this.updateCharCount();
      }
      
      this.dialog = true;
    },
    
    cancelar() {
      this.dialog = false;
    },
    
    async salvarAtividade() {
      if (!this.valid) return;
      
      try {
        // Preparar objeto de atividade para backend
        const atividadeBackend = {
          titulo: this.nmatividade,
          descricao: this.$refs.editorContent?.innerHTML || '',
          status: this.selectedStatus,
          prioridade: 'Média', // Prioridade padrão
          responsavel: ''
        };
        
        if (this.cd) {
          // Atualizar atividade existente
          atividadeBackend.id = this.cd;
          await this.atualizarAtividade(atividadeBackend);
        } else {
          // Criar nova atividade
          await this.criarAtividade(atividadeBackend);
        }
        
        // Recarregar atividades do backend
        await this.carregarDadosBackend();
        this.dialog = false;
      } catch (error) {
        console.error('Erro ao salvar atividade:', error);
        // Fallback para persistência local se falhar
        this.salvarAtividadeLocal();
      }
    },
    
    // Método de fallback para salvar localmente
    salvarAtividadeLocal() {
      const atividade = {
        id: this.cd || Date.now(),
        cd: this.cd || Date.now(),
        nmatividade: this.nmatividade,
        descricao: this.$refs.editorContent?.innerHTML || '',
        status: this.selectedStatus,
        nordem: this.items.length
      };
      
      if (this.cd) {
        const idx = this.items.findIndex(i => (i.id || i.cd) === this.cd);
        if (idx !== -1) this.$set(this.items, idx, atividade);
      } else {
        this.items.push(atividade);
      }
      
      this.salvarDadosLocal();
      this.dialog = false;
    },
    
    async deleteItem(id) {
      try {
        // Excluir do backend
        await this.excluirAtividade(id);
        // Recarregar lista
        await this.carregarDadosBackend();
      } catch (error) {
        console.error('Erro ao excluir atividade:', error);
        // Fallback para exclusão local
        this.items = this.items.filter(i => (i.id || i.cd) !== id);
        this.salvarDadosLocal();
      }
    },
    
    execCommand(cmd, val = null) {
      document.execCommand(cmd, false, val);
      this.$refs.editorContent?.focus();
      this.updateCharCount();
    },
    
    updateCharCount() {
      const content = this.$refs.editorContent?.textContent || '';
      this.charCount = Math.min(content.length, 255);
      if (content.length > 255) this.truncateContent();
    },
    
    truncateContent() {
      const el = this.$refs.editorContent;
      if (!el) return;
      const html = el.innerHTML;
      const temp = document.createElement('div');
      temp.innerHTML = html;
      const truncateNode = (node, left) => {
        if (left <= 0) return 0;
        if (node.nodeType === 3) {
          if (node.length > left) node.textContent = node.textContent.substring(0, left);
          return left - node.length;
        }
        if (node.nodeType === 1) {
          let remaining = left;
          const children = Array.from(node.childNodes);
          for (let i = 0; i < children.length; i++) {
            remaining = truncateNode(children[i], remaining);
            if (remaining <= 0) {
              for (let j = i + 1; j < children.length; j++) node.removeChild(children[j]);
              break;
            }
          }
          return remaining;
        }
        return left;
      };
      truncateNode(temp, 255);
      el.innerHTML = temp.innerHTML;
    },
    
    handleDocumentClick(e) {
      if (e.target.type === 'checkbox' && this.$refs.editorContent?.contains(e.target)) {
        e.stopPropagation();
      }
    },
    
    handleKeyDown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;
        let node = sel.anchorNode;
        let text = null;
        while (node && node !== this.$refs.editorContent) {
          if (node.classList?.contains('checkbox-text')) {
            text = node;
            break;
          }
          node = node.parentNode;
        }
        if (text) {
          e.preventDefault();
          const item = text.closest('.checkbox-item');
          if (item) this.insertCheckboxAfter(item);
          return;
        }
      }
      this.limitCharCount(e);
    },
    
    limitCharCount(e) {
      if (this.charCount >= 255) {
        const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Control', 'Meta'];
        if (!allowed.includes(e.key)) e.preventDefault();
      }
    },
    
    insertCheckbox() {
      const id = `check-${Date.now()}`;
      const el = document.createElement('div');
      el.className = 'checkbox-item';
      el.style.marginBottom = '8px';
      const inner = document.createElement('div');
      inner.style.display = 'flex';
      inner.style.alignItems = 'flex-start';
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.id = id;
      box.style.marginRight = '8px';
      box.style.marginTop = '3px';
      const label = document.createElement('span');
      label.contentEditable = 'true';
      label.className = 'checkbox-text';
      label.style.flex = '1';
      label.style.minHeight = '1.2em';
      inner.appendChild(box);
      inner.appendChild(label);
      el.appendChild(inner);
      const sel = window.getSelection();
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(el);
      const newRange = document.createRange();
      newRange.setStart(label, 0);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      label.focus();
    },
    
    insertCheckboxAfter(refEl) {
      if (!refEl) return;
      const id = `check-${Date.now()}`;
      const el = document.createElement('div');
      el.className = 'checkbox-item';
      el.style.marginBottom = '8px';
      const inner = document.createElement('div');
      inner.style.display = 'flex';
      inner.style.alignItems = 'flex-start';
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.id = id;
      box.style.marginRight = '8px';
      box.style.marginTop = '3px';
      const label = document.createElement('span');
      label.contentEditable = 'true';
      label.className = 'checkbox-text';
      label.style.flex = '1';
      label.style.minHeight = '1.2em';
      inner.appendChild(box);
      inner.appendChild(label);
      el.appendChild(inner);
      refEl.parentNode.insertBefore(el, refEl.nextSibling);
      label.focus();
    },
    
    insertTable() {
      const rows = parseInt(prompt('Número de linhas:', '3')) || 3;
      const cols = parseInt(prompt('Número de colunas:', '3')) || 3;
      let html = '<table style="width: 100%; border-collapse: collapse;">';
      html += '<thead><tr>' + Array(cols).fill('<th style="border: 1px solid #ddd; padding: 8px;"></th>').join('') + '</tr></thead>';
      html += '<tbody>' + Array(rows - 1).fill('<tr>' + Array(cols).fill('<td style="border: 1px solid #ddd; padding: 8px;"></td>').join('') + '</tr>').join('') + '</tbody>';
      html += '</table>';
      this.execCommand('insertHTML', html);
    },
    
    insertLink() {
      const url = prompt('Informe a URL do link:', 'http://');
      if (url) this.execCommand('createLink', url);
    },
    
    handleImageUpload(e) {
      const file = e.target.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = evt => {
        const img = new Image();
        img.onload = () => {
          let width = img.width, height = img.height;
          const maxW = 300, maxH = 200;
          if (width > maxW) { height = (height * maxW) / width; width = maxW; }
          height = (height * maxW) / width; 
          if (height > maxH) { width = (width * maxH) / height; height = maxH; }
          const html = `<img src="${evt.target.result}" style="width: ${width}px; height: ${height}px; max-width: 100%;" />`;
          this.execCommand('insertHTML', html);
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
      this.$refs.imageInput.value = '';
    },
    
    handleFileUpload(e) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        if (this.currentAttachments.length >= 5) return;
        if (file.size > 10 * 1024 * 1024) return;
        this.currentAttachments.push({ name: file.name, file, size: file.size, type: file.type });
      });
    },
    
    removeAttachment(index) {
      this.currentAttachments.splice(index, 1);
    }
  }
};
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
  
  /* Estilos para os ícones de status */
  .status-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.05);
    margin-right: 8px;
  }
  
  /* Estilo para a tabela principal de atividades */
  .v-simple-table {
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  }
  
  /* Estilo para as linhas da tabela em foco/hover */
  .v-data-table tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.02) !important;
  }
  
  /* Estilo para os chips de status */
  .v-chip.status-chip {
    font-size: 12px;
    height: 24px;
  }
  
  /* Estilo para o cabeçalho da tabela */
  .v-data-table thead th {
    font-size: 14px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.7);
  }
  
  /* Estilo para o editor de texto */
  .editor-toolbar {
    background-color: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
  
  /* Melhorar estilo para v-tooltip */
  .v-tooltip__content {
    font-size: 12px;
    padding: 4px 8px;
    background-color: rgba(33, 33, 33, 0.9);
  }
</style>