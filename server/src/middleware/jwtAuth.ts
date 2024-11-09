import * as jwt from 'jsonwebtoken'
import * as Koa from 'koa'
const whiteList = ['/user/login', '/user/register']
function jwtAuthMiddleware() {
  return async (ctx: Koa.Context, next: Koa.Next) => {
    const token = ctx.headers.authorization?.split(' ')[1] // Bearer token
    console.log('path:', ctx.path)
    if (whiteList.includes(ctx.path)) {
      await next()
      return
    }
    if (!token) {
      ctx.status = 401
      ctx.body = { code: 401, message: '未授权' }
      return
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      ctx.state.user = decoded
    } catch (error) {
      ctx.status = 401
      ctx.body = { code: 401, message: '未授权' }
      return
    }

    await next()
  }
}
export default jwtAuthMiddleware
