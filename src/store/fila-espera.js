import API from '@/api/index'
import Vue from 'vue'

const initState = () => ({
  cssId: 'FloatMenuFilaEspera',
  floatMenu: parseInt(localStorage.getItem('floatMenuFilaEspera') ?? 1) === 1,
  fila: [],
  socket: null,
  registeredSocketSubscriber: false,
  loading: {
    add: false,
    getAllOnline: false,
    getAll: false,
    remove: null,
  },
  loaded: {
    getAllOnline: false,
  },
})

export default {
  namespaced: true,
  state: initState(),
  mutations: {
    RESET (state) {
      Object.assign(state, initState())
    },
    SET_FLOATMENU (state, payload) {
      state.floatMenu = payload
      localStorage.setItem('floatMenuFilaEspera', payload ? 1 : 0)
    },
    ADD_TO_QUEUE (state, record) {
      if (!state.fila.find(item => item.cd === record.cd)) {
        for (const [i, item] of state.fila.entries()) {
          if ((record.fgurgente && !item.fgurgente) || (record.cd < item.cd)) {
            state.fila.splice(i, 0, record)
            return
          }
        }
        state.fila.push(record)
      }
    },
    REMOVE_FROM_QUEUE (state, cd) {
      const index = state.fila.findIndex(item => item.cd === cd)
      if (index >= 0) {
        state.fila.splice(index, 1)
      }
    },
    SET_QUEUE (state, data) {
      state.fila = data
    },
    SET_LOADING (state, { key, value }) {
      state.loading[key] = value
    },
    SET_LOADED (state, { key, value }) {
      state.loaded[key] = value
    },
  },
  actions: {
    toggleFloatMenu ({ commit, state }) {
      commit('SET_FLOATMENU', !state.floatMenu)
    },

    async joinFilaEsperaSocket ({ dispatch }) {
      const socket = Vue.prototype.$socketio.socket
      socket.emit('JoinRoom', 'FilaEspera')

      socket.removeAllListeners('FilaEspera/add')
      socket.removeAllListeners('FilaEspera/remove')

      socket.on('FilaEspera/add', entity => {
        dispatch('addToQueue', entity)
      })
      socket.on('FilaEspera/remove', (cd) => {
        dispatch('removeFromQueue', parseInt(cd))
      })
    },

    async leaveFilaEsperaSocket ({ commit, state, dispatch }) {
      await Vue.prototype.$socketio.socket.emit('LeaveFilaEspera')
    },

    async socketDisconnect ({ commit }) {
      commit('SOCKET_DISCONNECT')
    },

    async add ({ commit, dispatch }, data) {
      try {
        commit('SET_LOADING', { key: 'add', value: true })
        const entity = await API.FilaEspera.add(data)
        dispatch('addToQueue', entity)
      } finally {
        commit('SET_LOADING', { key: 'add', value: false })
      }
    },

    async addToQueue ({ commit, rootGetters, getters }, data) {
      if (!getters.cdInFila[data.cd]) {
        commit('ADD_TO_QUEUE', data)
        let idfantasia = ''
        if (rootGetters.chaveMap) {
          idfantasia = `"${rootGetters.chaveMap[data._cdchave].idfantasia}"`
        }
        const forMe = data.cduser === rootGetters.user.cd
        Vue.prototype.$notifier({ content: `Novo atendimento ${idfantasia} adicionado à Fila ${forMe ? 'para você!' : ''}`, color: forMe ? 'warning' : 'primary', halign: 'right' })
      }
    },

    async remove ({ commit, dispatch }, cd) {
      try {
        commit('SET_LOADING', { key: 'remove', value: cd })
        await API.FilaEspera.remove(cd)
        dispatch('removeFromQueue', cd)
      } finally {
        commit('SET_LOADING', { key: 'remove', value: null })
      }
    },

    async removeFromQueue ({ commit, getters }, cd) {
      if (getters.cdInFila[cd]) {
        commit('REMOVE_FROM_QUEUE', cd)
        Vue.prototype.$notifier({ content: `Atendimento #${cd} removido da Fila de Espera`, color: 'primary', halign: 'right' })
      }
    },

    async getAll ({ commit }, filter) {
      let data = null
      try {
        commit('SET_LOADING', { key: 'getAll', value: true })
        data = await API.FilaEspera.getAll(filter)
      } finally {
        commit('SET_LOADING', { key: 'getAll', value: false })
      }
      return data
    },

    async getAllOnline ({ state, commit }, force) {
      if (force || !state.loaded.getAllOnline) {
        try {
          commit('SET_LOADING', { key: 'getAllOnline', value: true })
          var entities = await API.FilaEspera.allOnline()
        } finally {
          commit('SET_QUEUE', entities)
          commit('SET_LOADED', { key: 'getAllOnline', value: true })
        }
        commit('SET_LOADING', { key: 'getAllOnline', value: false })
      }
    },
  },

  getters: {
    cdInFila (state) {
      const ret = {}
      state.fila.forEach(item => { ret[item.cd] = true })
      return ret
    },
  },
}
