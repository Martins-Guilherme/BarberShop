import Image from 'next/image'

import Header from './_components/header'

import { Button } from './_components/ui/button'
import { Input } from './_components/ui/input'

import { SearchIcon } from 'lucide-react'

export default function Home() {
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
        
      </div>
    </div>
  )
}
