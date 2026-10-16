'use server'

import { db } from '../_lib/prisma'
import { BarberShopPageProps } from '../barbershops/[id]/page'
import { getWeeklyAvailability } from './get-weekly-availability'

export const getUniqueBarberShop = async (
  params: BarberShopPageProps['params']
) => {
  const [barbershop, weeklyAvailability] = await Promise.all([
    db.barbershop.findUnique({
      where: {
        id: params.id,
      },
      include: {
        services: true,
      },
    }),
    getWeeklyAvailability(),
  ])

  return barbershop ? { ...barbershop, weeklyAvailability } : null
}
