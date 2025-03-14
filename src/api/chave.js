import { Client } from './rest-client'

const all = async () => {
  return await Client.get('/chave/all')
}

const allChavesFones = async (params) => {
  return await Client.post('/chave/all-chaves-fones', params)
}

const createChaveFone = async (params) => {
  return await Client.post('/chave/create-chave-fone', params)
}

const updateChaveFone = async (params) => {
  return await Client.post('/chave/update-chave-fone', params)
}

const deleteChaveFone = async (cd) => {
  return await Client.post(`chave/delete-chave-fone/${cd}`)
}

const allSolicitantesFromChave = async (cdchave) => {
  return await Client.get(`/chave/solicitante/all-from-chave/${cdchave}`)
}

const addSolicitante = async (solicitante) => {
  return await Client.post('/chave/solicitante/add', solicitante)
}

const updateDtvalidade = async (data) => {
  return await Client.post('/chave/update-dt-validade', data)
}

export {
  all,
  updateDtvalidade,
  allSolicitantesFromChave,
  allChavesFones,
  addSolicitante,
  createChaveFone,
  updateChaveFone,
  deleteChaveFone,
}
