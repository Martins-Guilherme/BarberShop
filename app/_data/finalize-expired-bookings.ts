'use server'

import { db } from '../_lib/prisma'
import { expireUnpaidBookings } from '../_lib/expire-unpaid-bookings'

export const finalizeExpiredBookings = async () => {
  await expireUnpaidBookings()

  await db.booking.updateMany({
    where: {
      status: 'pending',
      paymentStatus: { not: 'approved' },
      date: { lte: new Date() },
    },
    data: {
      status: 'cancel',
      paymentStatus: 'expired',
    },
  })

  await db.booking.updateMany({
    where: {
      status: { in: ['pending', 'confirmed'] },
      paymentStatus: 'approved',
      date: { lte: new Date() },
    },
    data: { status: 'finalized' },
  })
}
