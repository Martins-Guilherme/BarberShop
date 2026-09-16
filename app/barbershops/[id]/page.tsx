import ServiceItem from '@/app/_components/service-item'
import { Button } from '@/app/_components/ui/button'
import { db } from '@/app/_lib/prisma'
import { ChevronLeftIcon, MapPinIcon, MenuIcon, StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface BarberShopPageProps {
  params: {
    id: string
  }
}

const BarbershopPage = async ({ params }: BarberShopPageProps) => {
  const barbershop = await db.barbershop.findUnique({
    where: {
      id: params.id,
    },
    include: {
      services: true,
    },
  })

  if (!barbershop) {
    return notFound()
  }
  return (
    <div>
      {/* IMAGEM */}
      <div className="relative h-62.5 w-full">
        {barbershop?.imageURL && (
          <Image
            alt={barbershop.name}
            src={barbershop.imageURL}
            fill
            className="object-cover"
          />
        )}
        <Button
          render={<Link href={'/'} />}
          size="icon"
          variant="outline"
          className="absolute top-4 left-4"
        >
          <ChevronLeftIcon />
        </Button>

        <Button
          size="icon"
          variant="outline"
          className="absolute top-4 right-4"
        >
          <MenuIcon />
        </Button>
      </div>
      {/* INFORMAÇÔES */}
      <div className="border-b border-solid p-5">
        <h1 className="mb-3 text-xl font-bold">{barbershop.name}</h1>
        <div className="mb-2 flex items-center gap-2">
          <MapPinIcon className="text-primary" size={18} />
          <p className="text-sm">{barbershop.adress}</p>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <StarIcon className="fill-primary text-primary" size={18} />
          <p className="text-sm">5,0 (584 avaliações)</p>
        </div>
      </div>
      {/* DESCRIÇÂO */}
      <div className="space-y-3 border-b border-solid p-5">
        <h2 className="text-xs font-bold text-gray-400 uppercase">Sobre nós</h2>
        <p className="text-justify text-sm">{barbershop.description}</p>
      </div>
      {/* SERVIÇOS */}
      <div className="p-5 space-y-3">
        <h2 className="text-xs font-bold text-gray-400 uppercase">Serviços</h2>
        <div className="space-y-3">
          {barbershop.services.map((service) => (
            <ServiceItem key={service.id} service={service} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default BarbershopPage
