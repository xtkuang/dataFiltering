import * as jwt from 'jsonwebtoken'
import * as Koa from 'koa'
import { CustomError } from 'src/error'
const whiteList = ['/user/login', '/erm/export']
function jwtAuthMiddleware() {
  return async (ctx: Koa.Context, next: Koa.Next) => {
    const token = ctx.headers.authorization?.split(' ')[1] // Bearer token

    console.log('path:', ctx.path)
    if (whiteList.includes(ctx.path)) {
      return await next()
    }
    if (!token) {
      throw new CustomError(401, '未授权')
    }
    if (!(await ctx.prisma.session.findUnique({ where: { token } }))) {
      ctx.cookies.set('token', '')
      throw new CustomError(401, '会话已被注销')
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      ctx.state.user = decoded
      ctx.state.token = token
    } catch (error) {
      throw new CustomError(401, '未授权')
    }

    return await next()
  }
}
export default jwtAuthMiddleware
