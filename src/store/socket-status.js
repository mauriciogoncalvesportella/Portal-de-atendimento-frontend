export default {
  namespaced: true,
  state: () => ({
    connected: false,
  }),

  mutations: {
    SET_CONNECTED (state, payload) {
      state.connected = payload
    },
  },
}
