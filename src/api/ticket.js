import { Client } from './rest-client'

const kanban = async () => {
  return await Client.get('/ticket/kanban')
}

const get = async (cd) => {
  return await Client.get(`/ticket/all/${cd}`)
}

const allFilter = async (data) => {
  return await Client.post('/ticket/all-filter', data)
}

const allFilterPaginate = async (data) => {
  return await Client.post('/ticket/all-filter/paginate', data)
}

const allMeta = async (data) => {
  return await Client.get('/ticket/all-meta')
}

const allAcao = async (cdticket) => {
  return await Client.get(`/ticket/acao/all/${cdticket}`)
}

const deleteAcao = async (cdacao) => {
  return await Client.delete(`/ticket/acao/delete/${cdacao}`)
}

const allUsersFromTicket = async (cdticketArray) => {
  return await Client.post('/ticket/all-users-from-ticket', { cdticketArray })
}

const downloadExcel = async (filter) => {
  return await Client.get(`/ticket/download-excel/${filter}`)
}

const uploadAcaoFiles = async (files, ticketcd, acaocd, onUploadProgress) => {
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file)
  }

  return await Client.post(
    `/ticket/upload/${ticketcd}/${acaocd}`,
    formData,
    {
      onUploadProgress,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
}

const downloadAcaoFile = async (data) => {
  return await Client.post('/ticket/download', data, {
    responseType: 'blob',
  })
}

const upsert = async (data) => {
  return await Client.post('/ticket/upsert', data)
}

const addAcao = async (data) => {
  return await Client.post('/ticket/acao/add', data)
}

const getAcao = async (cdacao) => {
  return await Client.get(`/ticket/acao/${cdacao}`)
}

const startServicoAcao = async (cdacao) => {
  return await Client.post(`/ticket/acao/start-servico/${cdacao}`)
}

const stopServicoAcao = async () => {
  return await Client.post('/ticket/acao/stop-servico')
}

const addTicketAcao = async (data) => {
  return await Client.post('/ticket/add-ticket-acao', data)
}

const changeSituacao = async (data) => {
  return await Client.post('/ticket/change-situacao', data)
}

const updateKanbanOrder = async (data) => {
  return await Client.post('/ticket/update-kanban-order', data)
}

const getTicket = async (cd) => {
  return await Client.get(`/ticket/${cd}`)
}

const allSituacao = async () => {
  return await Client.get('/ticket/situacao/all')
}

const addSituacao = async (data) => {
  return await Client.post('/ticket/situacao/add', data)
}

const deleteSituacao = async (cd) => {
  return await Client.post(`/ticket/situacao/delete/${cd}`)
}

const updateSituacao = async (data) => {
  return await Client.post('/ticket/situacao/update', data)
}

const allUrgencia = async () => {
  return await Client.get('/ticket/urgencia/all')
}

const addUrgencia = async (data) => {
  return await Client.post('/ticket/urgencia/add', data)
}

const deleteUrgencia = async (cd) => {
  return await Client.post(`/ticket/urgencia/delete/${cd}`)
}

const updateUrgencia = async (data) => {
  return await Client.post('/ticket/urgencia/update', data)
}

export {
  get,
  kanban,
  deleteAcao,
  allFilter,
  allFilterPaginate,
  allMeta,
  allAcao,
  addAcao,
  uploadAcaoFiles,
  downloadAcaoFile,
  upsert,
  addTicketAcao,
  changeSituacao,
  updateKanbanOrder,
  allUsersFromTicket,
  startServicoAcao,
  stopServicoAcao,
  getTicket,
  getAcao,
  allSituacao,
  addSituacao,
  deleteSituacao,
  updateSituacao,
  allUrgencia,
  addUrgencia,
  deleteUrgencia,
  updateUrgencia,
  downloadExcel,
}
