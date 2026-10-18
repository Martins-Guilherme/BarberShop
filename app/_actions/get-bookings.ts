'use server'

import { endOfDay, startOfDay } from 'date-fns'

import { expireUnpaidBookings } from '../_lib/expire-unpaid-bookings'
import { db } from '../_lib/prisma'

interface GetBookingsProps {
  serviceId: string
  date: Date
}

export const getBookings = async ({ date }: GetBookingsProps) => {
  await expireUnpaidBookings()

  return db.booking.findMany({
    where: {
      status: { not: 'cancel' },
      date: {
        lte: endOfDay(date),
        gte: startOfDay(date),
      },
    },
  })
}
