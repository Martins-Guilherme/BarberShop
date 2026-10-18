'use server'

import { addDays, endOfDay, startOfDay } from 'date-fns'

import { expireUnpaidBookings } from '../_lib/expire-unpaid-bookings'
import { db } from '../_lib/prisma'
import type { PendingBookingPreviewItem } from '../_types/pending-booking-preview'

export const getPendingBookingsForPreview = async (): Promise<
  PendingBookingPreviewItem[]
> => {
  await expireUnpaidBookings()

  const now = new Date()
  const today = startOfDay(now)
  const bookings = await db.booking.findMany({
    where: {
      status: 'pending',
      date: {
        gte: now,
        lte: endOfDay(addDays(today, 7)),
      },
    },
    orderBy: { date: 'asc' },
    select: {
      id: true,
      date: true,
      paymentStatus: true,
      paymentExpiresAt: true,
      paymentAmount: true,
      user: { select: { name: true } },
      service: {
        select: {
          name: true,
          price: true,
          barbershop: { select: { name: true } },
        },
      },
    },
  })

  return bookings.map((booking) => ({
    ...booking,
    paymentAmount: Number(booking.paymentAmount),
    service: {
      ...booking.service,
      price: Number(booking.service.price),
    },
  }))
}
