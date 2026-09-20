import { defineConfig, env } from 'prisma/config'

;(
  process as typeof process & { loadEnvFile?: (path?: string) => void }
).loadEnvFile?.()

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'pnpm tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
