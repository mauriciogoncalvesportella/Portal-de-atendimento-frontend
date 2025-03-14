import { io } from "socket.io-client";

export default {
  install(app, options = {}) {
    // Função para recuperar token
    const getToken = () => {
      // Recupera o token do localStorage ou de um store de autenticação
      return localStorage.getItem("token");
    };

    // Configuração do socket
    const socket = io(
      process.env.VUE_APP_BACKEND_URL || "http://localhost:3000",
      {
        path: "/api/socketio",
        transports: ["websocket", "polling"],

        // Configurações de autenticação
        auth: (cb) => {
          const token = getToken();
          console.log("[Socket] Enviando token de autenticação", token);

          cb({
            token: token,
            // Opcional: passar informações adicionais
            idlogin: localStorage.getItem("username"),
          });
        },

        // Cabeçalhos extras
        extraHeaders: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    // Listeners de conexão com logs detalhados
    socket.on("connect", () => {
      console.log("[Socket] Conexão estabelecida com sucesso");
    });

    socket.on("connect_error", (error) => {
      console.error("[Socket] Erro de conexão:", error);
      console.error(
        "Detalhes completos do erro:",
        JSON.stringify(error, null, 2)
      );
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket] Desconectado. Motivo: ${reason}`);
    });

    // Métodos úteis de gerenciamento
    socket.reconnect = () => {
      socket.disconnect();
      socket.connect();
    };

    // Adiciona socket como propriedade global
    app.config.globalProperties.$socket = socket;

    // Fornece como provide/inject
    app.provide("socket", socket);
  },
};
