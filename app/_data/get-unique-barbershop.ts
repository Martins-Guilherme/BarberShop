'use server'

import { db } from '../_lib/prisma'
import { BarberShopPageProps } from '../barbershops/[id]/page'

export const getUniqueBarberShop = async (
  params: BarberShopPageProps['params']
) => {
  return db.barbershop.findUnique({
    where: {
      id: params.id,
    },
    include: {
      services: true,
    },
  })
}
