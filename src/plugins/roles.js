export default {
  install (Vue, options) {
    Vue.prototype.$checkRole = function (role) {
      const roles = this.$store.getters.user.roles
      if (roles) {
        if (roles.find(it => it === role)) {
          return true
        }
      }
      return false
    }
  },
}
