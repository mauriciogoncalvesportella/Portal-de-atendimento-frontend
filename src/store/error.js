// src/store/error.js
export default {
  namespaced: true,
  state: {
    message: null,
    type: null,
    details: null,
  },
  mutations: {
    SET_ERROR(state, { message, type = "error", details = null }) {
      state.message = message;
      state.type = type;
      state.details = details;
    },
    CLEAR_ERROR(state) {
      state.message = null;
      state.type = null;
      state.details = null;
    },
  },
  actions: {
    handleError({ commit }, errorPayload) {
      commit("SET_ERROR", errorPayload);
      console.error("Erro capturado:", errorPayload);
    },
    clearError({ commit }) {
      commit("CLEAR_ERROR");
    },
  },
  getters: {
    currentError: (state) => (state.message ? state : null),
    hasError: (state) => !!state.message,
  },
};