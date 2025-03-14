import vue from '@/main'

export default {
  namespaced: true,
  state: () => ({
    cssId: 'FloatMenuTheme',
    colorTheme: localStorage.getItem('theme') ?? '#1976D2',
    floatMenu: parseInt(localStorage.getItem('floatMenuTheme') ?? 1) === 1,
    colors: [
      '#1976D2',
      '#00695C',
      '#C62828',
      '#3F51B5',
      '#EF6C00',
      '#6D4C41',
      '#9C27b0',
      '#212121',
    ],
  }),

  mutations: {
    SET_COLORTHEME (state, payload) {
      if (payload) {
        state.colorTheme = payload
        localStorage.setItem('theme', payload)
        vue.$vuetify.theme.themes.light.primary = payload
      }
    },

    SET_FLOATMENU (state, payload) {
      state.floatMenu = payload
      localStorage.setItem('floatMenuTheme', payload ? 1 : 0)
    },
  },

  actions: {
    setColorTheme ({ commit }, color) {
      commit('SET_COLORTHEME', color)
    },

    toggleFloatMenu ({ commit, state }) {
      commit('SET_FLOATMENU', !state.floatMenu)
    },
  },
}
