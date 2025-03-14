import { Client } from './rest-client'

const getTable = async (id) => {
  return await Client.get(`user/table/${id}`)
}

const setTable = async ({ data, id }) => {
  await Client.post(`user/table/${id}`, data)
}

const getList = async () => {
  return Client.get('user/all')
}

const create = async (data) => {
  return Client.post('user/create', data)
}

const update = async (data) => {
  await Client.post('user/update', data)
}

const allGrupoAcesso = async (data, force = false) => {
  return await Client.get('user/grupo-acesso/all')
}

const addGrupoAcesso = async (data) => {
  return await Client.post('user/grupo-acesso/add', data)
}

export {
  getTable,
  setTable,
  getList,
  create,
  update,
  allGrupoAcesso,
  addGrupoAcesso,
}
