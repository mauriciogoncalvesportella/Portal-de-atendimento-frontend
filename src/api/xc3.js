import { Client } from './rest-client'

const getFoneList = async () => {
  return await Client.get('/3cx/fone-list')
}

const bind = async (fone, cdchave, idnome) => {
  return await Client.post('/3cx/bind', {
    cdchave,
    fone,
    idnome,
  })
}

export {
  getFoneList,
  bind,
}
