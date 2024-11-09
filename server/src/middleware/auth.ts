import * as Koa from 'koa'
import type { JwtUserProps } from '../types'

const roleList = ['admin', 'superAdmin']
const authMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
  const user = ctx.state.user as JwtUserProps

  if (!user) {
    ctx.status = 403 // 禁止访问
    ctx.body = { code: 403, message: '未授权' }

    return
  }

  // 检查用户角色
  if (!roleList.includes(user.role)) {
    ctx.status = 403 // 禁止访问
    ctx.body = { code: 403, message: '非法访问' }
    return
  }

  await next()
}
export default authMiddleware
