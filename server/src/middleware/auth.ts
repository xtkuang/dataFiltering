import * as Koa from 'koa'
import type { JwtUserProps } from '../types'

const roleList = ['admin', 'user']
const authMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
  const user = ctx.state.user as JwtUserProps

  if (!user) {
    ctx.status = 203 // 禁止访问
    ctx.body = { code: 203, message: '未授权' }

    return await next()
  }

  // 检查用户角色
  if (!roleList.includes(user.role)) {
    ctx.status = 203 // 禁止访问
    ctx.body = { code: 203, message: '非法访问' }

    return await next()
  }

  if (user.role === 'user') {
    const blackList = [
      '/user/update',
      '/user/updatePassword',
      '/user/add',
      '/user/delete',
    ]
    if (blackList.includes(ctx.path)) {
      ctx.status = 203 // 禁止访问
      ctx.body = { code: 203, message: '非法访问' }

      return await next()
    }
  }

  await next()
}
export default authMiddleware
