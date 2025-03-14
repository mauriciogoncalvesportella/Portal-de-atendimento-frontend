import { Client } from './rest-client'

const addAtendimento = async (data) => {
  const ret = await Client.post('/atendimento/add', data)
  return ret
}

const done = async (data) => {
  return await Client.post('/atendimento/done', data)
}

const all = async () => {
  return await Client.get('/atendimento/all')
}

const allAdmin = async (data) => {
  return await Client.post('/atendimento/all-admin', data)
}

const update = async (data) => {
  return await Client.post('/atendimento/update', data)
}

const allMotivo = async () => {
  return await Client.get('atendimento/motivo/all')
}

const addMotivo = async (data) => {
  return await Client.post('atendimento/motivo/add', data)
}

const deleteMotivo = async (cd) => {
  return await Client.post(`atendimento/motivo/delete/${cd}`)
}

const updateMotivo = async (data) => {
  return await Client.post('atendimento/motivo/update', data)
}

const addOrigem = async (data) => {
  return await Client.post('/atendimento/origem/add', data)
}

const updateOrigem = async (data) => {
  return await Client.post('/atendimento/origem/update', data)
}

const allOrigem = async () => {
  return await Client.get('atendimento/origem/all')
}

const deleteOrigem = async (cd) => {
  return await Client.post(`atendimento/origem/delete/${cd}`)
}

const stopStart = async (data) => {
  return await Client.post('atendimento/stop-start', data)
}

const destroy = async (cd) => {
  return await Client.get(`atendimento/destroy/${cd}`)
}

const changeMotivo = async (data) => {
  return await Client.post('atendimento/change-motivo', data)
}

const getOnline = async () => {
  return await Client.get('atendimento/online')
}

export {
  getOnline,
  changeMotivo,
  update,
  addAtendimento,
  all,
  allAdmin,
  done,
  allMotivo,
  updateMotivo,
  addMotivo,
  deleteMotivo,
  allOrigem,
  addOrigem,
  updateOrigem,
  deleteOrigem,
  stopStart,
  destroy,
}
