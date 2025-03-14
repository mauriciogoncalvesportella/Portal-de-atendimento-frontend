import { Client } from './rest-client'
import { omitBy, isNil } from 'lodash'

const allEvento = async (dtinicio, dtfim, userTarget = null) => {
  const params = omitBy({
    userTarget,
  }, isNil)
  return await Client.get(`agenda/evento/all/${dtinicio}/${dtfim}`, { params })
}

const addEvento = async (data) => {
  return await Client.post('/agenda/evento/add', data)
}

const duplicarEvento = async (data) => {
  return await Client.post('/agenda/evento/duplicar', data)
}

const updateEvento = async (data) => {
  return await Client.post('/agenda/evento/update', data)
}

const allTipoAgendamento = async () => {
  return await Client.get('agenda/tipo-agendamento/all')
}

const addTipoAgendamento = async (data) => {
  return await Client.post('agenda/tipo-agendamento/add', data)
}

const updateTipoAgendamento = async (data) => {
  return await Client.post('agenda/tipo-agendamento/update', data)
}

const deleteTipoAgendamento = async (cd) => {
  return await Client.post(`agenda/tipo-agendamento/delete/${cd}`)
}

const deleteEvento = async (cd) => {
  return await Client.get(`agenda/evento/delete/${cd}`)
}

const fixarEvento = async (data) => {
  await Client.post('agenda/evento/fixar/', data)
}

export {
  addEvento,
  duplicarEvento,
  updateEvento,
  fixarEvento,
  allEvento,
  allTipoAgendamento,
  addTipoAgendamento,
  updateTipoAgendamento,
  deleteTipoAgendamento,
  deleteEvento,
}
