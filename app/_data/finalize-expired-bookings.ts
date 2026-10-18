'use server'

import { db } from '../_lib/prisma'

export const finalizeExpiredBookings = async () => {
  await db.booking.updateMany({
    where: {
      status: { in: ['pending', 'confirmed'] },
      date: { lte: new Date() },
    },
    data: { status: 'finalized' },
  })
}
