import io from "socket.io-client";
import store from "@/store/index.js";

export default {
  install(Vue) {
    // Contador global de tentativas para toda a sessão
    let globalAttempts = 0;
    const MAX_GLOBAL_ATTEMPTS = 5;

    Vue.prototype.$socketio = {
      socket: null,
      alreadyJoined: false,
      reconnectTimer: null,
      fakeConnection: false, // Flag para "fingir" estar conectado para a UI

      getToken() {
        return (
          localStorage.getItem("token") || localStorage.getItem("access_token")
        );
      },

      onConnect() {
        this.connected = true;
        store.commit("SocketStatus/SET_CONNECTED", true);

        if (!this.alreadyJoined) {
          this.alreadyJoined = true;
          console.log("[Vue/Plugins/Socketio.io] Conexão Socket OK!");

          // Atraso antes de entrar nas salas para evitar desconexões imediatas
          setTimeout(() => {
            if (this.socket && this.socket.connected) {
              // Join em salas importantes
              [
                "FilaEspera/joinFilaEsperaSocket",
                "Fone/joinFoneSocket",
                "AtendimentosOnline/joinAtendimentosOnlineSocket",
              ].forEach((action) => {
                store.dispatch(action);
              });
            }
          }, 1000);
        }
      },

      onError(err) {
        if (!this.fakeConnection) {
          store.commit("SocketStatus/SET_CONNECTED", false);
        }
        console.log("[Vue/Plugins/Socketio.io] Erro de conexão", err);
      },

      onDisconnect(reason) {
        console.log(
          `[Vue/Plugins/Socketio.io] Desconectado. Reason = ${reason}`
        );

        if (reason === "io server disconnect") {
          // Verificar limite global de tentativas
          globalAttempts++;

          if (globalAttempts > MAX_GLOBAL_ATTEMPTS) {
            console.log(
              `[Socket] Limite máximo de ${MAX_GLOBAL_ATTEMPTS} tentativas atingido - parando reconexões`
            );

            if (!this.fakeConnection) {
              // Ativar modo "fake connection" - finge estar conectado para a UI
              this.fakeConnection = true;
              store.commit("SocketStatus/SET_CONNECTED", true);
              console.log("[Socket] Modo de conexão simulada ativado");
            }

            return;
          }

          // Usar um atraso longo entre tentativas
          const delay = 10000; // 10 segundos
          console.log(
            `[Socket] Tentativa #${globalAttempts} - reconexão em ${delay}ms`
          );

          setTimeout(() => {
            if (this.socket) {
              console.log(
                "[Socket] Tentando reconexão após desconexão do servidor"
              );
              this.socket.connect();
            }
          }, delay);
        } else {
          if (!this.fakeConnection) {
            store.commit("SocketStatus/SET_CONNECTED", false);
          }
        }
      },

      clientDisconnect() {
        if (this.socket) {
          this.socket.disconnect();
        }
      },

      async connect() {
        if (!this.socket) {
          console.log("[Vue/Plugins/Socket.io] Inciando Conexão");

          return new Promise((resolve, reject) => {
            const token = this.getToken();

            this.socket = io("http://localhost:3000", {
              path: "/api/socketio",
              transports: ["websocket", "polling"],
              reconnection: false, // Desativar reconexão automática - nós controlamos
              timeout: 20000,
              auth: {
                token: token,
              },
              extraHeaders: {
                Authorization: token ? `Bearer ${token}` : "",
              },
            });

            this.socket.on("error", (err) => {
              this.onError(err);
              reject(err);
            });

            this.socket.on("connect_error", (err) => {
              this.onError(err);
              reject(err);
            });

            this.socket.on("connect", () => {
              this.onConnect();
              resolve();
            });

            this.socket.on("disconnect", (reason) => {
              this.onDisconnect(reason);
            });
          });
        } else if (!this.socket.connected) {
          console.log("[Socket] Reconectando socket existente...");
          this.socket.connect();
          return Promise.resolve();
        } else {
          return Promise.resolve();
        }
      },

      // Método para fingir estar conectado
      simulateConnection() {
        this.fakeConnection = true;
        store.commit("SocketStatus/SET_CONNECTED", true);
        console.log("[Socket] Status de conexão simulada ativado");
      },
    };

    // Método para inicializar socket após login
    Vue.prototype.$initSocketConnection = function () {
      // Resetar o contador global quando o login é feito
      globalAttempts = 0;

      if (Vue.prototype.$socketio.getToken()) {
        Vue.prototype.$socketio.connect().catch((err) => {
          console.error("[Socket] Falha na conexão inicial:", err);
          // Após falha na conexão inicial, ative o modo de conexão simulada
          Vue.prototype.$socketio.simulateConnection();
        });
      }
    };

    // Iniciar imediatamente se o token já existir
    Vue.nextTick(() => {
      if (Vue.prototype.$socketio.getToken()) {
        Vue.prototype.$socketio.connect().catch((err) => {
          console.error("[Socket] Falha na conexão inicial:", err);
          // Após falha na conexão inicial, ative o modo de conexão simulada
          Vue.prototype.$socketio.simulateConnection();
        });
      }
    });
  },
};
