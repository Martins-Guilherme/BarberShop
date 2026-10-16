'use client'

import { addDays, format, isSameDay, startOfToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'
import { toast } from 'sonner'

import { confirmPendingBooking } from '../_actions/confirm-pending-booking'
import BookingSummary from '../_components/booking-summary'
import { Button } from '../_components/ui/button'
import { Calendar } from '../_components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../_components/ui/dialog'

interface PendingBookingPreviewItem {
  id: string
  date: Date
  user: { name: string | null }
  service: {
    name: string
    price: number
    barbershop: { name: string }
  }
}

interface PendingBookingsPreviewProps {
  bookings: PendingBookingPreviewItem[]
}

export function PendingBookingsPreview({
  bookings,
}: PendingBookingsPreviewProps) {
  const today = startOfToday()
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [confirmingBookingId, setConfirmingBookingId] = useState<string | null>(
    null
  )
  const selectedBookings = bookings.filter((booking) =>
    isSameDay(booking.date, selectedDate)
  )
  const bookedDates = bookings.map((booking) => booking.date)

  const handleConfirm = (bookingId: string) => {
    setConfirmingBookingId(bookingId)
    void confirmPendingBooking(bookingId)
      .then(() => {
        toast.success('Agendamento confirmado.')
      })
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Não foi possível confirmar o agendamento.'
        )
      })
      .finally(() => setConfirmingBookingId(null))
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="default" size="lg">
            Verificar
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] w-[80%] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agendamentos pendentes</DialogTitle>
          <DialogDescription>
            Consulte os agendamentos de hoje até os próximos sete dias e
            confirme as reservas.
          </DialogDescription>
        </DialogHeader>

        <div className="no-scrollbar -mx-4 grid max-h-[50vh] justify-center gap-5 overflow-y-auto md:grid-cols-[auto_1fr]">
          <Calendar
            mode="single"
            locale={ptBR}
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            disabled={[{ before: today }, { after: addDays(today, 7) }]}
            modifiers={{ hasBookings: bookedDates }}
            modifiersClassNames={{
              hasBookings: 'font-bold underline decoration-primary',
            }}
          />

          <section className="space-y-3">
            <h3 className="font-semibold">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h3>

            {selectedBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Não há reservas pendentes nesta data.
              </p>
            ) : (
              selectedBookings.map((booking) => (
                <article
                  key={booking.id}
                  className="space-y-2 rounded-lg border p-3"
                >
                  <p className="text-sm font-medium">
                    Cliente: {booking.user.name ?? 'Usuário'}
                  </p>
                  <BookingSummary
                    service={booking.service}
                    barbershop={booking.service.barbershop}
                    selectedDate={booking.date}
                  />
                  <Button
                    className="w-full"
                    disabled={confirmingBookingId !== null}
                    onClick={() => handleConfirm(booking.id)}
                  >
                    {confirmingBookingId === booking.id
                      ? 'Confirmando...'
                      : 'Confirmar agendamento'}
                  </Button>
                </article>
              ))
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
