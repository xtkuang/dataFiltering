import { createContext, useContext } from 'react'
import ErmData from './ermData'
import User from './user'
const ermData = new ErmData()
const user = new User()
const stores = { ermData, user }
// 创建上下文

const storesContext = createContext(stores)
const useStores = () => {
  return useContext(storesContext)
}
export default useStores
