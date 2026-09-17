import Image from 'next/image'

import Header from './_components/header'

import { SearchIcon } from 'lucide-react'

import { Button } from './_components/ui/button'
import { Input } from './_components/ui/input'

import { db } from './_lib/prisma'
import BarbershopItem from './_components/barbershop-item'
import { quickSearchOptinons } from './_constants/search'
import BookingItem from './_components/booking-item'

export default async function Home() {
  const barbershops = await db.barbershop.findMany({})
  const popularBarbeshop = await db.barbershop.findMany({
    orderBy: {
      name: 'desc',
    },
  })
  return (
    <div>
      {/*  header  */}
      <Header />
      <div className="p-5">
        {/* Apressentação */}
        <h2 className="text-xl font-bold">Olá, Guilherme</h2>
        <p>Segunda-feira, 12 de setembro de 2026.</p>
        {/* Busca */}
        <div className="mt-6 flex items-center gap-2">
          <Input placeholder="Faça sua busca..." />
          <Button>
            <SearchIcon />
          </Button>
        </div>
        {/* Busca rápida */}
        {/*  */}
        <div className="mt-6 flex gap-3 overflow-x-scroll [&::-webkit-scrollbar]:hidden">
          {quickSearchOptinons.map((option) => (
            <Button className="gap-2" variant="secondary" key={option.title}>
              <Image
                className="gap-2"
                src={option.imageURL}
                width={16}
                height={16}
                alt={option.title}
              />
              {option.title}
            </Button>
          ))}
        </div>
        {/* Banner */}
        <div className="relative mt-6 h-37.5 w-full">
          <Image
            alt="Agende nos melhores com FSW Barber"
            src="/banner-01.png"
            fill
            className="rounded-xl object-cover"
          />
        </div>
        {/* Agendamento */}
        <BookingItem />

        {/* Recomendadas */}
        <h2 className="mt-6 mb-3 text-xl font-bold text-gray-400 uppercase">
          Recomendados
        </h2>
        <div className="flex gap-4 overflow-auto [&::-webkit-scrollbar]:hidden">
          {barbershops.map((barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>

        {/*  POPULAR */}
        <h2 className="mt-6 mb-3 text-xl font-bold text-gray-400 uppercase">
          Populares
        </h2>
        <div className="flex gap-4 overflow-auto [&::-webkit-scrollbar]:hidden">
          {popularBarbeshop.map((barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>
      </div>
    </div>
  )
}
