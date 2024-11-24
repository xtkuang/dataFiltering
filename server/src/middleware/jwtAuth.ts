import * as jwt from 'jsonwebtoken'
import * as Koa from 'koa'
import { CustomError } from 'src/error'
const whiteList = ['/user/login', '/user/register']
function jwtAuthMiddleware() {
  return async (ctx: Koa.Context, next: Koa.Next) => {
    const token = ctx.headers.cookie?.split('=')[1] // Bearer token
    console.log('path:', ctx.path)
    if (whiteList.includes(ctx.path)) {
      return await next()
    }
    if (!token) {
      throw new CustomError(401, '未授权')
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      ctx.state.user = decoded
    } catch (error) {
      throw new CustomError(401, '未授权')
    }

    return await next()
  }
}
export default jwtAuthMiddleware
