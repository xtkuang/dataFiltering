import { makeAutoObservable } from 'mobx'
import user from '@/api/user.api'
class User {
  // status: 'login' | 'logout' = 'logout'
  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }
  register(data: any) {
    return user.register(data)
  }
  login() {
    // this.status = 'login'
  }
  logout() {
    // this.status = 'logout'
    localStorage.removeItem('token')
  }
  getUserInfo() {
    console.log('getUserInfo')
  }
}

export default User
