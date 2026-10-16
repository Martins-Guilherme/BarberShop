'use server'

import { revalidatePath } from 'next/cache'
import { getDay, isValid } from 'date-fns'
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

  if (!isValid(params.date) || params.date <= new Date()) {
    throw new Error('Selecione uma data e horário futuros.')
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

  await db.booking.create({
    data: { ...params, userId: session.user.id, status: 'pending' },
  })
  revalidatePath('/barbershops/[id]', 'page')
  revalidatePath('/bookings')
  revalidatePath('/admin')
  revalidatePath('/')
}
