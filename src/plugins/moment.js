import Moment from 'moment-timezone'
import { extendMoment } from 'moment-range'

export default {
  install (Vue) {
    Moment.locale('pt-br')
    // Moment.tz.setDefault('America/Sao_Paulo')
    const moment = extendMoment(Moment)
    // moment.locale('pt-br')
    // moment.tz('America/Sao_Paulo')
    // moment.tz('America/Sao_Paulo')
    Vue.prototype.$moment = moment
  },
}
