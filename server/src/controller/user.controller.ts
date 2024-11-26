import { Context } from 'koa'
import UserService from '../service/user.service' // 引入 UserService
import * as bcrypt from 'bcrypt'
import { CustomError } from 'src/error'
export const auth = async (ctx: Context) => {
  return 'success'
}
export const login = async (ctx: Context) => {
  const { username, password } = ctx.request.body as {
    username: string
    password: string
  }
  const result = await UserService.login(username, password)
  //存在则更新，不存在则创建
  const session = await ctx.prisma.session.findUnique({
    where: {
      userId: result.id,
    },
  })
  if (session) {
    await ctx.prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        token: result.token,
        destruction: new Date(Date.now() + ctx.destructionTime),
      },
    })
  } else {
    await ctx.prisma.session.create({
      data: {
        token: result.token,
        userId: result.id,
        destruction: new Date(Date.now() + ctx.destructionTime),
      },
    })
  }

  // 调用 UserService 的 login 方法
  ctx.cookies.set('token', result.token)
  return { token: result.token } // 返回登录结果
}

export const getUser = async (ctx: Context) => {
  return ctx.state.user
}
export const getUserList = async (ctx: Context) => {
  const result = await UserService.getUserList()
  return { result }
}
export const logout = async (ctx: Context) => {
  const { userId } = ctx.request.body as { userId: string }
  const sission = await ctx.prisma.session.findUnique({
    where: {
      userId,
    },
  })

  if (sission) {
    await ctx.prisma.session.delete({
      where: {
        userId,
      },
    })
  }

  return { message: 'Logout successful' }
}
export const deleteUser = async (ctx: Context) => {
  const { userId } = ctx.request.body as { userId: string }
  const user = await ctx.prisma.user.findUnique({
    where: {
      id: userId,
    },
  })
  if (ctx.state.user.role === 'user') {
    throw new CustomError(201, '用户无权限')
  }
  if (user) {
    await ctx.prisma.user.delete({
      where: {
        id: userId,
      },
    })
    return { message: 'Delete user successful' }
  }
  throw new CustomError(201, '用户不存在')
}
export const register = async (ctx: Context) => {
  const { username, password, role } = ctx.request.body as {
    username: string
    password: string
    role: string
  }
  if (ctx.state?.user?.role === 'user') {
    throw new CustomError(201, '用户无权限')
  }
  const result = await UserService.register(username, password, role) // 调用 UserService 的 register 方法
  return { result } // 返回注册结果
}
export const resetPassword = async (ctx: Context) => {
  const { userId } = ctx.request.body as { userId: string }
  const user = await ctx.prisma.user.findUnique({
    where: {
      id: userId,
    },
  })
  if (ctx.state.user.role === 'user') {
    throw new CustomError(201, '用户无权限')
  }
  if (user) {
    const hashedPassword = await bcrypt.hash('123456', 10)
    await ctx.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    })
    return { message: '重置密码成功' }
  }
  throw new CustomError(201, '用户不存在')
}
export const updatePassword = async (ctx: Context) => {
  const { userId, oldPassword, newPassword } = ctx.request.body as {
    userId: string
    oldPassword: string
    newPassword: string
  }

  const user = await ctx.prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  if (!user) {
    throw new CustomError(201, '用户不存在')
  }

  // 验证旧密码是否正确
  const isValidPassword = await bcrypt.compare(oldPassword, user.password)
  if (!isValidPassword) {
    throw new CustomError(201, '原密码错误')
  }

  // 加密新密码并更新
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await ctx.prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  })

  return { message: '修改密码成功' }
}
export const updateUser = async (ctx: Context) => {
  const { userId, username, role } = ctx.request.body as {
    userId: string
    username: string
    role: string
  }
  if (ctx.state.user.role === 'user') {
    throw new CustomError(201, '用户无权限')
  }
  // 检查用户名是否已存在
  const existingUser = await ctx.prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (existingUser) {
    throw new CustomError(201, '用户名已存在')
  }

  // 更新用户信息
  await ctx.prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      username,
      role,
    },
  })

  return { message: '更新用户信息成功' }
}
