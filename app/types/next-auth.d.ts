import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  export interface Session {
    user: {
      id: string
      role: 'USER' | 'ADMIN'
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  export interface JWT {
    role?: 'USER' | 'ADMIN'
  }
}
