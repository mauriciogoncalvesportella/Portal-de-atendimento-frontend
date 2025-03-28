import API from "@/api";

export default {
  namespaced: true,
  state: {
    atividades: [],
    loading: false,
  },
  mutations: {
    SET_ATIVIDADES(state, atividades) {

      // Garantir que não há duplicatas no array por ID
      const idsUnicos = {};
      state.atividades = atividades.filter((item) => {
        if (!item || !item.id) {
          return false;
        }

        if (idsUnicos[item.id]) {
          return false; // Remover duplicata
        } else {
          idsUnicos[item.id] = true;
          return true;
        }
      });
    },
    ADD_ATIVIDADE(state, atividade) {

      // Verifica se a atividade é válida antes de adicionar
      if (atividade && atividade.id) {
        // Evita adicionar se já existe um item com mesmo ID
        if (!state.atividades.some((a) => a.id === atividade.id)) {
          state.atividades.push(atividade);
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
      } else {
        console.warn(
          "[Debug Store] Atividade não encontrada para atualização:",
          atividade.id
        );
      }
    },
    REMOVE_ATIVIDADE(state, id) {

      const index = state.atividades.findIndex((a) => a.id === id);
      if (index !== -1) {
        state.atividades.splice(index, 1);
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
      try {
        commit("SET_LOADING", true);
        const data = await API.Atividade.all();
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
      try {
        commit("SET_LOADING", true);
        const resultado = await API.Atividade.delete(id);

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
