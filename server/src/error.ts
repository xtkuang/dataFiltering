export class CustomError extends Error {
  code: number

  constructor(code?: number, message: string = 'unknown error') {
    super(message)
    this.code = code || 500
    this.name = 'CustomError'
  }
}
