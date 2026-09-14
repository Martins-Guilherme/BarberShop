import Image from 'next/image'

import Header from './_components/header'

import { SearchIcon } from 'lucide-react'

import { Button } from './_components/ui/button'
import { Input } from './_components/ui/input'
import { Card, CardContent } from './_components/ui/card'
import { Badge } from './_components/ui/badge'
import { Avatar, AvatarImage } from './_components/ui/avatar'

import { db } from './_lib/prisma'
import BarbershopItem from './_components/barbershop-item'

export default async function Home() {
  const barbershops = await db.barbershop.findMany({})

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
        <h2 className="mt-6 mb-3 text-xl font-bold text-gray-400 uppercase">
          Agendamentos
        </h2>
        <Card className="p-0">
          <CardContent className="flex justify-between">
            {/* Esquerdo */}
            <div className="flex flex-col gap-2 py-5 pl-5">
              <Badge className="w-fit">Confirmado</Badge>
              <h3 className="font-semibold">Corte de cabelo</h3>

              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://utfs.io/f/7e309eaa-d722-465b-b8b6-76217404a3d3-16s.png" />
                </Avatar>
                <p className="text-sm">Barbearia FSW</p>
              </div>
            </div>
            {/* Direito */}
            <div className="flex flex-col items-center justify-center border-l-2 border-solid px-5 pl-6">
              <p className="text-sm">Setembro</p>
              <p className="text-2xl">19</p>
              <p className="text-sm">20:00</p>
            </div>
          </CardContent>
        </Card>

        {/* Recomendadas */}
        <h2 className="mt-6 mb-3 text-xl font-bold text-gray-400 uppercase">
          Recomendados
        </h2>
        <div className="flex gap-4 overflow-auto [&::-webkit-scrollbar]:hidden">
          {barbershops.map((barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>
      </div>
    </div>
  )
}
