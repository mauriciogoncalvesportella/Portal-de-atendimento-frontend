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

    // ADICIONADO: Controle para ambiente de desenvolvimento
    const DEVELOPMENT_MODE = true; // Ative para ambiente de desenvolvimento
    const SHOW_SOCKET_LOGS = false; // Controle de logs

    // ADICIONADO: Variável para controlar tentativas de reconexão em desenvolvimento
    let lastReconnectTime = 0;
    const RECONNECT_THROTTLE = 60000; // Limita a uma tentativa a cada 60 segundos em modo dev

    // Função para substituir console.log
    const socketLog = (message) => {
      if (SHOW_SOCKET_LOGS) {
        console.log(message);
      }
    };

    // Função para substituir console.error
    const socketError = (message, error) => {
      if (SHOW_SOCKET_LOGS) {
        console.error(message, error);
      }
    };

    // Função para substituir console.warn
    const socketWarn = (message) => {
      if (SHOW_SOCKET_LOGS) {
        console.warn(message);
      }
    };

    // URLs do sistema
    const BACKEND_URL = "http://localhost:3000";

    // Mapeamento das rotas WebSocket para HTTP equivalentes
    const API_ROUTES = {
      filaEspera: {
        ws: "FilaEspera",
        http: "/api/fila-espera/get/online",
        httpAlt: "/api/fila-espera/all",
        commit: "FilaEspera/SET_FILA",
      },
      atendimentos: {
        ws: "AtendimentosOnline",
        http: "/api/atendimento/online",
        httpAlt: "/api/atendimento/all-online",
        commit: "AtendimentosOnline/SET_ATENDIMENTOS",
      },
      fones: {
        ws: "Fone",
        http: "/api/3cx/fone-list",
        httpAlt: "/api/fone/list",
        commit: "Fone/SET_FONES",
      },
    };

    Vue.prototype.$socketio = {
      socket: null,
      alreadyJoined: false,
      visuallyConnected: false,
      lastSocketInstance: null,
      wsAvailable: true,

      // ADICIONADO: Flag para controlar se já tentamos e falhamos
      connectionFailed: false,

      getToken() {
        return (
          localStorage.getItem("token") || localStorage.getItem("access_token")
        );
      },

      hasValidToken() {
        const token = this.getToken();
        if (!token) return false;

        try {
          const decoded = jwt_decode(token);
          // Verifica se tem idlogin válido
          return decoded && decoded.idlogin;
        } catch (e) {
          return false;
        }
      },

      onConnect() {
        socketLog("[Socket] Conexão estabelecida com sucesso!");
        this.connected = true;
        this.visuallyConnected = true;
        this.wsAvailable = true;
        this.connectionFailed = false; // Resetar flag após sucesso
        globalAttempts = 0;

        store.commit("SocketStatus/SET_CONNECTED", true);
        this.clearAllTimers();

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
              socketLog("[Socket] Registro de usuário enviado");
            }
          } catch (e) {
            socketError("[Socket] Erro ao registrar usuário:", e);
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

      setupHttpPolling() {
        if (httpPollingInterval) {
          clearInterval(httpPollingInterval);
        }

        socketLog("[Socket] Iniciando polling HTTP para dados críticos");
        usingFallbackMode = true;

        store.commit("SocketStatus/SET_CONNECTED", true);

        // No modo de desenvolvimento, não fazemos polling frequente
        const pollingInterval = DEVELOPMENT_MODE ? 60000 : 15000; // 60s em dev, 15s em prod

        httpPollingInterval = setInterval(() => {
          const token = this.getToken();
          if (!token) return;

          const config = {
            headers: { Authorization: `Bearer ${token}` },
          };

          this.fetchDataWithFallback(API_ROUTES.filaEspera, config);
          this.fetchDataWithFallback(API_ROUTES.atendimentos, config);
          this.fetchDataWithFallback(API_ROUTES.fones, config);

          // Em modo de desenvolvimento, tentamos reconectar com muito menos frequência
          if (!this.socket || !this.socket.connected) {
            const now = Date.now();
            if (
              !DEVELOPMENT_MODE ||
              (now - lastReconnectTime > RECONNECT_THROTTLE &&
                this.wsAvailable &&
                this.hasValidToken())
            ) {
              lastReconnectTime = now;
              if (!reconnectionTimer && this.wsAvailable) {
                socketLog(
                  "[Socket] Tentando reconectar WebSocket em segundo plano"
                );

                this.connect().catch(() => {
                  socketWarn("[Socket] Falha na reconexão WebSocket");
                  // Em modo de desenvolvimento, desistimos após a primeira falha
                  if (DEVELOPMENT_MODE) {
                    this.wsAvailable = false;
                    this.connectionFailed = true;
                  }
                });
              }
            }
          }
        }, pollingInterval);
      },

      fetchDataWithFallback(routeConfig, config) {
        // Se estamos em modo de desenvolvimento e já falhamos, não ficamos tentando
        if (DEVELOPMENT_MODE && this.connectionFailed) return;

        axios
          .get(`${BACKEND_URL}${routeConfig.http}`, config)
          .then((response) => {
            socketLog(`[HTTP] Dados obtidos com sucesso: ${routeConfig.http}`);
            if (
              routeConfig.commit &&
              store.state[routeConfig.commit.split("/")[0]]
            ) {
              store.commit(routeConfig.commit, response.data);
            }
          })
          .catch((e) => {
            if (routeConfig.httpAlt) {
              axios
                .get(`${BACKEND_URL}${routeConfig.httpAlt}`, config)
                .then((response) => {
                  socketLog(
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
                  socketError(
                    `[HTTP] Todos os endpoints falharam para ${routeConfig.ws}`,
                    err
                  );
                  this.wsAvailable = false;

                  // Em modo dev, marcamos falha para reduzir tentativas futuras
                  if (DEVELOPMENT_MODE) {
                    this.connectionFailed = true;
                  }
                });
            }
          });
      },

      joinRooms() {
        if (!this.socket || !this.socket.connected) {
          socketWarn(
            "[Socket] Não foi possível entrar nas salas: socket não conectado"
          );
          return;
        }

        Object.values(API_ROUTES).forEach((route) => {
          this.socket.emit("JoinRoom", route.ws);
          socketLog(`[Socket] Entrou na sala: ${route.ws}`);
        });
      },

      onError(err) {
        socketError("[Socket] Erro de conexão:", err);

        if (!this.visuallyConnected) {
          store.commit("SocketStatus/SET_CONNECTED", false);
        }

        // Em modo de desenvolvimento, marcamos como falhou para evitar tentativas futuras
        if (DEVELOPMENT_MODE) {
          this.connectionFailed = true;
          this.wsAvailable = false;
        }

        this.setupHttpPolling();
      },

      onDisconnect(reason) {
        socketLog(`[Socket] Desconectado. Razão: ${reason}`);

        globalAttempts++;

        // Se estamos em modo de desenvolvimento, limitamos muito as reconexões
        if (DEVELOPMENT_MODE) {
          // Se for desconexão do servidor ou erro, desistimos na primeira tentativa
          if (
            [
              "io server disconnect",
              "transport close",
              "transport error",
            ].includes(reason)
          ) {
            socketLog(
              "[Socket] Modo desenvolvimento: Parando tentativas de reconexão"
            );
            this.wsAvailable = false;
            this.connectionFailed = true;
            this.setupHttpPolling();
            return;
          }

          // Para outros tipos de desconexão, tentamos no máximo uma vez por minuto
          const now = Date.now();
          if (now - lastReconnectTime <= RECONNECT_THROTTLE) {
            return; // Ignorar se tentamos recentemente
          }

          lastReconnectTime = now;
          setTimeout(() => {
            if (this.socket && !this.connectionFailed) {
              this.socket.connect();
            }
          }, 5000); // Uma tentativa após 5 segundos

          return;
        }

        // Código normal de produção abaixo
        if (
          [
            "io server disconnect",
            "transport close",
            "transport error",
          ].includes(reason)
        ) {
          if (globalAttempts <= MAX_ATTEMPTS) {
            this.lastSocketInstance = this.socket;

            if (globalAttempts >= MAX_ATTEMPTS) {
              socketLog(
                "[Socket] Máximo de tentativas atingido, usando apenas HTTP polling"
              );
              this.wsAvailable = false;
              this.setupHttpPolling();
              return;
            }

            const backoffTime = Math.min(
              2000 * Math.pow(1.5, globalAttempts - 1),
              30000
            );
            socketLog(
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

        Object.values(API_ROUTES).forEach((route) => {
          const eventName = `${route.ws}/update`;
          this.socket.on(eventName, (data) => {
            socketLog(`[Socket] Recebeu atualização de ${route.ws}`);
            if (route.commit && store.state[route.commit.split("/")[0]]) {
              store.commit(route.commit, data);
            }
          });
        });

        this.socket.on("pong", () => {
          socketLog("[Socket] Pong recebido - conexão ativa");
        });
      },

      pingSocket() {
        if (this.socket && this.socket.connected) {
          this.socket.emit("ping");
        }
      },

      async connect() {
        // Em modo de desenvolvimento, se já tentamos e falhamos, não tentamos novamente
        if (DEVELOPMENT_MODE && this.connectionFailed) {
          return Promise.reject(new Error("Tentativa anterior falhou"));
        }

        // Verifica se temos um token válido com idlogin
        if (!this.hasValidToken()) {
          socketError("[Socket] Token inválido ou sem ID de login");
          return Promise.reject(new Error("Token inválido"));
        }

        if (!this.socket) {
          socketLog("[Socket] Iniciando Conexão");

          const token = this.getToken();
          if (!token) {
            socketError("[Socket] Nenhum token disponível");
            return Promise.reject(new Error("Sem token"));
          }

          try {
            const decoded = jwt_decode(token);
            socketLog("[Auth] Token decodificado:", decoded);
          } catch (e) {
            socketError("[Auth] Erro ao decodificar token:", e);
          }

          // Reduzir tempo de timeout em modo dev
          const timeoutValue = DEVELOPMENT_MODE ? 5000 : 10000;

          this.socket = io(BACKEND_URL, {
            path: "/api/socketio",
            transports: ["websocket", "polling"],
            reconnection: false,
            timeout: timeoutValue,
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
                socketLog("[Socket] Timeout - alternando para HTTP polling");

                // Em modo dev, marcamos como falha permanente
                if (DEVELOPMENT_MODE) {
                  this.connectionFailed = true;
                  this.wsAvailable = false;
                }

                this.setupHttpPolling();
                reject(new Error("Timeout de conexão"));
              }
            }, timeoutValue);

            this.socket.once("connect", () => {
              clearTimeout(timeoutId);
              resolve();
            });
          });
        } else if (!this.socket.connected) {
          socketLog("[Socket] Reconectando socket existente...");
          this.socket.connect();
          return Promise.resolve();
        } else {
          return Promise.resolve();
        }
      },
    };

    Vue.prototype.$initSocketConnection = function () {
      // Em modo dev, verificamos se já falhamos antes
      if (DEVELOPMENT_MODE && Vue.prototype.$socketio.connectionFailed) {
        socketLog(
          "[Socket] Modo desenvolvimento: Conexão já falhou anteriormente, usando apenas HTTP"
        );
        return;
      }

      globalAttempts = 0;
      socketLog("[Auth] Inicializando conexão de socket após login");
      Vue.prototype.$socketio.clearAllTimers();
      Vue.prototype.$socketio.wsAvailable = true;

      // Verificar se o token tem um ID de login válido
      if (!Vue.prototype.$socketio.hasValidToken()) {
        socketError("[Socket] Token sem ID de login válido");
        return;
      }

      Vue.prototype.$socketio.connect().catch((err) => {
        socketError("[Socket] Falha na conexão inicial:", err);
        Vue.prototype.$socketio.setupHttpPolling();
      });
    };

    Vue.nextTick(() => {
      if (Vue.prototype.$socketio.getToken()) {
        Vue.prototype.$initSocketConnection();
      }
    });
  },
};
