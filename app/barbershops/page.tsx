import BarbershopItem from '../_components/barbershop-item'
import Header from '../_components/header'
import Search from '../_components/search'
import { db } from '../_lib/prisma'

interface BarberShopsPageProps {
  searchParams: {
    search?: string
  }
}

const BarberShopsPage = async ({ searchParams }: BarberShopsPageProps) => {
  const barberShop = await db.barbershop.findMany({
    where: {
      name: {
        contains: searchParams?.search,
        mode: 'insensitive',
      },
    },
  })

  return (
    <div>
      <Header />
      <div className="my-6 px-5">
        <Search />
      </div>
      <div className='px-5'>
        <h2 className="mt-6 mb-3 text-xl font-bold text-gray-400 uppercase">
          Resultados para &quot;{searchParams?.search}&quot;
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {barberShop.map((barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default BarberShopsPage
