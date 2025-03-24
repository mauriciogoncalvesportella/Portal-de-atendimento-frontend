import API from "@/api/";
import { omitBy, isNil } from "lodash";

export default {
  namespaced: true,
  state: {
    eventos: [],
    tiposAgendamento: [],
    loading: false,
    error: null,
  },
  mutations: {
    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },
    SET_EVENTOS(state, eventos) {
      state.eventos = eventos;
    },
    SET_TIPOS_AGENDAMENTO(state, tipos) {
      state.tiposAgendamento = tipos;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_ERROR(state) {
      state.error = null;
    },
    RESET(state) {
      state.eventos = [];
      state.tiposAgendamento = [];
      state.loading = false;
      state.error = null;
    },
  },
  actions: {
    async allEvento(
      { commit, dispatch },
      { dtinicio, dtfim, userTarget = null }
    ) {
      commit("SET_LOADING", true);
      commit("CLEAR_ERROR");

      try {
        const params = omitBy({ userTarget }, isNil);
        const response = await API.Agenda.allEvento(
          dtinicio,
          dtfim,
          userTarget
        );
        commit("SET_EVENTOS", response.data);
        return response.data;
      } catch (error) {
        dispatch(
          "error/handleError",
          {
            message: "Erro ao buscar eventos",
            type: "error",
            details: error,
          },
          { root: true }
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async addEvento({ commit, dispatch }, data) {
      commit("SET_LOADING", true);
      commit("CLEAR_ERROR");

      try {
        const response = await API.Agenda.addEvento(data);
        // Opcional: recarregar eventos após adicionar
        await this.dispatch("allEvento", {
          dtinicio: new Date().toISOString().split("T")[0],
          dtfim: new Date(new Date().setMonth(new Date().getMonth() + 1))
            .toISOString()
            .split("T")[0],
        });
        return response;
      } catch (error) {
        dispatch(
          "error/handleError",
          {
            message: "Erro ao adicionar evento",
            type: "error",
            details: error,
          },
          { root: true }
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async allTipoAgendamento({ commit, dispatch }, force = false) {
      commit("SET_LOADING", true);
      commit("CLEAR_ERROR");

      try {
        console.log("Chamando API agenda/tipo-agendamento/all");
        const response = await API.Agenda.allTipoAgendamento();
        console.log("Resposta recebida:", response);

        commit("SET_TIPOS_AGENDAMENTO", response.data);
        return response.data;
      } catch (error) {
        // Log detalhado de erro
        console.error("Erro detalhado na chamada allTipoAgendamento:", error);
        console.error("Status:", error.response?.status);
        console.error("Dados:", error.response?.data);

        // Verificação específica para erro 426
        if (error.response?.status === 426) {
          const versionControl = error.response.headers["version-control"];
          console.error("Erro de versão:", versionControl);

          dispatch(
            "error/handleError",
            {
              message: "Versão desatualizada. Por favor, atualize.",
              type: "warning",
              details: { versionControl },
            },
            { root: true }
          );
        } else {
          dispatch(
            "error/handleError",
            {
              message: "Erro ao buscar tipos de agendamento",
              type: "error",
              details: error,
            },
            { root: true }
          );
        }

        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async updateEvento({ commit, dispatch }, data) {
      commit("SET_LOADING", true);
      commit("CLEAR_ERROR");

      try {
        const response = await API.Agenda.updateEvento(data);
        // Opcional: recarregar eventos após atualizar
        await this.dispatch("allEvento", {
          dtinicio: new Date().toISOString().split("T")[0],
          dtfim: new Date(new Date().setMonth(new Date().getMonth() + 1))
            .toISOString()
            .split("T")[0],
        });
        return response;
      } catch (error) {
        dispatch(
          "error/handleError",
          {
            message: "Erro ao atualizar evento",
            type: "error",
            details: error,
          },
          { root: true }
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async deleteEvento({ commit, dispatch }, cd) {
      commit("SET_LOADING", true);
      commit("CLEAR_ERROR");

      try {
        const response = await API.Agenda.deleteEvento(cd);
        // Opcional: recarregar eventos após deletar
        await this.dispatch("allEvento", {
          dtinicio: new Date().toISOString().split("T")[0],
          dtfim: new Date(new Date().setMonth(new Date().getMonth() + 1))
            .toISOString()
            .split("T")[0],
        });
        return response;
      } catch (error) {
        dispatch(
          "error/handleError",
          {
            message: "Erro ao deletar evento",
            type: "error",
            details: error,
          },
          { root: true }
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },
  getters: {
    eventos: (state) => state.eventos,
    tiposAgendamento: (state) => state.tiposAgendamento,
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
  },
};
