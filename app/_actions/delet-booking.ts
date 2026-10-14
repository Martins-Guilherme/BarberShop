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

  const { count } = await db.booking.updateMany({
    where: {
      id: bookingId,
      userId: session.user.id,
      status: { in: ['pending', 'confirmed'] },
    },
    data: { status: 'cancel' },
  })

  if (count === 0) {
    throw new Error('Reserva não encontrada, já cancelada ou finalizada.')
  }

  revalidatePath('/')
  revalidatePath('/bookings')
}
