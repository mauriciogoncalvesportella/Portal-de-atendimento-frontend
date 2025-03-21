import API from "@/api";

export default {
  namespaced: true,
  state: {
    atividades: [],
    loading: false,
  },
  mutations: {
    SET_ATIVIDADES(state, atividades) {
      console.log(
        "[Debug Store] SET_ATIVIDADES chamado com",
        atividades?.length || 0,
        "itens"
      );

      // Garantir que não há duplicatas no array por ID
      const idsUnicos = {};
      state.atividades = atividades.filter((item) => {
        if (!item || !item.id) {
          console.log("[Debug Store] Item sem ID ignorado:", item);
          return false;
        }

        if (idsUnicos[item.id]) {
          console.log("[Debug Store] Item duplicado removido:", item.id);
          return false; // Remover duplicata
        } else {
          idsUnicos[item.id] = true;
          return true;
        }
      });

      console.log(
        "[Debug Store] Após filtrar duplicatas restaram:",
        state.atividades.length
      );
    },
    ADD_ATIVIDADE(state, atividade) {
      console.log("[Debug Store] ADD_ATIVIDADE chamado com:", atividade);

      // Verifica se a atividade é válida antes de adicionar
      if (atividade && atividade.id) {
        // Evita adicionar se já existe um item com mesmo ID
        if (!state.atividades.some((a) => a.id === atividade.id)) {
          state.atividades.push(atividade);
          console.log("[Debug Store] Atividade adicionada com sucesso");
        } else {
          console.warn(
            `[Debug Store] Tentativa de adicionar atividade com ID duplicado: ${atividade.id}`
          );
        }
      } else {
        console.error(
          "[Debug Store] Tentativa de adicionar atividade inválida:",
          atividade
        );
      }
    },
    UPDATE_ATIVIDADE(state, atividade) {
      console.log("[Debug Store] UPDATE_ATIVIDADE chamado com:", atividade);

      if (!atividade || !atividade.id) {
        console.error(
          "[Debug Store] Tentativa de atualizar atividade inválida:",
          atividade
        );
        return;
      }

      const index = state.atividades.findIndex((a) => a.id === atividade.id);
      if (index !== -1) {
        state.atividades.splice(index, 1, atividade);
        console.log("[Debug Store] Atividade atualizada com sucesso");
      } else {
        console.warn(
          "[Debug Store] Atividade não encontrada para atualização:",
          atividade.id
        );
      }
    },
    REMOVE_ATIVIDADE(state, id) {
      console.log("[Debug Store] REMOVE_ATIVIDADE chamado com ID:", id);

      const index = state.atividades.findIndex((a) => a.id === id);
      if (index !== -1) {
        state.atividades.splice(index, 1);
        console.log("[Debug Store] Atividade removida com sucesso");
      } else {
        console.warn(
          "[Debug Store] Atividade não encontrada para remoção:",
          id
        );
      }
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
  },
  actions: {
    async fetchAtividades({ commit }) {
      console.log("[Debug Store] fetchAtividades iniciado");
      try {
        commit("SET_LOADING", true);
        const data = await API.Atividade.all();
        console.log(
          "[Debug Store] fetchAtividades recebeu dados:",
          data?.length || 0
        );
        commit("SET_ATIVIDADES", data);
        return data;
      } catch (error) {
        console.error("[Debug Store] Erro ao buscar atividades:", error);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async criarAtividade({ commit, state }, atividade) {
      console.log("[Debug Store] criarAtividade chamado com:", atividade);
      try {
        commit("SET_LOADING", true);

        // Verificação mais suave para títulos duplicados
        if (
          state.atividades.some(
            (a) =>
              a.titulo &&
              atividade.titulo &&
              a.titulo.toLowerCase().trim() ===
                atividade.titulo.toLowerCase().trim()
          )
        ) {
          console.warn(
            `[Debug Store] Título já existente: "${atividade.titulo}"`
          );
          throw new Error(
            `Já existe uma atividade com o título "${atividade.titulo}"`
          );
        }

        const data = await API.Atividade.add(atividade);
        console.log("[Debug Store] criarAtividade recebeu resposta:", data);

        // Verifica se recebeu dados válidos da API
        if (!data || !data.id) {
          console.error(
            "[Debug Store] API retornou dados inválidos ao criar atividade:",
            data
          );
          throw new Error("Erro ao criar atividade: dados inválidos");
        }

        commit("ADD_ATIVIDADE", data);
        return data;
      } catch (error) {
        console.error("[Debug Store] Erro ao criar atividade:", error);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async atualizarAtividade({ commit, state }, atividade) {
      console.log("[Debug Store] atualizarAtividade chamado com:", atividade);
      try {
        commit("SET_LOADING", true);

        // Verificação mais suave para títulos duplicados, exceto o próprio item
        const tituloExistente = state.atividades.some(
          (a) =>
            a.titulo &&
            atividade.titulo &&
            a.titulo.toLowerCase().trim() ===
              atividade.titulo.toLowerCase().trim() &&
            a.id !== atividade.id
        );

        if (tituloExistente) {
          console.warn(
            `[Debug Store] Título já existente em outro item: "${atividade.titulo}"`
          );
          throw new Error(
            `Já existe uma atividade com o título "${atividade.titulo}"`
          );
        }

        const data = await API.Atividade.update(atividade);
        console.log("[Debug Store] atualizarAtividade recebeu resposta:", data);

        // Verifica se recebeu dados válidos da API
        if (!data || !data.id) {
          console.error(
            "[Debug Store] API retornou dados inválidos ao atualizar atividade:",
            data
          );
          throw new Error("Erro ao atualizar atividade: dados inválidos");
        }

        commit("UPDATE_ATIVIDADE", data);
        return data;
      } catch (error) {
        console.error("[Debug Store] Erro ao atualizar atividade:", error);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async excluirAtividade({ commit }, id) {
      console.log("[Debug Store] excluirAtividade chamado com ID:", id);
      try {
        commit("SET_LOADING", true);
        const resultado = await API.Atividade.delete(id);
        console.log(
          "[Debug Store] excluirAtividade recebeu resposta:",
          resultado
        );

        if (resultado) {
          commit("REMOVE_ATIVIDADE", id);
        } else {
          console.error("[Debug Store] Falha ao excluir atividade com ID:", id);
          throw new Error("Erro ao excluir atividade");
        }

        return resultado;
      } catch (error) {
        console.error("[Debug Store] Erro ao excluir atividade:", error);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },
};
