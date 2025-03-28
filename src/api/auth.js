import axios from "axios";
import store from "@/store/index.js";
import Vue from "vue";

// Criar uma instância axios configurada
const api = axios.create({
  baseURL: "", // URL base vazia para usar URLs relativas
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Função de login usando a instância axios configurada
const login = async (username, password) => {
  try {
    const response = await api.post("/api/auth/login", { username, password });
    const res = response.data;

    if (res?.token) {
      // Salvar tokens
      localStorage.setItem("access_token", res.token);
      localStorage.setItem("token", res.token);
      // Salvar no store
      store.commit("SET_TOKEN", res.token);

      // Inicializar o socket após login bem-sucedido
      if (Vue.prototype.$initSocketConnection) {
        Vue.prototype.$initSocketConnection();
      } else {
        console.warn("[Auth] Método $initSocketConnection não disponível");
      }
    } else {
      throw new Error("Login inválido - Token não recebido");
    }
    return res;
  } catch (error) {
    // Log detalhado do erro para debug
    console.error("Erro de login:", error);
    console.error(
      "Detalhes do erro:",
      error.response?.data || "Sem detalhes adicionais"
    );
    throw error;
  }
};

// Função de logout atualizada
const logout = async () => {
  try {
    // Limpar tokens antes da requisição para evitar erros de token inválido
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    store.commit("SET_TOKEN", null);

    // Executar logout no servidor
    await api.get("/api/auth/logout");

    // Desconectar socket se disponível
    if (Vue.prototype.$socketio && Vue.prototype.$socketio.clientDisconnect) {
      Vue.prototype.$socketio.clientDisconnect();
    }
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
};

export { login, logout };
