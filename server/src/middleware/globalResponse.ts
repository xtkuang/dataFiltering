import type { Context, Next } from 'koa'

import { CustomError } from '../error'

export default function globalResponseHandler() {
  return async (ctx: Context, next: Next) => {
    try {
      const data = await next()

      ctx.response.body = {
        code: 200,
        data,
        msg: 'success',
      }
    } catch (error) {
      let code = 500
      let errorMessage = 'unknown error'

      if (error instanceof CustomError) {
        code = error.code
        errorMessage = error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      console.error(error)
      ctx.status = code
      ctx.response.body = {
        code: code,
        msg: errorMessage,
      }
    }
  }
}
