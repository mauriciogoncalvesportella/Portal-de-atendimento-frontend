import { Client } from './rest-client'

const get = async (data) => {
  return await Client.get(`/monitor/${data}`)
}

export {
  get,
}
