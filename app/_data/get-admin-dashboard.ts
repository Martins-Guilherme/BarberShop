'use server'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '../_lib/auth'
import { db } from '../_lib/prisma'
import { finalizeExpiredBookings } from './finalize-expired-bookings'

export const getAdminDashboard = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  await finalizeExpiredBookings()

  const [
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    averageRating,
  ] = await Promise.all([
    db.booking.count({ where: { status: { not: 'cancel' } } }),
    db.booking.count({
      where: { status: 'pending' },
    }),
    db.booking.count({
      where: { status: 'confirmed' },
    }),
    db.booking.count({
      where: { status: 'finalized' },
    }),
    db.serviceReview.aggregate({
      _avg: {
        rating: true,
      },
    }),
  ])

  const recentBookings = await db.booking.findMany({
    take: 6,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      service: {
        include: {
          barbershop: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      review: true,
    },
  })

  return {
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    averageRating: Number(averageRating._avg.rating ?? 0),
    recentBookings,
  }
}
