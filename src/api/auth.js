import axios from "axios";
import store from "@/store/index.js";
import Vue from "vue"; // Importante: adicionar esta importação

// Função de login modificada para usar a URL correta
const login = async (username, password) => {
  console.log("Tentando login com:", username);
  console.log("Tentando login com:", password);
  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/login", // URL CORRETA do backend
      { username, password },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const res = response.data;
    console.log(response.data);
    if (res?.token) {
      // Importante: Observe que o token está sendo salvo como "access_token"
      localStorage.setItem("access_token", res.token);

      // Também salvar como "token" para compatibilidade com o socket
      localStorage.setItem("token", res.token);

      // Salvar no store
      store.commit("SET_TOKEN", res.token);

      // ADIÇÃO: Inicializar o socket após login bem-sucedido
      if (Vue.prototype.$initSocketConnection) {
        console.log("[Auth] Inicializando conexão de socket após login");
        Vue.prototype.$initSocketConnection();
      } else {
        console.warn("[Auth] Método $initSocketConnection não disponível");
      }
    } else {
      throw new Error("Login inválido");
    }
    return res;
  } catch (error) {
    console.error("Erro de login:", error);
    throw new Error("Login inválido");
  }
};

// Mantenha a função de logout, mas atualize a URL
const logout = async () => {
  try {
    // Limpar tokens antes da requisição para evitar erros de token inválido
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    store.commit("SET_TOKEN", null);

    // Executar logout no servidor
    await axios.get("http://localhost:3000/api/auth/logout", {
      withCredentials: true,
    });

    // Desconectar socket se disponível
    if (Vue.prototype.$socketio && Vue.prototype.$socketio.clientDisconnect) {
      Vue.prototype.$socketio.clientDisconnect();
    }

    console.log("[Auth] Logout realizado com sucesso");
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
};

export { login, logout };
