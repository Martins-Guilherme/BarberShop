import { Barbershop } from '@prisma/client'
import { Card, CardContent } from './ui/card'
import Image from 'next/image'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { StarIcon } from 'lucide-react'

interface BarbershopItemProps {
  barbershop: Barbershop
}

const BarbershopItem = ({ barbershop }: BarbershopItemProps) => {
  return (
    <Card className="min-w-41.75 rounded-2xl">
      <CardContent className="p-0 px-1 pt-1 pb-3">
        {/* IMAGEM */}
        <div className="relative h-39.75 w-full">
          <Image
            fill
            className="rounded-2xl object-cover"
            src={barbershop.imageURL}
            alt={barbershop.name}
          />

          {/* ratting */}
          <Badge
            className="absolute top-2 left-2 space-x-1"
            variant="secondary"
          >
            <StarIcon size={12} className="fill-primary text-primary" />
            <p className="text-xs font-semibold">5,0</p>
          </Badge>
        </div>
        {/* TEXTO */}
        <div className="px-1 py-2">
          <h3 className="truncate font-semibold">{barbershop.name}</h3>
          <p className="truncate text-sm text-gray-400">{barbershop.adress}</p>
          <Button variant="secondary" className="mt-3 w-full">
            Reservar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default BarbershopItem
