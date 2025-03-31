import axios from "axios";
// Configuração base do Axios
const Client = axios.create({
  baseURL: (process.env.VUE_APP_BACKEND_URL || "http://localhost:3000"),
  timeout: 10000, // 10 segundos de timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
// Interceptor de requisição para adicionar token
Client.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Adiciona o cabeçalho de controle de versão
    config.headers["version-control"] = process.env.VUE_APP_VERSION || "default";
    return config;
  },
  (error) => Promise.reject(error)
);
// Interceptor de resposta para tratamento de erros
Client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log de erros detalhado
    console.error("Erro na requisição:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
    });
    // Tratamento de erros específicos
    if (error.response) {
      switch (error.response.status) {
        case 401: // Não autorizado
          // Redirecionar para login ou fazer logout
          localStorage.removeItem("token");
          localStorage.removeItem("access_token");
          window.location.href = "/login";
          break;
        case 403: // Proibido
          console.error("Acesso negado");
          break;
        case 404: // Não encontrado
          console.error("Recurso não encontrado");
          break;
        case 500: // Erro interno do servidor
          console.error("Erro interno do servidor");
          break;
      }
    } else if (error.request) {
      // Requisição feita, mas sem resposta
      console.error("Sem resposta do servidor");
    } else {
      // Erro na configuração da requisição
      console.error("Erro na configuração da requisição");
    }
    return Promise.reject(error);
  }
);
// Cliente de requisições
const client = {
  get: (url, config = {}) => Client.get(url, config),
  post: (url, data, config = {}) => Client.post(url, data, config),
  put: (url, data, config = {}) => Client.put(url, data, config),
  delete: (url, config = {}) => Client.delete(url, config),
  patch: (url, data, config = {}) => Client.patch(url, data, config),
};

// Exportação simplificada - apenas o client
export default client;