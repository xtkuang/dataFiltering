import Cookies from 'js-cookie'
const TOKEN_KEY = 'token'
export const getToken = () => Cookies.get(TOKEN_KEY)
export const setToken = (token: string) =>
  Cookies.set(TOKEN_KEY, token, { expires: 1 })
export const removeToken = () => Cookies.remove(TOKEN_KEY)
