import { formatDuration, intervalToDuration, differenceInMinutes } from 'date-fns'
import { format } from 'telefone'
import locale from 'date-fns/locale/pt-BR'

export default {
  // called by Vue.use(FirstPlugin)
  install (Vue, options) {
    // merge default options with arg options
    // const config = { ...defaultConfig, ...options }
    // create a mixin
    Vue.mixin({
      methods: {
        normalizaData (data) {
          return (new Date(data)).toLocaleDateString('pt-br')
        },

        textToClipboard (text) {
          var dummy = document.createElement('textarea')
          document.body.appendChild(dummy)
          dummy.value = text
          dummy.select()
          document.execCommand('copy')
          document.body.removeChild(dummy)
          this.$notifier({ content: 'Chave copiada', color: 'primary', halign: 'right', valign: 'bottom' })
        },
        subData (data) {
          const diff = new Date(data) - Date.now()
          return Math.ceil(diff / (1000 * 3600 * 24))
        },
      },
    })

    // define a global filter
    Vue.filter('cut', (value, length = 15) => {
      if (!value) {
        return ''
      }
      if (value.length <= length) {
        return value
      }
      return value.substring(0, length) + '...'
    })

    Vue.filter('duration2format', (dt, { dtend, format }) => {
      dt = new Date(dt)
      if (dtend) {
        dtend = new Date(dtend)
      } else {
        dtend = new Date()
      }
      format = format ?? ['days', 'hours', 'minutes']

      if (differenceInMinutes(dtend, dt) <= 1) {
        return 'Menos de 1 minuto'
      }

      const duration = intervalToDuration({ start: dt, end: dtend })
      if (format) {
        return formatDuration(duration, { format, locale })
      }
      return formatDuration(duration, { locale })
    })

    Vue.filter('sec2date', (dt) => {
      if (!dt) {
        return '...'
      }

      let hr = Math.abs(dt) / (1000 * 60 * 60)
      let min = (hr - Math.trunc(hr)) * 60
      const sec = Math.floor((min - Math.trunc(min)) * 60)
      min = Math.floor(min)
      hr = Math.floor(hr)
      return `${(hr < 10) ? '0' : ''}${hr}:${(min < 10) ? '0' : ''}${min}:${(sec < 10) ? '0' : ''}${sec}`
    })

    Vue.filter('origem2icon', (idorigem) => {
      switch (idorigem) {
        case 'E-mail': return 'mdi-email'
        case 'Telefone': return 'mdi-phone'
        case 'Skype': return 'mdi-skype'
        case 'Whatsapp': return 'mdi-whatsapp'
        default: return 'mdi-dots-horizontal'
      }
    })

    Vue.filter('str2date', (str) => {
      if (str == null) {
        return '...'
      }
      const dt = new Date(str)
      const h = dt.getHours()
      const m = dt.getMinutes()
      const s = dt.getSeconds()
      return (h > 9 ? '' : '0') + h + ':' +
        (m > 9 ? '' : '0') + m + ':' +
        (s > 9 ? '' : '0') + s
    })

    Vue.filter('str2calendar', (str) => {
      const dt = new Date(str)
      const y = dt.getFullYear()
      const m = dt.getMonth() + 1
      const d = dt.getDate()

      return (d > 9 ? '' : '0') + d + '/' +
        (m > 9 ? '' : '0') + m + '/' +
        y
    })

    Vue.filter('str2datetime', (str, format) => {
      return Vue.prototype.$moment(str).format(format)
      // return this.str2datetime(str)
    })

    Vue.filter('checkVoid', (val) => {
      if (!val || val === '') {
        return '?'
      }
      return val
    })

    Vue.filter('bytes2human', (val) => {
      const bytes = parseFloat(val)
      let str
      if (bytes < 1e3) {
        str = 'B'
      } else if (bytes < 1e6) {
        val = (val / 1e3).toFixed(1)
        str = 'KB'
      } else {
        val = (val / 1e6).toFixed(1)
        str = 'MB'
      }

      return `${val} ${str}`
    })

    Vue.filter('jsonPretty', (val) => {
      return JSON.stringify(val)
    })

    Vue.filter('telefone', (val) => {
      return format(val) ?? val
    })

    Vue.prototype.$stylizePrevisao = function (data) {
      const moment = Vue.prototype.$moment
      const today = moment().format('YYYY-MM-DD')
      data = moment(data).format('YYYY-MM-DD')
      if (data === today) {
        return 'red--text'
      }
      if (today > data) {
        // return 'text-decoration-line-through red--text'
        return 'red--text'
      }
      return ''
    }
  },
}
