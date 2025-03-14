<template>
  <router-view />
</template>

<script>
export default {
  name: "App",

  mounted() {
    // Monitor de status do socket
    let lastStatus = false;
    setInterval(() => {
      const currentStatus = this.$socketio?.socket?.connected || false;
      if (currentStatus !== lastStatus) {
        console.log(
          `[SocketMonitor] Status da conexão mudou para: ${
            currentStatus ? "conectado" : "desconectado"
          }`
        );
        lastStatus = currentStatus;
      }
    }, 2000);
  },
};
</script>
