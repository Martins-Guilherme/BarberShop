'use server'

import { revalidatePath } from 'next/cache'
import { getDay, isValid } from 'date-fns'

import { expireUnpaidBookings } from '../_lib/expire-unpaid-bookings'
import { createMercadoPagoPixPayment } from '../_lib/mercado-pago'
import { db } from '../_lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../_lib/auth'

interface CreateBookingParams {
  serviceId: string
  date: Date
}

export const createBooking = async (params: CreateBookingParams) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Usuario não autenticado!')
  }
  if (!session.user.email) {
    throw new Error(
      'Sua conta precisa ter um e-mail para gerar o pagamento Pix.'
    )
  }
  const payerEmail =
    process.env.NODE_ENV !== 'production' &&
    process.env.MERCADO_PAGO_TEST_PAYER_EMAIL
      ? process.env.MERCADO_PAGO_TEST_PAYER_EMAIL
      : session.user.email

  if (!isValid(params.date) || params.date <= new Date()) {
    throw new Error('Selecione uma data e horário futuros.')
  }

  await expireUnpaidBookings()

  const service = await db.barbershopService.findUnique({
    where: { id: params.serviceId },
    select: { id: true, name: true, price: true },
  })
  if (!service) {
    throw new Error('O serviço selecionado não existe.')
  }

  const weekday = getDay(params.date)
  const selectedTime = `${String(params.date.getHours()).padStart(2, '0')}:${String(params.date.getMinutes()).padStart(2, '0')}`
  const selectedEndTime = new Date(params.date.getTime() + 30 * 60 * 1000)
  const selectedEndTimeText = `${String(selectedEndTime.getHours()).padStart(2, '0')}:${String(selectedEndTime.getMinutes()).padStart(2, '0')}`
  const availability = await db.weeklyAvailability.findUnique({
    where: { weekday },
  })

  if (
    !availability?.isOpen ||
    selectedTime < availability.startTime ||
    selectedEndTimeText > availability.endTime ||
    params.date.getMinutes() % 30 !== 0 ||
    params.date.getSeconds() !== 0 ||
    params.date.getMilliseconds() !== 0
  ) {
    throw new Error('Este dia ou horário não está disponível para agendamento.')
  }

  const existingBooking = await db.booking.findFirst({
    where: {
      date: params.date,
      status: { not: 'cancel' },
    },
    select: { id: true },
  })

  if (existingBooking) {
    throw new Error('Este horário acabou de ser reservado. Escolha outro.')
  }

  const paymentExpiresAt = new Date(Date.now() + 60 * 60 * 1000)
  const booking = await db.booking.create({
    data: {
      ...params,
      userId: session.user.id,
      status: 'pending',
      paymentStatus: 'pending',
      paymentAmount: service.price,
      paymentExpiresAt,
    },
  })

  let pixPayment: Awaited<ReturnType<typeof createMercadoPagoPixPayment>>
  try {
    pixPayment = await createMercadoPagoPixPayment({
      bookingId: booking.id,
      serviceName: service.name,
      amount: Number(service.price),
      expiresAt: paymentExpiresAt,
      payerEmail,
    })
  } catch (error) {
    await db.booking.update({
      where: { id: booking.id },
      data: { status: 'cancel', paymentStatus: 'expired' },
    })
    throw error
  }

  const pixData = {
    mercadoPagoPaymentId: pixPayment.id,
    checkoutUrl: pixPayment.ticketUrl,
    pixQrCode: pixPayment.qrCode,
    pixQrCodeBase64: pixPayment.qrCodeBase64,
  }
  const { count } = await db.booking.updateMany({
    where: {
      id: booking.id,
      paymentStatus: { not: 'approved' },
    },
    data: {
      ...pixData,
      paymentStatus: pixPayment.status === 'approved' ? 'approved' : 'pending',
    },
  })
  const savedPayment =
    count > 0
      ? await db.booking.findUniqueOrThrow({
          where: { id: booking.id },
          select: {
            pixQrCode: true,
            pixQrCodeBase64: true,
            paymentExpiresAt: true,
          },
        })
      : await db.booking.update({
          where: { id: booking.id },
          data: pixData,
          select: {
            pixQrCode: true,
            pixQrCodeBase64: true,
            paymentExpiresAt: true,
          },
        })

  revalidatePath('/barbershops/[id]', 'page')
  revalidatePath('/bookings')
  revalidatePath('/admin')
  revalidatePath('/')

  if (!savedPayment.pixQrCode || !savedPayment.pixQrCodeBase64) {
    throw new Error('Não foi possível recuperar o QR Pix.')
  }

  return {
    bookingId: booking.id,
    qrCode: savedPayment.pixQrCode,
    qrCodeBase64: savedPayment.pixQrCodeBase64,
    expiresAt: savedPayment.paymentExpiresAt?.toISOString() ?? null,
  }
}
