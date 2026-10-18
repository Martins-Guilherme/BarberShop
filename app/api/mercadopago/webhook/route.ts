import { NextResponse } from 'next/server'

import {
  getMercadoPagoPayment,
  isValidMercadoPagoWebhookSignature,
  refundMercadoPagoPayment,
} from '../../../_lib/mercado-pago'
import { db } from '../../../_lib/prisma'

interface MercadoPagoWebhookBody {
  type?: unknown
  topic?: unknown
  data?: { id?: unknown }
}

const getPaymentId = (request: Request, body: MercadoPagoWebhookBody) => {
  const queryId = new URL(request.url).searchParams.get('data.id')
  const bodyId = body.data?.id
  if (queryId) return queryId
  if (typeof bodyId === 'string' || typeof bodyId === 'number') {
    return String(bodyId)
  }
}

export async function POST(request: Request) {
  let body: MercadoPagoWebhookBody
  try {
    const parsedBody: unknown = await request.json()
    if (typeof parsedBody !== 'object' || parsedBody === null) {
      return NextResponse.json(
        { error: 'Invalid webhook body.' },
        { status: 400 }
      )
    }
    body = parsedBody as MercadoPagoWebhookBody
  } catch {
    return NextResponse.json(
      { error: 'Invalid webhook body.' },
      { status: 400 }
    )
  }

  const notificationType =
    new URL(request.url).searchParams.get('type') ??
    (typeof body.type === 'string' ? body.type : body.topic)
  if (notificationType !== 'payment') {
    return NextResponse.json({ received: true })
  }

  const paymentId = getPaymentId(request, body)
  const requestId = request.headers.get('x-request-id')
  const signature = request.headers.get('x-signature')
  if (!paymentId || !requestId || !signature) {
    return NextResponse.json(
      { error: 'Missing webhook signature data.' },
      { status: 400 }
    )
  }

  if (
    !isValidMercadoPagoWebhookSignature({
      paymentId,
      requestId,
      signature,
    })
  ) {
    return NextResponse.json(
      { error: 'Invalid webhook signature.' },
      { status: 401 }
    )
  }

  const payment = await getMercadoPagoPayment(paymentId)
  if (!payment.external_reference) {
    return NextResponse.json({ received: true })
  }

  const booking = await db.booking.findUnique({
    where: { id: payment.external_reference },
    select: {
      id: true,
      date: true,
      status: true,
      paymentStatus: true,
      paymentAmount: true,
      paymentExpiresAt: true,
      mercadoPagoPaymentId: true,
    },
  })
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
  }
  if (
    booking.mercadoPagoPaymentId &&
    booking.mercadoPagoPaymentId !== payment.id
  ) {
    return NextResponse.json(
      { error: 'Payment does not match the booking.' },
      { status: 409 }
    )
  }

  if (
    payment.currency_id !== 'BRL' ||
    payment.transaction_amount.toFixed(2) !==
      Number(booking.paymentAmount).toFixed(2)
  ) {
    return NextResponse.json(
      { error: 'Payment details do not match.' },
      { status: 422 }
    )
  }

  if (payment.status === 'approved') {
    if (!payment.date_approved) {
      return NextResponse.json(
        { error: 'Approved payment is missing its approval date.' },
        { status: 422 }
      )
    }

    const approvedAt = new Date(payment.date_approved)
    if (!Number.isFinite(approvedAt.getTime())) {
      return NextResponse.json(
        { error: 'Approved payment has an invalid approval date.' },
        { status: 422 }
      )
    }
    if (booking.paymentStatus === 'refunded') {
      return NextResponse.json({ received: true })
    }

    const wasPaidBeforeExpiry =
      !booking.paymentExpiresAt || approvedAt <= booking.paymentExpiresAt
    const isAppointmentInFuture = booking.date > new Date()
    const isWithinPaymentWindow = wasPaidBeforeExpiry && isAppointmentInFuture

    if (
      booking.status === 'cancel' &&
      booking.paymentStatus === 'expired' &&
      isWithinPaymentWindow
    ) {
      const conflictingBooking = await db.booking.findFirst({
        where: {
          id: { not: booking.id },
          date: booking.date,
          status: { not: 'cancel' },
        },
        select: { id: true },
      })

      if (!conflictingBooking) {
        const { count } = await db.booking.updateMany({
          where: {
            id: booking.id,
            status: 'cancel',
            paymentStatus: 'expired',
          },
          data: {
            status: 'pending',
            paymentStatus: 'approved',
            mercadoPagoPaymentId: payment.id,
          },
        })
        if (count > 0) return NextResponse.json({ received: true })
      }
    } else if (booking.status === 'pending' && isWithinPaymentWindow) {
      const { count } = await db.booking.updateMany({
        where: {
          id: booking.id,
          status: 'pending',
          paymentStatus: { not: 'approved' },
        },
        data: {
          paymentStatus: 'approved',
          mercadoPagoPaymentId: payment.id,
        },
      })
      if (count > 0) return NextResponse.json({ received: true })
    }

    const currentBooking = await db.booking.findUnique({
      where: { id: booking.id },
      select: { status: true, paymentStatus: true },
    })
    if (
      currentBooking?.status === 'pending' &&
      currentBooking.paymentStatus !== 'approved'
    ) {
      await db.booking.updateMany({
        where: {
          id: booking.id,
          status: 'pending',
          paymentStatus: { not: 'approved' },
        },
        data: {
          status: 'cancel',
          paymentStatus: 'approved',
          mercadoPagoPaymentId: payment.id,
        },
      })
    }

    const bookingToRefund = await db.booking.findUnique({
      where: { id: booking.id },
      select: { status: true, paymentStatus: true },
    })
    if (
      bookingToRefund?.status === 'cancel' &&
      bookingToRefund.paymentStatus !== 'refunded'
    ) {
      await refundMercadoPagoPayment({
        paymentId: payment.id,
        bookingId: booking.id,
      })
      await db.booking.updateMany({
        where: {
          id: booking.id,
          status: 'cancel',
          paymentStatus: { not: 'refunded' },
        },
        data: {
          paymentStatus: 'refunded',
          mercadoPagoPaymentId: payment.id,
        },
      })
    }
  } else if (payment.status === 'rejected') {
    await db.booking.updateMany({
      where: {
        id: booking.id,
        status: 'pending',
        paymentStatus: { not: 'approved' },
      },
      data: {
        paymentStatus: 'rejected',
        mercadoPagoPaymentId: payment.id,
      },
    })
  } else if (payment.status === 'refunded') {
    await db.booking.updateMany({
      where: {
        id: booking.id,
        status: { in: ['pending', 'confirmed', 'cancel'] },
        paymentStatus: { not: 'refunded' },
      },
      data: {
        status: 'cancel',
        paymentStatus: 'refunded',
        mercadoPagoPaymentId: payment.id,
      },
    })
  }

  return NextResponse.json({ received: true })
}
