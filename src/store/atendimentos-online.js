import API from '@/api/index'
import Vue from 'vue'

const initState = () => ({
  data: {},
  cssId: 'FloatMenuAtendimentosOnline',
  floatMenu: parseInt(localStorage.getItem('floatMenuAtendimentosOnline') ?? 1) === 1,
  loading: {
    getOnline: false,
  },
  loaded: {
    getOnline: false,
  },
})

export default {
  namespaced: true,
  state: initState(),
  mutations: {
    SET_DATA (state, payload) {
      state.data = payload
    },
    SET_ATENDIMENTO (state, { cduser, atendimento }) {
      state.data[cduser] = atendimento
    },
    SET_LOADING (state, { key, value }) {
      state.loading[key] = value
    },
    SET_LOADED (state, { key, value }) {
      state.loaded[key] = value
    },
    SET_FLOATMENU (state, payload) {
      state.floatMenu = payload
      localStorage.setItem('floatMenuAtendimentosOnline', payload ? 1 : 0)
    },
  },

  actions: {
    toggleFloatMenu ({ commit, state }) {
      commit('SET_FLOATMENU', !state.floatMenu)
    },

    async joinAtendimentosOnlineSocket ({ dispatch }) {
      const socket = Vue.prototype.$socketio.socket

      socket.emit('JoinRoom', 'AtendimentosOnline')

      socket.removeAllListeners('AtendimentosOnline/update')
      socket.on('AtendimentosOnline/update', data => {
        dispatch('updateAtendimento', data)
      })
    },

    async updateAtendimento ({ commit, rootGetters }, data) {
      if (data.sleep) {
        commit('SET_ATENDIMENTO', { cduser: data.cduser, atendimento: null })
      } else {
        const cduser = data._cduser
        const atendimento = data
        commit('SET_ATENDIMENTO', { cduser, atendimento })
      }

      const cduser = data._cduser ?? data.cduser
      if (rootGetters.user.cd !== cduser) {
        const idlogin = rootGetters.userMap[cduser].idlogin
        if (data.sleep) {
          Vue.prototype.$notifier({ content: `${idlogin} parou de atender`, halign: 'right' })
        } else {
          const idfantasia = rootGetters.chaveMap[data._cdchave].idfantasia
          Vue.prototype.$notifier({ content: `${idlogin} começou a atender "${idfantasia}"`, halign: 'right' })
        }
      }
    },

    async getOnline ({ state, commit, rootGetters, dispatch }, force) {
      await dispatch('userMap', { force: false, mutex: false }, { root: true })
      const userMap = rootGetters.userMap

      if (force || !state.loaded.getOnline) {
        try {
          commit('SET_LOADING', { key: 'getOnline', value: true })
          var entities = await API.Atendimento.getOnline()
        } finally {
          const data = {}
          for (const entity of entities) {
            data[entity._cduser] = entity
          }
          for (const user in userMap) {
            data[user] = data[user] ?? null
          }
          commit('SET_DATA', data)
          commit('SET_LOADED', { key: 'getOnline', value: true })
        }
        commit('SET_LOADING', { key: 'getOnline', value: false })
      }
    },
  },

  getters: {
    total (state) {
      let total = 0
      for (const user in state.data) {
        total += state.data[user] ? 1 : 0
      }
      return total
    },
  },
}
