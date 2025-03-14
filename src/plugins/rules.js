export default {
  install (Vue, options) {
    Vue.mixin({
      data () {
        return {
          checkAllProperties: obj => {
            if (Object.keys(obj).length === 0) {
              return false
            }

            for (const key in obj) {
              if (obj[key]) {
                return true
              }
            }

            return false
          },
          RREQUIRED: v => !!v || 'Obrigatório',
          REMAIL: v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail inválido',
          RNOSPECIAL: v => /(^[\w.]+$)|(^$)/.test(v) || 'Caractere(s) inválido(s)',
          RONLYLETTERUPPER: v => /^[A-Z]*$/.test(v) || 'Caractere(s) inválido(S)',
          RONLYNUMBERS: v => /^[0-9]*$/.test(v) || 'Caractere(s) inválido(S)',
          RNOSPACE: v => (v || '').indexOf(' ') < 0 || 'Espaços não são permitidos',
          RNAME: v => /^[a-zA-ZãáéíóúÃÁÉÍÓÚ ]+[a-zA-ZãáéíóúÃÁÉÍÓÚ]{2,}$/.test(v) || 'Nome inválido',
          RNODOUBLESPACE: v => /^(?!.* {2,}).+$/.test(v) || 'Muitos espaços',
          RNOTEMPTY: v => v?.length > 0 || 'Obrigatório',
          RNOTFALSEPROPERTY: v => this.checkAllProperties(v) || 'Obrigatório',
        }
      },

      methods: {
        RMIN (n) {
          return v => v.length >= n || `Mínimo ${n} caracteres`
        },

        RMAX (n) {
          return v => v.length <= n || `Máximo ${n} caracteres`
        },
      },
    })
  },
}
