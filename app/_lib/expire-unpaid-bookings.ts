import { db } from './prisma'

export const expireUnpaidBookings = async () => {
  await db.booking.updateMany({
    where: {
      status: 'pending',
      paymentStatus: { not: 'approved' },
      paymentExpiresAt: { lte: new Date() },
    },
    data: {
      status: 'cancel',
      paymentStatus: 'expired',
    },
  })
}
