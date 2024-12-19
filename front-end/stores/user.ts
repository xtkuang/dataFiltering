import { makeAutoObservable, runInAction } from 'mobx'
import user from '@/api/user.api'

import { setToken } from '@/utils/cookie'
class User {
  userList: any[] = []
  user: any = null

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
    this.getUserInfo()
    this.getUserList()
  }
  register(data: any) {
    return user.register(data)
  }
  async login(data: any) {
    return user.login(data).then((res) => {
      if ((res as any).code == 200) {
        if ((res as any).data.token) {
          localStorage.setItem('token', (res as any).data.token)
          //存入cookie
          setToken((res as any).data.token)
          this.getUserInfo()
        }
      }
      return res
    })
  }
  async logout(userId: string) {
    return user.logout(userId).then(() => {})
  }

  async getUserInfo() {
    return user.getUserInfo().then((res) => {
      runInAction(() => {
        this.user = res.data
      })
    })
  }
  async getUserList() {
    return user.getUserList().then((res) => {
      runInAction(() => {
        this.userList = res.data.result
      })
    })
  }
  async deleteUser(id: string) {
    return user.deleteUser(id).then(async (res) => {
      await this.getUserList()
    })
  }
  async updatePassword(data: any) {
    return user.updatePassword(data)
  }
  async resetPassword(data: any) {
    return user.resetPassword(data)
  }
  async updateUser(data: any) {
    return user.updateUser(data)
  }
}

export default User
