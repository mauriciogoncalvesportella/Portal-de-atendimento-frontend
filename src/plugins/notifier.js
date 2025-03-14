// https://dev.to/stephannv/how-to-create-a-global-snackbar-using-nuxt-vuetify-and-vuex-1bda
import store from '@/store/index.js'

const Notifier = {
  install (Vue) {
    Vue.prototype.$notifier = function ({ content = '', color = 'primary', halign = 'center', valign = 'top' }) {
      store.dispatch('snack', {
        content,
        color,
        halign,
        valign,
      })
    }
  },
}

export default Notifier
