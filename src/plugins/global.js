export default {
  install (Vue, options) {
    Vue.mixin({
      methods: {
        // https://stackoverflow.com/questions/40445125/how-can-component-delete-itself-in-vue-2-0
        deleteComponentInstance () {
          // destroy the vue listeners, etc
          this.$destroy()

          // remove the element from the DOM
          this.$el.parentNode.removeChild(this.$el)
        },
      },
    })
  },
}
