'use client'

import { Card, CardContent } from './ui/card'
import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'

import { Prisma } from '../_generated/prisma/client'
import { format, isFuture } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet'
import Image from 'next/image'
import PhoneItem from './phone-item'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { toast } from 'sonner'
import { deleteBooking } from '../_actions/delet-booking'
import { useState } from 'react'

interface BookingItemProps {
  booking: Prisma.BookingGetPayload<{
    include: {
      service: {
        include: {
          barbershop: true
        }
      }
    }
  }>
}

const BookingItem = ({ booking }: BookingItemProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const isConfirmed = isFuture(booking.date)
  const {
    service: { barbershop },
  } = booking

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await deleteBooking(bookingId)
      setIsSheetOpen(false)
      toast.success('Reserva cancelada com sucesso!')
    } catch (error) {
      console.log(error)
      toast.error('Erro ao cancelar a reserva. Tente novamente mais tarde.')
    }
  }

  const handleSheetOpenChange = (isOpen: boolean) => {
    setIsSheetOpen(isOpen)
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger className="w-full">
        <Card className="w-full p-0">
          <CardContent className="flex justify-between">
            {/* Esquerdo */}
            <div className="flex flex-col gap-2 py-5 pl-2">
              <Badge
                className="w-fit"
                variant={isConfirmed ? 'default' : 'secondary'}
              >
                {isConfirmed ? 'Confirmado' : 'Finalizado'}
              </Badge>
              <h3 className="font-semibold">{booking?.service.name}</h3>

              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={booking.service.barbershop.imageURL} />
                </Avatar>
                <p className="text-sm">{booking.service.barbershop.name}</p>
              </div>
            </div>
            {/* Direito */}
            <div className="flex flex-col items-center justify-center border-l-2 border-solid px-5 pl-6">
              <p className="text-sm capitalize">
                {format(booking.date, 'MMMM', {
                  locale: ptBR,
                })}
              </p>
              <p className="text-2xl">
                {format(booking.date, 'dd', { locale: ptBR })}
              </p>
              <p className="text-sm">
                {format(booking.date, 'HH:mm', { locale: ptBR })}
              </p>
            </div>
          </CardContent>
        </Card>
      </SheetTrigger>
      <SheetContent className="px-2">
        <SheetHeader>
          <SheetTitle className="text-left">Informações da reserva</SheetTitle>
        </SheetHeader>
        <div className="relative mt-2 flex h-48 w-full items-end">
          <Image
            src="/map.png"
            fill
            className="rounded-xl object-cover"
            alt={`Mapa da barbearia ${booking.service.barbershop.name}`}
          />
          <Card className="z-50 mx-5 mb-3 w-full">
            <CardContent className="flex items-center gap-3 px-5 py-3">
              <Avatar>
                <AvatarImage src={barbershop.imageURL} />
              </Avatar>
              <div>
                <h3 className="font-bold">{barbershop.name}</h3>
                <p className="text-xs">{barbershop.adress}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Badge
            className="w-fit"
            variant={isConfirmed ? 'default' : 'secondary'}
          >
            {isConfirmed ? 'Confirmado' : 'Finalizado'}
          </Badge>

          <Card className="mt-3 mb-6">
            <CardContent className="space-y-2 p-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm">{booking.service.name}</h2>
                <p className="text-sm">
                  {Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(Number(booking.service.price))}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-sm text-gray-400">Data</h2>
                <p className="text-sm">
                  {format(booking.date, "d 'de' MMMM", {
                    locale: ptBR,
                  })}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-sm text-gray-400">Horário</h2>
                <p className="text-sm">
                  {format(booking.date, 'HH:mm', {
                    locale: ptBR,
                  })}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-sm text-gray-400">Barberaria</h2>
                <p className="text-sm">{barbershop.name}</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {barbershop.phones.map((phone, index) => (
              <PhoneItem key={index} phone={phone} />
            ))}
          </div>
        </div>

        <SheetFooter className="mt-6 w-full">
          <div className="flex w-full flex-col gap-3">
            <SheetClose
              render={
                <Button className="w-full" variant="outline">
                  Voltar
                </Button>
              }
            ></SheetClose>
            {isConfirmed && (
              <Dialog>
                <DialogTrigger>
                  <Button className="w-full" variant="destructive">
                    Cancelar Reserva
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-full">
                  <DialogHeader>
                    <DialogTitle>
                      Você deseja cancelar a sua reserva?
                    </DialogTitle>
                    <DialogDescription>
                      Ao cancelar, você perderá sua reserva e não poderá
                      recuperá-la.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-row items-center justify-center gap-3">
                    <DialogClose className="w-full">
                      <Button variant="secondary" className="w-full">
                        Voltar
                      </Button>
                    </DialogClose>
                    <DialogClose className="w-full">
                      <Button
                        className="w-full"
                        variant="destructive"
                        onClick={() => handleDeleteBooking(booking.id)}
                      >
                        confirmar
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default BookingItem
