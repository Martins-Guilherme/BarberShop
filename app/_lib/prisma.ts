import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  cachedPrisma?: PrismaClient
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!globalForPrisma.cachedPrisma) {
    globalForPrisma.cachedPrisma = new PrismaClient()
  }
  prisma = globalForPrisma.cachedPrisma
}

export const db = prisma
