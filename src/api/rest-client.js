import axios from "axios";
import router from "../router";
import jwtDecode from "jwt-decode";
import vue from "@/main";
import { CustomHttpException } from "@/exception/httpExceptionHandle";
import store from "@/store/index.js";

export const Client = axios.create({
  baseURL: "http://localhost:3000/api", // MODIFICAR AQUI para apontar para o backend correto
  withCredentials: true,
});

// export const
// Se existe JWT na store, mandar junto com qualquer solicitação
Client.interceptors.request.use((request) => {
  request.headers["version-control"] =
    localStorage.getItem("version") ?? "default";
  if (vue.$store.getters.token) {
    if (vue.$store.getters.token !== "unauthorized") {
      const timeExp = jwtDecode(vue.$store.getters.token).exp;
      const timeNow = new Date().getTime() / 1000;
      if (timeNow > timeExp) {
        vue.$store.dispatch("logout", false);
      } else {
        request.headers.Authorization = `Bearer ${vue.$store.getters.token}`;
      }
    }
    return request;
  }
});

Client.interceptors.response.use(
  function (response) {
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
