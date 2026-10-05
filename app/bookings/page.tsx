import { getServerSession } from 'next-auth'
import Header from '../_components/header'
import { authOptions } from '../_lib/auth'
import { notFound } from 'next/navigation'
import { db } from '../_lib/prisma'
import BookingItem from '../_components/booking-item'

const Bookings = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return notFound()
  }

  const concludeBookings = await db.booking.findMany({
    where: {
      userId: (session.user as any).id,
      date: {
        lt: new Date(),
      },
    },
    include: {
      service: {
        include: {
          barbershop: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  })
  const confirmedBookings = await db.booking.findMany({
    where: {
      userId: (session.user as any).id,
      date: {
        gte: new Date(),
      },
    },
    include: {
      service: {
        include: {
          barbershop: true,
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  })

  return (
    <>
      <Header />
      <div className="space-y-2 p-5">
        <h1 className="text-xl font-bold">Agendamentos</h1>
        {confirmedBookings.length > 0 ? (
          <h2 className="mt-6 mb-3 text-xs font-bold text-gray-400 uppercase">
            Confirmados
          </h2>
        ) : (
          []
        )}
        <div className="space-y-3">
          {confirmedBookings.map((booking) => (
            <BookingItem
              key={booking.service.id}
              booking={JSON.parse(JSON.stringify(booking))}
            />
          ))}
        </div>
        {concludeBookings.length > 0 ? (
          <h2 className="mt-6 mb-3 text-xs font-bold text-gray-400 uppercase">
            Finalizados
          </h2>
        ) : (
          []
        )}
        <div className="space-y-3">
          {concludeBookings.map((booking) => (
            <BookingItem
              key={booking.service.id}
              booking={JSON.parse(JSON.stringify(booking))}
            />
          ))}
        </div>
      </div>
    </>
  )
}

export default Bookings
