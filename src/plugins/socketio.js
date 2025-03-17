import io from "socket.io-client";
import store from "@/store/index.js";
import jwt_decode from "jwt-decode";
import axios from "axios";

export default {
  install(Vue) {
    // Configurações
    const MAX_ATTEMPTS = 5;
    let globalAttempts = 0;
    let usingFallbackMode = false;
    let reconnectionTimer = null;
    let httpPollingInterval = null;

    // URLs do sistema
    const BACKEND_URL = "http://localhost:3000";

    // Mapeamento das rotas WebSocket para HTTP equivalentes
    const API_ROUTES = {
      filaEspera: {
        ws: "FilaEspera",
        http: "/api/fila-espera/get/online",
        httpAlt: "/api/fila-espera/all", // Rota alternativa
        commit: "FilaEspera/SET_FILA",
      },
      atendimentos: {
        ws: "AtendimentosOnline",
        http: "/api/atendimento/online",
        httpAlt: "/api/atendimento/all-online", // Rota alternativa
        commit: "AtendimentosOnline/SET_ATENDIMENTOS",
      },
      fones: {
        ws: "Fone",
        http: "/api/3cx/fone-list",
        httpAlt: "/api/fone/list", // Rota alternativa
        commit: "Fone/SET_FONES",
      },
    };

    Vue.prototype.$socketio = {
      socket: null,
      alreadyJoined: false,
      visuallyConnected: false,
      lastSocketInstance: null,
      wsAvailable: true, // Flag para indicar se WebSocket está disponível

      getToken() {
        return (
          localStorage.getItem("token") || localStorage.getItem("access_token")
        );
      },

      onConnect() {
        console.log("[Socket] Conexão estabelecida com sucesso!");
        this.connected = true;
        this.visuallyConnected = true;
        this.wsAvailable = true;
        globalAttempts = 0;

        // Manter UI mostrando conectado
        store.commit("SocketStatus/SET_CONNECTED", true);

        // Limpar timers e fallbacks
        this.clearAllTimers();

        // Registrar usuário no socket
        if (this.socket) {
          try {
            const token = this.getToken();
            if (token) {
              const decoded = jwt_decode(token);
              this.socket.emit("register_user", {
                userId: decoded.idlogin,
                id: decoded.cd,
                token: token,
              });
              console.log("[Socket] Registro de usuário enviado");
            }
          } catch (e) {
            console.error("[Socket] Erro ao registrar usuário:", e);
          }
        }

        if (!this.alreadyJoined) {
          this.alreadyJoined = true;
          setTimeout(() => {
            if (this.socket && this.socket.connected) {
              this.joinRooms();
            } else {
              this.setupHttpPolling();
            }
          }, 2000);
        }
      },

      clearAllTimers() {
        if (reconnectionTimer) {
          clearTimeout(reconnectionTimer);
          reconnectionTimer = null;
        }
        if (httpPollingInterval) {
          clearInterval(httpPollingInterval);
          httpPollingInterval = null;
        }
        usingFallbackMode = false;
      },

      // Implementação real de HTTP polling para ambientes de produção
      setupHttpPolling() {
        if (httpPollingInterval) {
          clearInterval(httpPollingInterval);
        }

        console.log("[Socket] Iniciando polling HTTP para dados críticos");
        usingFallbackMode = true;

        // Manter UI indicando conexão
        store.commit("SocketStatus/SET_CONNECTED", true);

        httpPollingInterval = setInterval(() => {
          const token = this.getToken();
          if (!token) return;

          const config = {
            headers: { Authorization: `Bearer ${token}` },
          };

          // Buscar dados usando as rotas mapeadas
          this.fetchDataWithFallback(API_ROUTES.filaEspera, config);
          this.fetchDataWithFallback(API_ROUTES.atendimentos, config);
          this.fetchDataWithFallback(API_ROUTES.fones, config);

          // Também tentar reconectar WebSocket periodicamente
          if (!this.socket || !this.socket.connected) {
            if (!reconnectionTimer && this.wsAvailable) {
              console.log(
                "[Socket] Tentando reconectar WebSocket em segundo plano"
              );
              this.connect().catch(() => {
                console.warn("[Socket] Falha na reconexão WebSocket");
              });
            }
          }
        }, 15000); // A cada 15 segundos
      },

      // Função auxiliar para buscar dados com fallback
      fetchDataWithFallback(routeConfig, config) {
        // Tentar rota principal
        axios
          .get(`${BACKEND_URL}${routeConfig.http}`, config)
          .then((response) => {
            console.log(
              `[HTTP] Dados obtidos com sucesso: ${routeConfig.http}`
            );
            if (
              routeConfig.commit &&
              store.state[routeConfig.commit.split("/")[0]]
            ) {
              store.commit(routeConfig.commit, response.data);
            }
          })
          .catch((e) => {
            // Se falhar, tentar rota alternativa
            if (routeConfig.httpAlt) {
              axios
                .get(`${BACKEND_URL}${routeConfig.httpAlt}`, config)
                .then((response) => {
                  console.log(
                    `[HTTP] Dados obtidos via rota alternativa: ${routeConfig.httpAlt}`
                  );
                  if (
                    routeConfig.commit &&
                    store.state[routeConfig.commit.split("/")[0]]
                  ) {
                    store.commit(routeConfig.commit, response.data);
                  }
                })
                .catch((err) => {
                  console.error(
                    `[HTTP] Todos os endpoints falharam para ${routeConfig.ws}`,
                    err
                  );
                  // Se todas as tentativas falharem, marcar WebSocket como indisponível
                  this.wsAvailable = false;
                });
            }
          });
      },

      joinRooms() {
        if (!this.socket || !this.socket.connected) {
          console.warn(
            "[Socket] Não foi possível entrar nas salas: socket não conectado"
          );
          return;
        }

        // Usar eventos socket.io diretamente
        Object.values(API_ROUTES).forEach((route) => {
          this.socket.emit("JoinRoom", route.ws);
          console.log(`[Socket] Entrou na sala: ${route.ws}`);
        });
      },

      onError(err) {
        console.error("[Socket] Erro de conexão:", err);

        if (!this.visuallyConnected) {
          store.commit("SocketStatus/SET_CONNECTED", false);
        }

        this.setupHttpPolling();
      },

      onDisconnect(reason) {
        console.log(`[Socket] Desconectado. Razão: ${reason}`);

        globalAttempts++;

        // Se desconectou por razões específicas que indicam problemas no servidor
        if (
          [
            "io server disconnect",
            "transport close",
            "transport error",
          ].includes(reason)
        ) {
          if (globalAttempts <= MAX_ATTEMPTS) {
            // Referência para tentativas futuras
            this.lastSocketInstance = this.socket;

            // Após MAX_ATTEMPTS, focar no HTTP polling
            if (globalAttempts >= MAX_ATTEMPTS) {
              console.log(
                "[Socket] Máximo de tentativas atingido, usando apenas HTTP polling"
              );
              this.wsAvailable = false; // Marcar WebSocket como indisponível
              this.setupHttpPolling();
              return;
            }

            // Backoff exponencial
            const backoffTime = Math.min(
              2000 * Math.pow(1.5, globalAttempts - 1),
              30000
            );
            console.log(
              `[Socket] Tentativa ${globalAttempts}/${MAX_ATTEMPTS} - Próxima em ${backoffTime}ms`
            );

            reconnectionTimer = setTimeout(() => {
              reconnectionTimer = null;
              if (this.socket) {
                this.socket.connect();
              } else {
                this.connect().catch(() => {
                  this.setupHttpPolling();
                });
              }
            }, backoffTime);
          } else {
            this.setupHttpPolling();
          }
        } else {
          // Para outros tipos de desconexão, tentar reconectar rapidamente
          setTimeout(() => {
            if (this.socket) {
              this.socket.connect();
            }
          }, 2000);
        }
      },

      clientDisconnect() {
        this.clearAllTimers();
        if (this.socket) {
          this.socket.disconnect();
        }
      },

      setupSocketEvents() {
        if (!this.socket) return;

        this.socket.on("error", this.onError.bind(this));
        this.socket.on("connect_error", this.onError.bind(this));
        this.socket.on("connect", this.onConnect.bind(this));
        this.socket.on("disconnect", this.onDisconnect.bind(this));

        // Adicionar listeners para atualizações do servidor
        Object.values(API_ROUTES).forEach((route) => {
          const eventName = `${route.ws}/update`;
          this.socket.on(eventName, (data) => {
            console.log(`[Socket] Recebeu atualização de ${route.ws}`);
            if (route.commit && store.state[route.commit.split("/")[0]]) {
              store.commit(route.commit, data);
            }
          });
        });

        // Ping-pong para verificar conexão
        this.socket.on("pong", () => {
          console.log("[Socket] Pong recebido - conexão ativa");
        });
      },

      // Envia ping para verificar se o socket está realmente conectado
      pingSocket() {
        if (this.socket && this.socket.connected) {
          this.socket.emit("ping");
        }
      },

      async connect() {
        if (!this.socket) {
          console.log("[Socket] Iniciando Conexão");

          const token = this.getToken();
          if (!token) {
            console.error("[Socket] Nenhum token disponível");
            return Promise.reject(new Error("Sem token"));
          }

          try {
            const decoded = jwt_decode(token);
            console.log("[Auth] Token decodificado:", decoded);
          } catch (e) {
            console.error("[Auth] Erro ao decodificar token:", e);
          }

          // Configuração completa com todas as opções
          this.socket = io(BACKEND_URL, {
            path: "/api/socketio",
            transports: ["websocket", "polling"],
            reconnection: false, // Controlamos manualmente a reconexão
            timeout: 10000,
            query: {
              token: token,
              userId: jwt_decode(token).idlogin,
            },
            auth: {
              token: token,
            },
            extraHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });

          this.lastSocketInstance = this.socket;
          this.setupSocketEvents();

          return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              if (!this.socket.connected) {
                console.log("[Socket] Timeout - alternando para HTTP polling");
                this.setupHttpPolling();
                reject(new Error("Timeout de conexão"));
              }
            }, 10000);

            this.socket.once("connect", () => {
              clearTimeout(timeoutId);
              resolve();
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
    };

    // Método para inicializar socket após login
    Vue.prototype.$initSocketConnection = function () {
      globalAttempts = 0;
      console.log("[Auth] Inicializando conexão de socket após login");
      Vue.prototype.$socketio.clearAllTimers();
      Vue.prototype.$socketio.wsAvailable = true; // Reset flag ao logar

      const token = Vue.prototype.$socketio.getToken();
      if (!token) {
        console.error("[Socket] Sem token para conexão");
        return;
      }

      Vue.prototype.$socketio.connect().catch((err) => {
        console.error("[Socket] Falha na conexão inicial:", err);
        Vue.prototype.$socketio.setupHttpPolling();
      });
    };

    // Iniciar imediatamente se o token já existir
    Vue.nextTick(() => {
      if (Vue.prototype.$socketio.getToken()) {
        Vue.prototype.$initSocketConnection();
      }
    });
  },
};
