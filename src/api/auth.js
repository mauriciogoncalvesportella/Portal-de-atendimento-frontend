import axios from "axios";
import store from "@/store/index.js";

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
      localStorage.setItem("access_token", res.token);
      store.commit("SET_TOKEN", res.token);
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
    await axios.get("http://localhost:3000/api/auth/logout", {
      withCredentials: true,
    });
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
};

export { login, logout };
