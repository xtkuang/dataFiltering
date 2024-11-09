import prisma from '../prisma'
import * as jwt from 'jsonwebtoken'
import type { JwtUserProps } from '../types'
class UserService {
  async createToken(user: JwtUserProps) {
    const { username, id, role } = user
    const token = jwt.sign({ username, id, role }, process.env.JWT_SECRET, {
      expiresIn: '3h',
    })
    return token
  }
  async register(username: string, password: string, role: string = 'admin') {
    const user = await prisma.user.create({
      data: {
        username,
        password,
        role,
      },
    })
    if (user) {
      return Promise.resolve(user)
    }
    return Promise.reject(null)
  }
  async login(username: string, password: string) {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    })
    if (user && user.password === password) {
      return Promise.resolve(user)
    }
    return Promise.reject(null)
  }
  async getUser(username: string) {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    })

    return Promise.resolve(user)
  }
}

export default new UserService()
