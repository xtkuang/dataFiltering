import * as Koa from 'koa'
import * as Router from '@koa/router'
import * as bodyParser from 'koa-bodyparser'
import { PORT } from './config'
import routesAction from './routes'
import prisma from './prisma'
import type { PrismaClient } from '@prisma/client'
// import middlewareList from './middleware'
import jwtAuthMiddleware from './middleware/jwtAuth'

declare module 'koa' {
  interface Context {
    prisma: PrismaClient
  }
}
const app = new Koa()
app.context.prisma = prisma

const router = new Router()

//路由及处理
routesAction.forEach(({ path, type, action }) => router[type](path, action))

app.use(bodyParser())
app.use(jwtAuthMiddleware())
app.use(router.routes())
app.use(router.allowedMethods())

// app.use(authMiddleware)
app.listen(PORT)

console.log(`应用启动成功 端口:${PORT}`)
