import { Context } from 'koa'
import UserService from '../service/user.service' // 引入 UserService

export const login = async (ctx: Context) => {
  const { username, password } = ctx.request.body as {
    username: string
    password: string
  }
  const result = await UserService.login(username, password) // 调用 UserService 的 login 方法
  if (result) {
    const token = await UserService.createToken({
      username: result.username,
      id: result.id,
      role: result.role,
    })
    ctx.response.body = { code: 200, data: { token } } // 返回登录结果
  } else {
    ctx.response.body = { code: 401, data: null } // 返回登录结果
  }
}

export const getUser = async (ctx: Context) => {
  ctx.response.body = ctx.state.user
}

export const register = async (ctx: Context) => {
  const { username, password, role } = ctx.request.body as {
    username: string
    password: string
    role: string
  }
  const result = await UserService.register(username, password, role) // 调用 UserService 的 register 方法
  if (result) {
    ctx.response.body = { code: 200, data: result } // 返回注册结果
  } else {
    ctx.response.body = { code: 401, data: null } // 返回注册结果
  }
}
