import axios from "axios";
import router from "../router";
import jwtDecode from "jwt-decode";
import vue from "@/main";
import { CustomHttpException } from "@/exception/httpExceptionHandle";
import store from "@/store/index.js";

export const Client = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
  timeout: 10000, // Adiciona timeout para requisições
});

// Interceptor de request com logging adicional
Client.interceptors.request.use(
  (request) => {
    // Logs adicionais
    console.log("URL completa:", request.baseURL + request.url);
    console.log("Método:", request.method);
    console.log("Headers completos:", JSON.stringify(request.headers));

    // Lógica original de headers e token
    request.headers["version-control"] =
      localStorage.getItem("version") ?? "default";

    console.log("Preparando requisição para:", request.url);
    console.log("Headers", JSON.stringify(request.headers));

    if (vue.$store.getters.token) {
      console.log(
        "Token disponível:",
        vue.$store.getters.token ? "Sim" : "Não"
      );

      if (vue.$store.getters.token !== "unauthorized") {
        const timeExp = jwtDecode(vue.$store.getters.token).exp;
        const timeNow = new Date().getTime() / 1000;

        if (timeNow > timeExp) {
          console.log("Token expirado, fazendo logout");
          vue.$store.dispatch("logout", false);
        } else {
          console.log("Adicionando token ao header");
          request.headers.Authorization = `Bearer ${vue.$store.getters.token}`;
          console.log(
            "Header de autenticação adicionado:",
            request.headers.Authorization
          );
        }
      }
    } else {
      console.log("Token não disponível");
    }

    return request;
  },
  (error) => {
    console.error("Erro no interceptor de request:", error);
    return Promise.reject(error);
  }
);

// Interceptor de response com logging adicional
Client.interceptors.response.use(
  function (response) {
    // Log da resposta completa
    console.log("Resposta completa:", JSON.stringify(response.data));

    // Lógica de versionamento
    const currentVersion = localStorage.getItem("version");
    const serverVersion = response.headers["version-control"];
    if (currentVersion !== serverVersion) {
      localStorage.setItem("version", serverVersion);
      if (currentVersion) {
        store.commit("UPDATE_VERSION", serverVersion);
      }
    }
    return response.data || {};
  },
  async function (err) {
    // Log de erro detalhado
    console.error("Erro de requisição completo:", JSON.stringify(err.response));

    const code = err.response?.status;
    let msg;
    const routeName = router.history.current.name;

    if (code) {
      switch (code) {
        case 401:
          msg = { content: "Erro: Credencial inválida", color: "red" };
          break;
        case 400:
          msg = { content: "Erro: Requisição inválida", color: "orange" };
          break;
        case 403:
          msg = { content: "Erro: Acesso restrito", color: "red" };
          break;
        case 404:
          msg = { content: "Erro: Recurso não encontrado", color: "orange" };
          break;
        case 409:
          msg = { content: "Erro: Registro duplicado", color: "red" };
          break;
        case 413:
          msg = {
            content: "Erro: Requisição ultrapassou limite de 8mb",
            color: "red",
          };
          break;
        case 500:
          msg = { content: "Erro interno servidor", color: "red" };
          break;
        default:
          msg = { content: "Erro desconhecido", color: "orange" };
          break;
      }
    } else {
      msg = { content: "Erro interno do servidor", color: "red" };
    }

    if (code === 401) {
      await vue.$store.dispatch("logout", false);
      if (routeName !== "login") {
        await router.push({ name: "login" });
        if (!vue.$store.getters.forcedLogout) {
          vue.$notifier(msg);
        }
      }
    }

    throw new CustomHttpException(code, msg.content);
  }
);
