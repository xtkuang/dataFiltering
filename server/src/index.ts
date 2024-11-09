import * as Koa from 'koa'
import * as Router from '@koa/router'
import * as bodyParser from 'koa-bodyparser'
import { PORT } from './config'
import routesAction from './routes'
import prisma from './prisma'
import type { PrismaClient } from '@prisma/client'
// import middlewareList from './middleware'
import jwtAuthMiddleware from './middleware/jwtAuth'
import globalResponseHandler from './middleware/globalResponse'
declare module 'koa' {
  interface Context {
    prisma: PrismaClient
  }
}
const app = new Koa()
app.context.prisma = prisma

//路由及处理

//中间件
app.use(bodyParser())
app.use(globalResponseHandler())
app.use(jwtAuthMiddleware())
const router = new Router()
routesAction.forEach(({ path, type, action }) => router[type](path, action))
app.use(router.routes())
app.use(router.allowedMethods())

// app.use(authMiddleware)
app.listen(PORT)

console.log(`应用启动成功 端口:${PORT}`)
