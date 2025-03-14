import Vue from 'vue'
import Vuetify from 'vuetify/lib'
// import i18n from '@/i18n'
import '@mdi/font/css/materialdesignicons.css'
//  import '@/sass/overrides.sass'

Vue.use(Vuetify)
/*
const theme = {
  primary: '#FF9800',
  secondary: '#9C27b0',
  accent: '#9C27b0',
  info: '#00CAE3',
}
*/
export default new Vuetify({
  theme: {
    options: { customProperties: true },
  },
  /*
  lang: {
    t: (key, ...params) => i18n.t(key, params),
    locales: {
      en: {
        noDataText: 'Ainda não há nada aqui',
      },
    },
  },
  */
})
