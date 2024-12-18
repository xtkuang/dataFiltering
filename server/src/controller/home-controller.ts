/**
 * Controller用于接受数据、返回数据给前端
 */
import { Context } from 'koa'
import homeService from '../service/home-service'
import dataFilteringService from '../service/dataFiltering.service'
import 'koa-body'
/**
 * 返回hello world
 * @param ctx
 */
export const hello = async (ctx: Context) => {
  const res = await homeService.hello()
  ctx.body = res
}

/**
 * 接收name处理后返回给前端
 * @param ctx
 */
export const helloName = async (ctx: Context) => {
  const { name } = ctx.params
  const res = await homeService.helloName(name)
  ctx.body = res
}

/**
 * 返回query参数
 * 如：/info?name=jack&age=32
 * ctx.query => { name: 'jack', age: '32' }
 * @param ctx
 */
export const getPersonInfo = async (ctx: Context) => {
  const queryParams = ctx.query
  const res = await homeService.getPersonInfo(queryParams)
  ctx.body = res
}
export const searchText = async (ctx: Context) => {
  const { query } = ctx.request.query
  const res = await dataFilteringService.searchAllTables(query as string)
  return res
}
export const exportDataToExcel = async (ctx: Context) => {
  const { projectCode } = ctx.request.query as { projectCode: string }
  const codes = projectCode?.split(',')
  const buffer = await dataFilteringService.exportDataToExcel(codes)

  const fileName = encodeURIComponent('导出数据.xlsx')
  ctx.set('Content-Disposition', `attachment; filename=${fileName}`)
  ctx.set(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
  ctx.body = buffer // 将文件内容返回给用户
  console.log('数据已成功导出到Excel文件并准备下载')
}
/**
 * 接收post请求，并获取参数
 * @param ctx
 */
export const postTest = async (ctx: Context) => {
  const params = ctx.request.body
  const res = await homeService.postTest(params)
  ctx.body = res
}

export const getData = async (ctx: Context) => {
  const params = ctx.request.body
  const res = await dataFilteringService.getData(params)
  return res
}

export const uploadFile = async (ctx: Context) => {
  const files = ctx.request.files
  const res = await dataFilteringService.parseExcel(files)
  ctx.body = res
}
export const resetTable = async (ctx: Context) => {
  const res = await dataFilteringService.resetTable()
  ctx.body = res
}
