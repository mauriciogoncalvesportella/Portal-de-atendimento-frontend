import API from '@/api/index'
import Vue from 'vue'

const initState = () => ({
  cssId: 'FloatMenuFilaFone',
  floatMenu: parseInt(localStorage.getItem('floatMenuFilaFone') ?? 1) === 1,
  fila: [],
  chaves: [],
  nicknames: [],
  socket: null,
  registeredScoketSubscriber: false,
  loading: {
    bind: null,
    getFoneList: false,
  },
})

export default {
  namespaced: true,
  state: initState(),
  mutations: {
    RESET (state) {
      Object.assign(state, initState())
    },
    ADD_FONE (state, payload) {
      if (!state.fila.find(item => item === payload)) {
        state.fila.splice(0, 0, payload)
        // state.fila.push(payload)
        state.chaves.push({})
        state.nicknames.push('')
      }
    },
    SET_QUEUE (state, queue) {
      state.fila = queue
      state.chaves = queue.map(() => {})
      state.nicknames = queue.map(() => '')
    },
    REMOVE_FONE (state, payload) {
      const index = state.fila.findIndex(item => item === payload)
      if (index >= 0) {
        state.fila.splice(index, 1)
        state.chaves.splice(index, 1)
        state.nicknames.splice(index, 1)
      }
    },
    SET_LOADING (state, { key, value }) {
      state.loading[key] = value
    },
    SET_LOADED (state, { key, value }) {
      state.loaded[key] = value
    },
    SET_FLOATMENU (state, payload) {
      state.floatMenu = payload
      localStorage.setItem('floatMenuFilaFone', payload ? 1 : 0)
    },
  },

  actions: {
    toggleFloatMenu ({ commit, state }) {
      commit('SET_FLOATMENU', !state.floatMenu)
    },

    async joinFoneSocket ({ dispatch }) {
      const socket = Vue.prototype.$socketio.socket
      socket.emit('JoinRoom', 'Fone')
      socket.removeAllListeners('Fone/add')
      socket.removeAllListeners('Fone/remove')
      socket.on('Fone/add', fone => {
        dispatch('add', fone)
      })
      socket.on('Fone/remove', fone => {
        dispatch('remove', fone)
      })
    },

    async leaveFoneSocket () {
      await Vue.prototype.$socketio.socket.emit('LeaveFone')
    },

    async add ({ commit }, fone) {
      commit('ADD_FONE', fone)
      Vue.prototype.$notifier({ content: 'Novo número de telefone para cadastrar', color: 'primary', halign: 'right' })
    },

    async remove ({ commit }, fone) {
      commit('REMOVE_FONE', fone)
    },

    async getFoneList ({ commit }) {
      try {
        commit('SET_LOADING', { key: 'getFoneList', value: true })
        const fones = await API.Xc3.getFoneList()
        commit('SET_QUEUE', fones)
      } finally {
        commit('SET_LOADING', { key: 'getFoneList', value: false })
      }
    },

    async bind ({ commit }, { fone, cdchave, idnome }) {
      try {
        commit('SET_LOADING', { key: 'bind', value: fone })
        await API.Xc3.bind(fone, cdchave, idnome)
      } finally {
        commit('SET_LOADING', { key: 'bind', value: null })
      }
    },
  },
}
