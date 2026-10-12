'use server'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '../_lib/auth'
import { db } from '../_lib/prisma'

export const getAdminDashboard = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const [totalBookings, confirmedBookings, completedBookings, averageRating] =
    await Promise.all([
      db.booking.count(),
      db.booking.count({
        where: {
          date: {
            gte: new Date(),
          },
        },
      }),
      db.booking.count({
        where: {
          date: {
            lt: new Date(),
          },
        },
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
    confirmedBookings,
    completedBookings,
    averageRating: Number(averageRating._avg.rating ?? 0),
    recentBookings,
  }
}
