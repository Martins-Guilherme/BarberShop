'use server'

import { getServerSession } from 'next-auth'

import { authOptions } from '../_lib/auth'
import { getPendingBookingsForPreview } from '../_data/get-pending-bookings-preview'

export const refreshPendingBookingsPreview = async () => {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Você não tem permissão para visualizar os agendamentos.')
  }

  return getPendingBookingsForPreview()
}
