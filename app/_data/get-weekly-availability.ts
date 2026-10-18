'use server'

import { db } from '../_lib/prisma'

export type WeeklyAvailabilityEntry = {
  weekday: number
  isOpen: boolean
  startTime: string
  endTime: string
}

export const getWeeklyAvailability = async (): Promise<
  WeeklyAvailabilityEntry[]
> => {
  const entries = await db.weeklyAvailability.findMany({
    orderBy: { weekday: 'asc' },
  })

  return Array.from({ length: 7 }, (_, weekday) => {
    const entry = entries.find(
      (availability) => availability.weekday === weekday
    )

    return (
      entry ?? {
        weekday,
        isOpen: false,
        startTime: '08:00',
        endTime: '18:00',
      }
    )
  })
}
