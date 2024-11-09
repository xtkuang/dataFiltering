import * as Koa from 'koa'
const { ADMIN_ROLE, USER_ROLE } = process.env
const roleList = [ADMIN_ROLE, USER_ROLE]
const authMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
  const userRole = ctx.headers['x-user-role'] // 假设用户角色通过请求头传递

  if (!userRole) {
    ctx.status = 403 // 禁止访问
    ctx.body = { code: 403, message: '未授权' }
    return
  }

  // 检查用户角色
  if (!roleList.includes(userRole as string)) {
    ctx.status = 403 // 禁止访问
    ctx.body = { code: 403, message: '角色不正确' }
    return
  }

  await next()
}
export default authMiddleware
