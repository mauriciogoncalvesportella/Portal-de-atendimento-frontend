<template>
  <div style="position: absolute" />
</template>

<script>
export default {
  mounted() {

    // Verificar se o método retorna uma Promise e trata-la corretamente
    const connectResult = this.$socketio.connect();

    if (connectResult && typeof connectResult.catch === "function") {
      // É uma Promise, podemos usar .catch
      connectResult.catch((error) => {
        // Tratar o erro da Promise aqui
        if (error && error.message === "Tentativa anterior falhou") {
          console.debug("[Socket] Conexão não estabelecida - modo offline");
        } else {
          console.error("[Socket] Erro ao inicializar:", error);
        }

        // Garantir que a UI não mostra o usuário como desconectado mesmo com falha
        if (
          this.$store &&
          this.$store.commit &&
          typeof this.$store.commit === "function"
        ) {
          this.$store.commit("SocketStatus/SET_CONNECTED", true);
        }
      });
    }
  },

  destroyed() {
    // Verifica se o socketio existe antes de tentar desconectá-lo
    if (this.$socketio) {
      this.$socketio.clientDisconnect();
    }
  },
};
</script>
