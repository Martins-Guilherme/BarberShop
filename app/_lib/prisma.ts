import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/app/_generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  cachedPrisma?: PrismaClient
}

const prisma =
  globalForPrisma.cachedPrisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    }),
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.cachedPrisma = prisma
}

export const db = prisma
