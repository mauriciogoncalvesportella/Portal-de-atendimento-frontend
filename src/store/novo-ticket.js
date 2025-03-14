import PouchDB from 'pouchdb'
import API from '@/api/'

export default {
  namespaced: true,
  state: () => ({
    uploadStatus: 0,
    db: new PouchDB('novo-ticket', { auto_compaction: true, revs_limit: 1 }),
    docId: null,
    initialized: false,
  }),

  mutations: {
    SET (state, { key, value }) {
      state[key] = value
    },
  },

  actions: {
    async initialize ({ state, commit, rootGetters }) {
      const { initialized } = state
      if (!initialized) {
        const userCd = rootGetters.user.cd
        commit('SET', { key: 'docId', value: `${userCd}` })
        commit('SET', { key: 'initialized', value: true })
        const { db, docId } = state
        try {
          await db.get(docId)
        } catch (err) {
          if (err.name === 'not_found') {
            await db.put({
              _id: `${docId}`,
              states: [],
            })
          }
        }
      }
    },

    async fetch ({ state }, cdatendimento) {
      const { db, docId, initialized } = state
      if (initialized) {
        let states = await db.get(docId)
        states = states.states
        return states.find(state => state.cdatendimento === cdatendimento)
      }
    },

    async add ({ state }, newState) {
      const { db, docId, initialized } = state
      if (initialized) {
        const doc = await db.get(docId)
        doc.states.push(newState)
        await db.put(doc)
      }
    },

    async update ({ state }, updatedState) {
      const { db, docId, initialized } = state
      if (initialized && updatedState.cdatendimento != null) {
        const doc = await db.get(docId)
        const stateIndex = doc.states.findIndex(it => it.cdatendimento === updatedState.cdatendimento)
        if (stateIndex >= 0) {
          doc.states[stateIndex] = updatedState
          await db.put(doc)
        }
      }
    },

    async clear ({ state, dispatch, commit }) {
      const { db } = state
      await db.destroy()
      commit('SET', { key: 'initialized', value: false })
      commit('SET', { key: 'db', value: new PouchDB('novo-ticket', { auto_compaction: true, revs_limit: 1 }) })
      await dispatch('initialize')
    },

    async uploadAcaoFiles ({ state, commit }, data) {
      commit('SET', { key: 'uploadStatus', value: 0 })
      await API.Ticket.uploadAcaoFiles(data.files, data.ticketcd, data.acaocd, (event) => {
        const progress = Math.round((event.loaded * 100) / event.total)
        commit('SET', { key: 'uploadStatus', value: progress })
      })
    },
  },
}
