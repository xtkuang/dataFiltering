import { Context } from 'koa'
import UserService from '../service/user.service' // 引入 UserService

export const login = async (ctx: Context) => {
  const { username, password } = ctx.request.body as {
    username: string
    password: string
  }
  const result = await UserService.login(username, password)
   // 调用 UserService 的 login 方法
   ctx.cookies.set('token', result.token);
  return { token: result.token } // 返回登录结果
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
  return { result } // 返回注册结果
  
}
