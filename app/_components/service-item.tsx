import { BarbershopService } from '@prisma/client'
import Image from 'next/image'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

interface ServiceItemProps {
  service: BarbershopService
}

const ServiceItem = ({ service }: ServiceItemProps) => {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        {/* IMAGE */}
        <div className="relative h-27.5 min-h-27.5 w-27.5 max-w-27.5">
          <Image
            alt={service.name}
            src={service.imageURL}
            fill
            className="rounded-lg object-cover"
          />
        </div>
        {/* DIREITA */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{service.name}</h3>
          <p className="text-sm text-gray-400">{service.description}</p>
          {/* PREÇO E BOTÃO */}
          <div className="flex items-center justify-between">
            <p className="text-primary text-sm font-bold">
              {Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(Number(service.price))}
            </p>
            <Button variant="secondary" size="sm">
              Reservar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ServiceItem
