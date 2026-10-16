'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'

import { authOptions } from '../_lib/auth'
import { db } from '../_lib/prisma'

export const confirmPendingBooking = async (bookingId: string) => {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Você não tem permissão para confirmar agendamentos.')
  }

  const { count } = await db.booking.updateMany({
    where: {
      id: bookingId,
      status: 'pending',
      date: { gt: new Date() },
    },
    data: { status: 'confirmed' },
  })

  if (count === 0) {
    throw new Error(
      'Agendamento não encontrado, já atualizado ou fora do período de confirmação.'
    )
  }

  revalidatePath('/admin')
  revalidatePath('/bookings')
  revalidatePath('/')
}
