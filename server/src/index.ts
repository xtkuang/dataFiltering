import * as Koa from 'koa'
import * as Router from '@koa/router'
import * as bodyParser from 'koa-bodyparser'
import * as cors from 'koa2-cors'
import { PORT } from './config'
import routesAction from './routes'
import prisma from './prisma'
import type { PrismaClient } from '@prisma/client'
import koaBody from 'koa-body'
import * as koaMulter from 'koa-multer'
import * as filepath from 'path'
// import middlewareList from './middleware'
import jwtAuthMiddleware from './middleware/jwtAuth'
import globalResponseHandler from './middleware/globalResponse'
import authMiddleware from './middleware/auth'
declare module 'koa' {
  interface Context {
    prisma: PrismaClient

    destructionTime: number
  }
}

const app = new Koa()
app.context.prisma = prisma

app.context.destructionTime = 1 * 60 * 60 * 1000 // 1d
//console.log(filepath.join(__dirname, '../upload'));
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: filepath.join(__dirname, '../upload'),
    keepExtensions: true,
  }
}));
app.use(
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: '*',
    exposeHeaders: ['Content-Length', 'Date', 'X-Powered-By','Content-Disposition'],
  })
)
app.use(bodyParser())
app.use(globalResponseHandler())
app.use(jwtAuthMiddleware())
// app.use(authMiddleware)
const router = new Router()
routesAction.forEach(({ path, type, action }) => router[type](path, action))
app.use(router.routes())
app.use(router.allowedMethods())
// app.use(authMiddleware)
app.listen(PORT)
console.log(`应用启动成功 端口:${PORT}`)
