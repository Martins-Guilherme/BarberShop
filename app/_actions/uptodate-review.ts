'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

import { db } from '../_lib/prisma'
import { authOptions } from '../_lib/auth'
import { Prisma } from '../_generated/prisma/client'

interface UptoDateReviewProps {
  bookingId: string
  rating: number
}
type ReviewResult = { success: true } | { success: false; error: string }

export const UptoDateReview = async ({
  bookingId,
  rating,
}: UptoDateReviewProps): Promise<ReviewResult> => {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { success: false, error: 'Você precisa estar logado.' }
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, error: 'A avaliação dever ser entre 1 e 5.' }
  }

  const booking = await db.booking.findUnique({
    where: {
      id: bookingId,
    },
    select: {
      userId: true,
      date: true,
      review: { select: { id: true } },
    },
  })

  if (!booking || booking.userId !== session.user.id) {
    return { success: false, error: 'Agendamento não encontrado.' }
  }

  if (booking.date > new Date()) {
    return {
      success: false,
      error: 'Você só pode realizar a avaliação após o atendimento.',
    }
  }

  if (booking.review) {
    return { success: false, error: 'Este agendamento já foi avaliado' }
  }

  try {
    await db.serviceReview.create({
      data: { bookingId, rating },
    })
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return { success: false, error: 'Este agendamento já foi avaliado' }
    }
    throw err
  }

  revalidatePath('/bookings')
  return { success: true }
}
