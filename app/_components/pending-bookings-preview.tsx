'use client'

import { addDays, format, isSameDay, startOfToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { confirmPendingBooking } from '../_actions/confirm-pending-booking'
import { refreshPendingBookingsPreview } from '../_actions/get-pending-bookings-preview'
import type { PendingBookingPreviewItem } from '../_types/pending-booking-preview'
import BookingSummary from './booking-summary'
import { Button } from './ui/button'
import { Calendar } from './ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'

interface PendingBookingsPreviewProps {
  bookings: PendingBookingPreviewItem[]
}

export function PendingBookingsPreview({
  bookings,
}: PendingBookingsPreviewProps) {
  const today = startOfToday()
  const [isOpen, setIsOpen] = useState(false)
  const [currentBookings, setCurrentBookings] = useState(bookings)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [confirmingBookingId, setConfirmingBookingId] = useState<string | null>(
    null
  )
  const selectedBookings = currentBookings.filter((booking) =>
    isSameDay(booking.date, selectedDate)
  )
  const bookedDates = currentBookings.map((booking) => booking.date)

  useEffect(() => {
    if (!isOpen) return

    let isActive = true
    let isRefreshing = false

    const refreshBookings = async () => {
      if (isRefreshing || document.visibilityState !== 'visible') return
      isRefreshing = true

      try {
        const updatedBookings = await refreshPendingBookingsPreview()
        if (isActive) {
          setCurrentBookings(updatedBookings)
          setRefreshError(null)
        }
      } catch (error) {
        console.error('Falha ao atualizar as reservas pendentes:', error)
        if (isActive) {
          setRefreshError(
            'Não foi possível atualizar as reservas. Tentaremos novamente.'
          )
        }
      } finally {
        isRefreshing = false
      }
    }

    const intervalId = window.setInterval(() => {
      void refreshBookings()
    }, 30_000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshBookings()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    void refreshBookings()

    return () => {
      isActive = false
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isOpen])

  const handleConfirm = (bookingId: string) => {
    setConfirmingBookingId(bookingId)
    void confirmPendingBooking(bookingId)
      .then(() => {
        setCurrentBookings((current) =>
          current.filter((booking) => booking.id !== bookingId)
        )
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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

        {refreshError && (
          <p role="status" className="text-destructive text-sm">
            {refreshError}
          </p>
        )}

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
