import { Client } from "./rest-client";

const add = async (data) => {
  return await Client.post("/fila-espera/add", data);
};

const allOnline = async (data) => {
  return await Client.get("/fila-espera/get/online");
};

const remove = async (cd) => {
  return await Client.delete(`/fila-espera/delete/${cd}`);
};

const getAll = async (data) => {
  return await Client.post("/fila-espera/all", data);
};
const state = {
  fila: [], // Inicialize como array vazio em vez de undefined
};

export { add, allOnline, remove, getAll };
