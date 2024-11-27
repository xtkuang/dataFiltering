import prisma from '../prisma'
import * as jwt from 'jsonwebtoken'
import type { JwtUserProps } from '../types'
import { CustomError } from 'src/error'
import * as bcrypt from 'bcrypt'
import { register } from 'module'
class UserService {
  async createToken(user: JwtUserProps) {
    const { username, id, role } = user
    const token = jwt.sign({ username, id, role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    })

    return token
  }
  async register(username: string, password: string, role: string = 'admin') {
    try {
      const existUser = await prisma.user.findUnique({
        where: {
          username,
        },
      })
      if (existUser) {
        throw new CustomError(201, '注册失败，用户名已存在')
      }
      const hashedPassword = await bcrypt.hash(password, 10)

      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role,
        },
      })
      if (user) {
        return Promise.resolve({
          id: user.id,
          username: user.username,
          role: user.role,
          token: await this.createToken(user),
        })
      }
    } catch (error) {
      console.log('error', error)
      if (error instanceof CustomError) {
        throw error
      }
      throw new CustomError(201, '注册失败，参数错误')
    }
  }
  async login(username: string, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          username,
        },
        select: {
          id: true,
          username: true,
          role: true,
          password: true,
        },
      })
      if (user && (await bcrypt.compare(password, user.password))) {
        return Promise.resolve({
          id: user.id,
          username: user.username,
          role: user.role,
          token: await this.createToken(user),
        })
      }
      return Promise.reject(null)
    } catch (error) {
      console.log('error', error)
      throw new CustomError(201, '登录失败，用户名或密码错误')
    }
  }
  async getUser(username: string) {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    })

    return Promise.resolve(user)
  }
  async getUserList() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
      },
    })
    return Promise.resolve(users)
  }
}

export default new UserService()
