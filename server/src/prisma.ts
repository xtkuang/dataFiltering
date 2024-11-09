import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

process.on('beforeExit', async () => {
  await prisma.$disconnect()
  console.log('Prisma client disconnected')
})

export default prisma
