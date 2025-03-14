<template>
  <div>
    Leonardo
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  export default {
    computed: {
      ...mapState('FilaEspera', ['lista']),
    },
    created () {
      this.$store.dispatch('FilaEspera/allOnline')
    },
  }
</script>
