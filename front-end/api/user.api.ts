import { request } from '@/utils/request'

class User {
  async login(data: any) {
    return request('user/login', {
      method: 'POST',
      data,
    })
  }
  async register(data: any) {
    return request('user/register', {
      method: 'POST',
      data,
    })
  }
  async getUserList() {
    return request('user/list', {
      method: 'GET',
    })
  }
}
const user = new User()
export default user
