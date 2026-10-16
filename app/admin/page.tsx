import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import { authOptions } from '../_lib/auth'
import { getAdminDashboard } from '../_data/get-admin-dashboard'
import DashBoardItem from '../_components/dashboard-item'
import { BookingsDataTable } from './bookings-data-table'
import { PendingBookingsPreview } from './pending-bookings-preview'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const {
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    averageRating,
    recentBookings,
    pendingBookingsForWeek,
  } = await getAdminDashboard()

  return (
    <main>
      <div className="space-y-2 p-5">
        <p className="text-muted-foreground font-medium tracking-[0.18em] uppercase">
          Painel administrativo
        </p>
        <h1 className="mt-2 text-3xl font-bold">Dashboard</h1>
      </div>

      <section className="space-y-4 p-5">
        <DashBoardItem value={totalBookings} text="Total de agendamentos" />
        <DashBoardItem
          value={pendingBookings}
          text="Agendamentos pendentes"
          action={<PendingBookingsPreview bookings={pendingBookingsForWeek} />}
        />
        <DashBoardItem value={confirmedBookings} text="Confirmados" />
        <DashBoardItem value={completedBookings} text="Finalizados" />
        <DashBoardItem
          value={averageRating.toFixed(1)}
          text="Avaliação média"
        />
      </section>

      <section className="bg-card mt-8 rounded-xl border p-4 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Últimos agendamentos</h2>

        <BookingsDataTable
          bookings={recentBookings.map((booking) => ({
            id: booking.id,
            user: { name: booking.user.name },
            service: {
              name: booking.service.name,
              barbershop: { name: booking.service.barbershop.name },
            },
            date: booking.date,
            status: booking.status,
            review: booking.review ? { rating: booking.review.rating } : null,
          }))}
        />
      </section>
    </main>
  )
}
