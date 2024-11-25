import request from '@/utils/request'

class User {
  async login(data: any) {
    return request.post('user/login', data)
  }
  async register(data: any) {
    return request.post('user/register', data)
  }
  async getUserInfo() {
    return request.get('user/info')
  }
  async getUserList() {
    return request.get('user/list')
  }
  async deleteUser(userId: string) {
    return request.post('user/delete', { userId })
  }
  async logout(userId: string) {
    return request.post('user/logout', { userId })
  }
  async addUser(data: any) {
    return request.post('user/add', data)
  }
  async updatePassword(data: any) {
    return request.post('user/updatePassword', data)
  }
  async resetPassword(data: any) {
    return request.post('user/resetPassword', data)
  }
  async updateUser(data: any) {
    return request.post('user/update', data)
  }
}
const user = new User()
export default user
