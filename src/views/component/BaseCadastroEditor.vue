<template>
  <div>
    <h3>Cadastro de Atividades</h3>
    <v-card class="mb-5">
      <v-card-text>
        <v-text-field
          label="Título"
          v-model="formData.titulo"
          filled
          placeholder="Assunto 1 exemplo"
        ></v-text-field>

        <Ck ref="ck" v-model="formData.conteudo" />

        <div class="d-flex justify-end mt-3">
          <v-btn color="primary" @click="salvar" :disabled="isSubmitting">
            <v-icon left>mdi-content-save</v-icon>
            SALVAR
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Informações de Debug -->
    <div
      v-if="isDebug"
      class="mb-2 pa-2"
      style="background-color: #f5f5f5; border-radius: 4px"
    >
      <p>
        <strong>Debug:</strong> Atividades: {{ atividades.length }}, Filtradas:
        {{ atividadesFiltradas.length }}
      </p>
    </div>

    <!-- Tabela de Atividades - Ajustada para melhor detecção de duplicatas -->
    <v-data-table
      :headers="headers"
      :items="atividadesFiltradas"
      :items-per-page="10"
      class="elevation-1"
      item-key="id"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Atividades Cadastradas</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
      </template>

      <template v-slot:item.acoes="{ item }">
        <v-icon small class="mr-2" @click="editarItem(item)">
          mdi-pencil
        </v-icon>
        <v-icon small @click="excluirItem(item)"> mdi-delete </v-icon>
      </template>
    </v-data-table>

    <!-- Dialog para confirmação de exclusão -->
    <v-dialog v-model="dialogExcluir" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirmar exclusão</v-card-title>
        <v-card-text>Deseja realmente excluir esta atividade?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialogExcluir = false"
            >Cancelar</v-btn
          >
          <v-btn color="error" text @click="confirmarExclusao">Confirmar</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para edição -->
    <v-dialog v-model="dialogEditar" max-width="800px">
      <v-card v-if="itemEmEdicao">
        <v-card-title class="text-h5">Editar Atividade</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="itemEmEdicao.titulo"
            label="Título"
            filled
          ></v-text-field>
          <Ck ref="ckEditar" v-model="itemEmEdicao.conteudo" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialogEditar = false"
            >Cancelar</v-btn
          >
          <v-btn
            color="success"
            text
            @click="salvarEdicao"
            :disabled="isSubmitting"
            >Salvar</v-btn
          >
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Ck from "@/views/component/Ck.vue";

export default {
  name: "CadastroEditor",
  components: {
    Ck,
  },
  data() {
    return {
      isDebug: true, // Ative debug na interface
      formData: {
        titulo: "",
        conteudo: "",
      },
      headers: [
        { text: "ID", value: "id" },
        { text: "Título", value: "titulo" },
        { text: "Data de Criação", value: "dataCriacao" },
        { text: "Ações", value: "acoes", sortable: false },
      ],
      dialogExcluir: false,
      dialogEditar: false,
      itemEmEdicao: null,
      itemParaExcluir: null,
      isSubmitting: false, // Controle para evitar múltiplos cliques
    };
  },
  computed: {
    atividades() {
      console.log(
        "[Debug Component] Acessando atividades no state:",
        this.$store.state.atividades?.atividades?.length || 0
      );
      return this.$store.state.atividades?.atividades || [];
    },
    // Computed para filtrar duplicatas visuais - simplificado
    atividadesFiltradas() {
      console.log(
        "[Debug Component] Filtrando atividades:",
        this.atividades.length
      );
      // Manter apenas uma entrada para cada ID
      const idsProcessados = {};
      const filtradas = this.atividades.filter((item) => {
        if (!item || !item.id) {
          console.log("[Debug Component] Item sem ID ignorado:", item);
          return false;
        }

        if (idsProcessados[item.id]) {
          console.log("[Debug Component] Item duplicado filtrado:", item.id);
          return false; // Filtrar duplicatas
        } else {
          idsProcessados[item.id] = true;
          return true;
        }
      });

      console.log("[Debug Component] Após filtrar restaram:", filtradas.length);
      return filtradas;
    },
  },
  created() {
    console.log("[Debug Component] Componente criado");
    // Carregar atividades ao inicializar
    this.carregarAtividades();
  },
  methods: {
    async carregarAtividades() {
      try {
        await this.$store.dispatch("atividades/fetchAtividades");
      } catch (error) {
        console.error("Erro ao carregar atividades:", error);

        // Tentar carregar do cache local diretamente
        if (error.response && error.response.status === 426) {
          const cache = this.$cacheManager.getFromCache("atividades");
          if (cache && cache.length) {
            this.$notifier({
              content: "Usando dados em cache para atividades",
              color: "warning",
            });
          } else {
            this.$notifier({
              content: "Erro ao carregar atividades",
              color: "error",
            });
          }
        } else {
          this.$notifier({
            content: "Erro ao carregar atividades",
            color: "error",
          });
        }
      }
    },

    async salvar() {
      console.log("[Debug Component] Método salvar chamado");
      try {
        if (this.isSubmitting) {
          console.log(
            "[Debug Component] Já está em processo de submissão, ignorando"
          );
          return;
        }

        this.isSubmitting = true;
        console.log("[Debug Component] Dados do formulário:", this.formData);

        if (!this.formData.titulo) {
          console.log("[Debug Component] Título obrigatório não informado");
          this.isSubmitting = false;
          return this.$notifier({
            content: "Título é obrigatório",
            color: "error",
          });
        }

        // Verificar também o conteúdo (opcional)
        if (!this.formData.conteudo) {
          console.log("[Debug Component] Conteúdo obrigatório não informado");
          this.isSubmitting = false;
          return this.$notifier({
            content: "O conteúdo da atividade é obrigatório",
            color: "error",
          });
        }

        const novaAtividade = {
          titulo: this.formData.titulo,
          conteudo: this.formData.conteudo,
        };

        console.log("[Debug Component] Despachando ação criarAtividade");
        await this.$store.dispatch("atividades/criarAtividade", novaAtividade);
        console.log("[Debug Component] Atividade criada com sucesso");

        // Limpar formulário
        this.formData.titulo = "";
        this.formData.conteudo = "";

        // Reiniciar o editor se o ref estiver disponível
        if (this.$refs.ck) {
          try {
            this.$refs.ck.restart();
            console.log("[Debug Component] Editor CK reiniciado");
          } catch (e) {
            console.error("[Debug Component] Erro ao reiniciar editor CK:", e);
          }
        }

        this.$notifier({
          content: "Atividade salva com sucesso!",
          color: "success",
        });

        // Recarregar atividades após salvar
        console.log("[Debug Component] Recarregando atividades após salvar");
        await this.carregarAtividades();
      } catch (error) {
        console.error("[Debug Component] Erro ao salvar atividade:", error);
        this.$notifier({
          content: error.message || "Erro ao salvar atividade",
          color: "error",
        });
      } finally {
        this.isSubmitting = false;
        console.log("[Debug Component] Finalizado processo de submissão");
      }
    },

    editarItem(item) {
      console.log("[Debug Component] Editando item:", item);
      this.itemEmEdicao = { ...item };
      this.dialogEditar = true;
    },

    async salvarEdicao() {
      console.log("[Debug Component] Método salvarEdicao chamado");
      try {
        if (this.isSubmitting) {
          console.log(
            "[Debug Component] Já está em processo de submissão, ignorando"
          );
          return;
        }

        this.isSubmitting = true;

        if (this.itemEmEdicao) {
          console.log(
            "[Debug Component] Dados do item em edição:",
            this.itemEmEdicao
          );

          if (!this.itemEmEdicao.titulo) {
            console.log(
              "[Debug Component] Título obrigatório não informado na edição"
            );
            this.isSubmitting = false;
            return this.$notifier({
              content: "Título é obrigatório",
              color: "error",
            });
          }

          console.log("[Debug Component] Despachando ação atualizarAtividade");
          await this.$store.dispatch(
            "atividades/atualizarAtividade",
            this.itemEmEdicao
          );

          this.dialogEditar = false;
          console.log("[Debug Component] Atividade atualizada com sucesso");

          // Recarregar atividades para refletir mudanças
          console.log(
            "[Debug Component] Recarregando atividades após atualizar"
          );
          await this.carregarAtividades();

          this.$notifier({
            content: "Atividade atualizada com sucesso!",
            color: "success",
          });
        }
      } catch (error) {
        console.error("[Debug Component] Erro ao atualizar atividade:", error);
        this.$notifier({
          content: error.message || "Erro ao atualizar atividade",
          color: "error",
        });
      } finally {
        this.isSubmitting = false;
        console.log("[Debug Component] Finalizado processo de edição");
      }
    },

    excluirItem(item) {
      console.log("[Debug Component] Excluindo item:", item);
      this.itemParaExcluir = item;
      this.dialogExcluir = true;
    },

    async confirmarExclusao() {
      console.log("[Debug Component] Método confirmarExclusao chamado");
      try {
        if (this.isSubmitting) {
          console.log(
            "[Debug Component] Já está em processo de submissão, ignorando"
          );
          return;
        }

        this.isSubmitting = true;

        if (this.itemParaExcluir) {
          console.log(
            "[Debug Component] Confirmando exclusão do item:",
            this.itemParaExcluir
          );

          console.log("[Debug Component] Despachando ação excluirAtividade");
          await this.$store.dispatch(
            "atividades/excluirAtividade",
            this.itemParaExcluir.id
          );

          this.dialogExcluir = false;
          console.log("[Debug Component] Atividade excluída com sucesso");

          // Recarregar atividades para refletir mudanças
          console.log("[Debug Component] Recarregando atividades após excluir");
          await this.carregarAtividades();

          this.$notifier({
            content: "Atividade excluída com sucesso!",
            color: "success",
          });
        }
      } catch (error) {
        console.error("[Debug Component] Erro ao excluir atividade:", error);
        this.$notifier({
          content: error.message || "Erro ao excluir atividade",
          color: "error",
        });
      } finally {
        this.isSubmitting = false;
        console.log("[Debug Component] Finalizado processo de exclusão");
      }
    },
  },
};
</script>
