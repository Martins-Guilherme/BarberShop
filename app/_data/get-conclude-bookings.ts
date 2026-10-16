'use server'

import { authOptions } from '../_lib/auth'
import { db } from '../_lib/prisma'
import { getServerSession } from 'next-auth'
import { finalizeExpiredBookings } from './finalize-expired-bookings'

export const getConcludeBookings = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user) return []

  await finalizeExpiredBookings()

  return db.booking.findMany({
    where: {
      userId: (session.user as any).id,
      status: 'finalized',
      date: {
        lt: new Date(),
      },
    },
    include: {
      service: {
        include: {
          barbershop: true,
        },
      },
      review: true,
    },
    orderBy: {
      date: 'desc',
    },
  })
}
