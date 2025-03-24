<template>
  <v-app>
    <router-view />
    <GlobalErrorHandler />
  </v-app>
</template>

<script>
import GlobalErrorHandler from "@/components/base/GlobalErrorHandler.vue";

export default {
  name: "App",
  components: {
    GlobalErrorHandler,
  },
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
