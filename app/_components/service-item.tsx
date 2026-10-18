'use client'

import { isPast, isToday, set, startOfToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { Barbershop, BarbershopService } from '../_generated/prisma/client'
import type { Booking } from '../_generated/prisma/browser'
import { createBooking } from '../_actions/create-booking'
import { getBookings } from '../_actions/get-bookings'
import type { WeeklyAvailabilityEntry } from '../_data/get-weekly-availability'
import BookingSummary from './booking-summary'
import SigInDialog from './signin-dialog'
import { Button } from './ui/button'
import { Calendar } from './ui/calendar'
import { Card, CardContent } from './ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from './ui/sheet'

interface ServiceItemProps {
  service: BarbershopService
  barbershop: Pick<Barbershop, 'name'>
  weeklyAvailability: WeeklyAvailabilityEntry[]
}

interface GetTimeListProps {
  bookings: Booking[]
  selectedDay: Date
  weeklyAvailability: WeeklyAvailabilityEntry[]
}

const getTimeList = ({
  bookings,
  selectedDay,
  weeklyAvailability,
}: GetTimeListProps) => {
  const dayAvailability = weeklyAvailability.find(
    (entry) => entry.weekday === selectedDay.getDay()
  )

  if (!dayAvailability?.isOpen) return []

  const [startHour, startMinute] = dayAvailability.startTime
    .split(':')
    .map(Number)
  const [endHour, endMinute] = dayAvailability.endTime.split(':').map(Number)
  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute
  const times: string[] = []

  for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
    const hour = Math.floor(minutes / 60)
    const minute = minutes % 60
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    const timeIsOnThePast = isPast(
      set(selectedDay, { hours: hour, minutes: minute })
    )
    const hasBookingOnCurrentTime = bookings.some(
      (booking) =>
        booking.date.getHours() === hour && booking.date.getMinutes() === minute
    )

    if (isToday(selectedDay) && timeIsOnThePast) continue
    if (hasBookingOnCurrentTime) continue
    times.push(time)
  }

  return times
}

const ServiceItem = ({
  service,
  barbershop,
  weeklyAvailability,
}: ServiceItemProps) => {
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [dayBookings, setDayBookings] = useState<Booking[]>([])
  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false)
  const [bookingSheetIsOpen, setBookingSheetIsOpen] = useState(false)
  const [isCreatingBooking, setIsCreatingBooking] = useState(false)
  const [pixPayment, setPixPayment] = useState<{
    qrCode: string
    qrCodeBase64: string
    expiresAt: string | null
  }>()
  const [pixDialogIsOpen, setPixDialogIsOpen] = useState(false)
  const { data } = useSession()

  const availableWeekdays = new Set(
    weeklyAvailability
      .filter((availability) => availability.isOpen)
      .map((availability) => availability.weekday)
  )

  const handleCreateBooking = async () => {
    if (!selectedDate || isCreatingBooking) return
    setIsCreatingBooking(true)
    try {
      const payment = await createBooking({
        serviceId: service.id,
        date: selectedDate,
      })
      handleBookingSheetIsOpenChange()
      setPixPayment(payment)
      setPixDialogIsOpen(true)
      toast.success('QR Pix gerado. Conclua o pagamento em até 1 hora.')
    } catch (error) {
      console.error(error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao iniciar o pagamento. Tente novamente.'
      )
    } finally {
      setIsCreatingBooking(false)
    }
  }

  useEffect(() => {
    let isCurrent = true

    const fetchBookings = async () => {
      if (!selectedDay) return
      try {
        const bookings = await getBookings({
          date: selectedDay,
          serviceId: service.id,
        })
        if (isCurrent) setDayBookings(bookings)
      } catch (error) {
        console.error(error)
        if (isCurrent) {
          toast.error('Não foi possível carregar os horários ocupados.')
        }
      }
    }

    void fetchBookings()
    return () => {
      isCurrent = false
    }
  }, [selectedDay, service.id])

  const handleBookingSheetIsOpenChange = () => {
    setSelectedDay(undefined)
    setSelectedTime(undefined)
    setDayBookings([])
    setBookingSheetIsOpen(false)
  }

  const handleBookingClick = () => {
    if (data?.user) {
      setBookingSheetIsOpen(true)
    } else {
      setSignInDialogIsOpen(true)
    }
  }

  const timeList = useMemo(() => {
    if (!selectedDay) return []
    return getTimeList({
      bookings: dayBookings,
      selectedDay,
      weeklyAvailability,
    })
  }, [selectedDay, dayBookings, weeklyAvailability])

  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedTime) return
    return set(selectedDay, {
      hours: Number(selectedTime.split(':')[0]),
      minutes: Number(selectedTime.split(':')[1]),
      seconds: 0,
      milliseconds: 0,
    })
  }, [selectedDay, selectedTime])

  return (
    <>
      <Card>
        <CardContent className="flex items-center gap-3 p-3">
          <div className="relative h-27.5 min-h-27.5 w-27.5 max-w-27.5">
            <Image
              alt={service.name}
              src={service.imageURL}
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">{service.name}</h3>
            <p className="text-sm text-gray-400">{service.description}</p>
            <div className="flex items-center justify-between">
              <p className="text-primary text-sm font-bold">
                {Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(service.price))}
              </p>
              <Sheet
                open={bookingSheetIsOpen}
                onOpenChange={(open) => {
                  if (open) setBookingSheetIsOpen(true)
                  else handleBookingSheetIsOpenChange()
                }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBookingClick}
                >
                  Reservar
                </Button>
                <SheetContent className="px-0">
                  <SheetHeader>
                    <SheetTitle>Fazer reserva</SheetTitle>
                  </SheetHeader>
                  <div className="mx-auto w-fit border-b border-solid px-0">
                    <Calendar
                      disabled={(date) =>
                        date < startOfToday() ||
                        !availableWeekdays.has(date.getDay())
                      }
                      mode="single"
                      locale={ptBR}
                      selected={selectedDay}
                      onSelect={(date) => {
                        setSelectedDay(date)
                        setSelectedTime(undefined)
                      }}
                      className="[--cell-size:--spacing(9)] md:[--cell-size:--spacing(12)]"
                    />
                  </div>

                  {selectedDay && (
                    <div className="flex gap-3 overflow-x-auto border-b border-solid px-5 [&::-webkit-scrollbar]:hidden">
                      {timeList.length > 0 ? (
                        timeList.map((time) => (
                          <Button
                            key={time}
                            variant={
                              selectedTime === time ? 'default' : 'outline'
                            }
                            className="rounded-full"
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))
                      ) : (
                        <p className="pt-4 text-xs text-gray-400">
                          Não há horários disponíveis para este dia.
                        </p>
                      )}
                    </div>
                  )}

                  {selectedDate && (
                    <div className="p-3">
                      <BookingSummary
                        barbershop={barbershop}
                        service={service}
                        selectedDate={selectedDate}
                      />
                    </div>
                  )}

                  <SheetFooter className="px-5">
                    <p className="text-muted-foreground px-5 text-center text-xs">
                      Após confirmar, você terá 1 hora para concluir o
                      pagamento. A reserva só será confirmada pela barbearia
                      depois da aprovação.
                    </p>
                    <Button
                      type="submit"
                      disabled={
                        !selectedTime || !selectedDay || isCreatingBooking
                      }
                      onClick={handleCreateBooking}
                    >
                      {isCreatingBooking ? 'Gerando QR Pix...' : 'Gerar QR Pix'}
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={signInDialogIsOpen} onOpenChange={setSignInDialogIsOpen}>
        <DialogContent className="w-[80%]">
          <SigInDialog />
        </DialogContent>
      </Dialog>

      <Dialog open={pixDialogIsOpen} onOpenChange={setPixDialogIsOpen}>
        <DialogContent className="w-[90%] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pagamento via Pix</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code ou copie o código Pix. O pagamento deve ser
              feito em até 1 hora; depois disso, a reserva expira.
              {pixPayment?.expiresAt &&
                ` Prazo: ${new Date(pixPayment.expiresAt).toLocaleTimeString(
                  'pt-BR',
                  { hour: '2-digit', minute: '2-digit' }
                )}.`}
            </DialogDescription>
          </DialogHeader>
          <p className="text-center text-sm font-semibold">
            Valor:{' '}
            {Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(Number(service.price))}
          </p>
          {pixPayment && (
            <div className="flex flex-col items-center gap-3">
              <Image
                src={`data:image/png;base64,${pixPayment.qrCodeBase64}`}
                alt="QR Code para pagamento Pix"
                width={240}
                height={240}
                unoptimized
              />
              <p className="bg-muted w-full rounded-md p-3 text-xs break-all">
                {pixPayment.qrCode}
              </p>
              <Button
                className="w-full"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(pixPayment.qrCode)
                    toast.success('Código Pix copiado.')
                  } catch (error) {
                    console.error(error)
                    toast.error('Não foi possível copiar o código Pix.')
                  }
                }}
              >
                Copiar código Pix
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  setPixDialogIsOpen(false)
                  router.push('/bookings')
                }}
              >
                Ver meus agendamentos
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ServiceItem
