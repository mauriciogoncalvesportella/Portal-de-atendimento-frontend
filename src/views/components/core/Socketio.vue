<template>
  <div style="position: absolute" />
</template>

<script>
export default {
  mounted() {
    this.$socketio.connect();
  },

  destroyed() {
    // Verifica se o socketio existe antes de tentar desconectá-lo
    if (this.$socketio) {
      this.$socketio.clientDisconnect();
    }
  },
};
</script>
