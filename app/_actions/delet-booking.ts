'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

import { authOptions } from '../_lib/auth'
import { db } from '../_lib/prisma'

export async function deleteBooking(bookingId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Você precisa estar logado para cancelar a reserva.')
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { userId: true },
  })

  if (!booking || booking.userId !== session.user.id) {
    throw new Error('Reserva não encontrada ou não pertence ao usuário atual.')
  }

  await db.booking.delete({
    where: {
      id: bookingId,
    },
  })

  revalidatePath('/bookings')
}
