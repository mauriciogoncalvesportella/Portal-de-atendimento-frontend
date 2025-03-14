import { Client } from './rest-client'

const get = async () => {
  return await Client.get('/time')
}

export {
  get,
}
