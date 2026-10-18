'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

import { authOptions } from '../_lib/auth'
import { refundMercadoPagoPayment } from '../_lib/mercado-pago'
import { db } from '../_lib/prisma'

export async function deleteBooking(bookingId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Você precisa estar logado para cancelar a reserva.')
  }

  const booking = await db.booking.findFirst({
    where: {
      id: bookingId,
      userId: session.user.id,
      status: { in: ['pending', 'confirmed'] },
    },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      mercadoPagoPaymentId: true,
    },
  })

  if (!booking) {
    throw new Error('Reserva não encontrada, já cancelada ou finalizada.')
  }

  if (booking.paymentStatus === 'approved') {
    if (!booking.mercadoPagoPaymentId) {
      throw new Error('Não foi possível localizar o pagamento para reembolso.')
    }

    await refundMercadoPagoPayment({
      paymentId: booking.mercadoPagoPaymentId,
      bookingId: booking.id,
    })
    const { count } = await db.booking.updateMany({
      where: {
        id: booking.id,
        userId: session.user.id,
        status: { in: ['pending', 'confirmed'] },
        paymentStatus: 'approved',
      },
      data: { status: 'cancel', paymentStatus: 'refunded' },
    })
    if (count === 0) {
      throw new Error(
        'O reembolso foi solicitado, mas a reserva mudou. Atualize a página.'
      )
    }
  } else {
    const { count } = await db.booking.updateMany({
      where: {
        id: booking.id,
        userId: session.user.id,
        status: { in: ['pending', 'confirmed'] },
        paymentStatus: { not: 'approved' },
      },
      data: { status: 'cancel' },
    })
    if (count === 0) {
      throw new Error(
        'A reserva foi atualizada. Atualize a página e tente novamente.'
      )
    }
  }

  revalidatePath('/')
  revalidatePath('/bookings')
}
