import axios from "axios";

export const authService = {
  async login(username: string, password: string) {
    console.log("Tentando login com:", username, password);
    try {
      // Use APENAS esta URL
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        { username, password },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Login bem-sucedido:", response);
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error) {
      console.error("Erro completo:", error);
      throw error;
    }
  },
};
