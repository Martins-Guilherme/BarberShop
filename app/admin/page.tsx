import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { authOptions } from '../_lib/auth'
import { getAdminDashboard } from '../_data/get-admin-dashboard'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const {
    totalBookings,
    confirmedBookings,
    completedBookings,
    averageRating,
    recentBookings,
  } = await getAdminDashboard()

  return (
    <main className="p-6">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm font-medium tracking-[0.18em] uppercase">
          Painel administrativo
        </p>
        <h1 className="mt-2 text-3xl font-bold">Dashboard</h1>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <p className="text-muted-foreground text-sm">Total de agendamentos</p>
          <p className="mt-3 text-3xl font-bold">{totalBookings}</p>
        </div>

        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <p className="text-muted-foreground text-sm">Confirmados</p>
          <p className="mt-3 text-3xl font-bold">{confirmedBookings}</p>
        </div>

        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <p className="text-muted-foreground text-sm">Finalizados</p>
          <p className="mt-3 text-3xl font-bold">{completedBookings}</p>
        </div>

        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <p className="text-muted-foreground text-sm">Avaliação média</p>
          <p className="mt-3 text-3xl font-bold">
            {averageRating.toFixed(1)}/5
          </p>
        </div>
      </section>

      <section className="bg-card mt-8 rounded-xl border p-4 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Últimos agendamentos</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-muted-foreground border-b text-sm">
                <th className="pr-4 pb-3">Cliente</th>
                <th className="pr-4 pb-3">Serviço</th>
                <th className="pr-4 pb-3">Barbearia</th>
                <th className="pr-4 pb-3">Data</th>
                <th className="pr-4 pb-3">Avaliação</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="border-b last:border-0">
                  <td className="py-3 pr-4">
                    {booking.user.name ?? 'Usuário'}
                  </td>
                  <td className="py-3 pr-4">{booking.service.name}</td>
                  <td className="py-3 pr-4">
                    {booking.service.barbershop.name}
                  </td>
                  <td className="py-3 pr-4">
                    {format(new Date(booking.date), "dd 'de' MMMM", {
                      locale: ptBR,
                    })}
                  </td>
                  <td className="py-3 pr-4">
                    {booking.review
                      ? `${booking.review.rating}/5`
                      : 'Sem avaliação'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
