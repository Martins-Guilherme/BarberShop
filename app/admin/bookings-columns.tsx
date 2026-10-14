'use client'

import { createColumnHelper } from '@tanstack/react-table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import type { BookingStatus } from '../_generated/prisma/client'
import type { DataTableFeatures } from '../_components/data-table-features'

export type AdminBooking = {
  id: string
  user: { name: string | null }
  service: { name: string; barbershop: { name: string } }
  date: Date
  status: BookingStatus
  review: { rating: number } | null
}

const statusLabels: Record<BookingStatus, string> = {
  pending: 'Pendente',
  finalized: 'Finalizado',
  confirmed: 'Confirmado',
  cancel: 'Cancelado',
}

const columnHelper = createColumnHelper<DataTableFeatures, AdminBooking>()

export const bookingColumns = columnHelper.columns([
  columnHelper.accessor((booking) => booking.user.name ?? 'Usuário', {
    id: 'client',
    header: 'Cliente',
  }),
  columnHelper.accessor((booking) => booking.service.name, {
    id: 'service',
    header: 'Serviço',
  }),
  columnHelper.accessor((booking) => booking.service.barbershop.name, {
    id: 'barbershop',
    header: 'Barbearia',
  }),
  columnHelper.accessor('date', {
    header: 'Data',
    cell: ({ getValue }) =>
      format(getValue(), "dd 'de' MMMM", { locale: ptBR }),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => statusLabels[getValue()],
  }),
  columnHelper.accessor(
    (booking) =>
      booking.review ? `${booking.review.rating}/5` : 'Sem avaliação',
    {
      id: 'rating',
      header: 'Avaliação',
    }
  ),
])
