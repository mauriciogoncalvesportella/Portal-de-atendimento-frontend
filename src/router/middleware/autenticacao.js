import store from '@/store/index.js'

export default function autenticacao (to, from, next) {
  if (!store.getters.token || store.getters.token === 'unauthorized') {
    return next({
        name: 'login',
    })
  } else {
    next()
  }
}
