import PouchDB from 'pouchdb'
import API from '@/api/index'
import Vue from 'vue'
import { differenceInMilliseconds } from 'date-fns'

const initState = () => ({
  docId: null,
  initialized: false,
  cssId: 'FloatMenuTodayEvents',
  floatMenu: parseInt(localStorage.getItem('floatMenuAgenda') ?? 1) === 1,
  UsersInEvents: [],
  UsersAvaible: [],
  UsersAvaibleCheckbox: [],
  ownTodayEvents: [],
  notificationTimeouts: [],
  loading: {
    getOwnTodayEvents: false,
  },
  loaded: {
    getOwnTodayEvents: false,
  },
})

export default {
  namespaced: true,
  state: () => ({
    db: new PouchDB('user-checkbox', { auto_compaction: true, revs_limit: 1 }),
    docId: null,
    initialized: false,
    cssId: 'FloatMenuTodayEvents',
    floatMenu: parseInt(localStorage.getItem('floatMenuAgenda') ?? 1) === 1,
    UsersInEvents: [],
    UsersAvaible: [],
    UsersAvaibleCheckbox: [],
    ownTodayEvents: [],
    notificationTimeouts: [],
    loading: {
      getOwnTodayEvents: false,
    },
    loaded: {
      getOwnTodayEvents: false,
    },
  }),
  mutations: {
    RESET (state) {
      Object.assign(state, initState())
    },

    SET_FLOATMENU (state, payload) {
      state.floatMenu = payload
      localStorage.setItem('floatMenuAgenda', payload ? 1 : 0)
    },

    ADD (state, { key, value }) {
      state[key].push(value)
      state[key] = [...new Set(state[key])]
    },

    REMOVE (state, { key, value }) {
      const index = state[key].findIndex(it => it === value)
      if (index >= 0) {
        state[key].splice(index, 1)
      }
    },

    SET_OWNTODAYEVENTS (state, payload) {
      state.ownTodayEvents = payload
    },

    SET (state, { key, value }) {
      state[key] = value
    },

    SET_LOADING (state, { key, value }) {
      state.loading[key] = value
    },

    SET_LOADED (state, { key, value }) {
      state.loaded[key] = value
    },

    ADD_NOTIFICATION_TIMEOUT (state, timeoutCallback) {
      state.notificationTimeouts.push(timeoutCallback)
    },

    REMOVE_NOTIFICATION_TIMEOUTS (state) {
      for (const timeout of state.notificationTimeouts) {
        clearTimeout(timeout)
      }
      state.notificationTimeouts = []
    },
  },

  actions: {
    toggleFloatMenu ({ commit, state }) {
      commit('SET_FLOATMENU', !state.floatMenu)
    },

    async getOwnTodayEvents ({ state, commit, dispatch, rootGetters }, force = false) {
      const moment = Vue.prototype.$moment
      const dt = moment().format('YYYY-MM-DD')
      const userTarget = rootGetters.user.cd
      if (force || !state.loaded.getOwnTodayEvents) {
        try {
          commit('SET_LOADING', { key: 'getOwnTodayEvents', value: true })
          var data = await API.Agenda.allEvento(dt, dt, userTarget)
        } finally {
          commit('SET_OWNTODAYEVENTS', data)
          dispatch('generateNotificationTimeouts', data)
          commit('SET_LOADED', { key: 'getOwnTodayEvents', value: true })
        }
        commit('SET_LOADING', { key: 'getOwnTodayEvents', value: false })
      }
    },

    generateNotificationTimeouts ({ commit }, events) {
      if (events.length) {
        commit('REMOVE_NOTIFICATION_TIMEOUTS')
      }

      for (const event of events) {
        const delayMs = differenceInMilliseconds(new Date(event.dtinicio), new Date());
        [0, 3e5, 6e5, 9e5, 18e5].forEach(time => {
          if (delayMs - time > 0) {
            const dataMS = (new Date().getTime()) + delayMs - time
            console.log(new Date(dataMS), delayMs - time)
            const timeout = setTimeout(() => {
              Vue.prototype.$notification.show(
                'Notificação Agenda',
                { body: `"${event.nmtitulo}" em ${Math.trunc(time / 6e4)} minutos` },
                {},
              )
            },
            delayMs - time)
            commit('ADD_NOTIFICATION_TIMEOUT', timeout)
          }
        })
      }
    },

    async initialize ({ state, commit, rootGetters }) {
      const userCd = rootGetters.user.cd
      commit('SET', { key: 'docId', value: `${userCd}` })
      const { docId, db } = state
      try {
        const { UsersInEvents, UsersAvaible, UsersAvaibleCheckbox } = await db.get(docId)
        commit('SET', { key: 'UsersInEvents', value: UsersInEvents })
        commit('SET', { key: 'UsersAvaible', value: UsersAvaible })
        commit('SET', { key: 'UsersAvaibleCheckbox', value: UsersAvaibleCheckbox })
      } catch (err) {
        if (err.name === 'not_found') {
          await db.put({
            _id: `${docId}`,
            UsersInEvents: [userCd],
            UsersAvaible: [userCd],
            UsersAvaibleCheckbox: [userCd],
          })
        } else {
          throw err
        }
      } finally {
        commit('SET', { key: 'initialized', value: true })
      }
    },

    async updateDb ({ state }) {
      const { db, docId, UsersInEvents, UsersAvaible, UsersAvaibleCheckbox } = state
      const doc = await db.get(docId)
      doc.UsersAvaible = UsersAvaible
      doc.UsersInEvents = UsersInEvents
      doc.UsersAvaibleCheckbox = UsersAvaibleCheckbox
      await db.put(doc)
    },

    async remove ({ commit, dispatch }, { key, value }) {
      commit('REMOVE', { key, value })
      await dispatch('updateDb')
    },

    async add ({ commit, dispatch }, { key, value }) {
      commit('ADD', { key, value })
      await dispatch('updateDb')
    },

    async set ({ commit, dispatch }, { key, value }) {
      commit('SET', { key, value })
      await dispatch('updateDb')
    },
  },
  getters: {
    ownTodayEventsTotal (state) {
      return state.ownTodayEvents.length
    },
  },
}
