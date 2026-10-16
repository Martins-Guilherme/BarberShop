'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'

import { authOptions } from '../_lib/auth'
import { db } from '../_lib/prisma'
import type { WeeklyAvailabilityEntry } from '../_data/get-weekly-availability'

const isValidTime = (time: string) => /^([01]\d|2[0-3]):(00|30)$/.test(time)

export const saveWeeklyAvailability = async (
  entries: WeeklyAvailabilityEntry[]
) => {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Você não tem permissão para alterar a disponibilidade.')
  }

  if (!Array.isArray(entries) || entries.length !== 7) {
    throw new Error('A disponibilidade precisa conter os sete dias da semana.')
  }

  if (
    entries.some(
      (entry) =>
        !entry ||
        typeof entry !== 'object' ||
        !Number.isInteger(entry.weekday) ||
        entry.weekday < 0 ||
        entry.weekday > 6 ||
        typeof entry.isOpen !== 'boolean' ||
        typeof entry.startTime !== 'string' ||
        typeof entry.endTime !== 'string'
    ) ||
    new Set(entries.map((entry) => entry.weekday)).size !== 7
  ) {
    throw new Error(
      'A disponibilidade enviada contém dias ou horários inválidos.'
    )
  }

  for (const entry of entries) {
    if (
      !isValidTime(entry.startTime) ||
      !isValidTime(entry.endTime) ||
      entry.startTime >= entry.endTime
    ) {
      throw new Error(
        'Informe horários válidos em intervalos de 30 minutos, com abertura anterior ao fechamento.'
      )
    }
  }

  await db.$transaction(
    entries.map((entry) =>
      db.weeklyAvailability.upsert({
        where: { weekday: entry.weekday },
        create: entry,
        update: {
          isOpen: entry.isOpen,
          startTime: entry.startTime,
          endTime: entry.endTime,
        },
      })
    )
  )

  revalidatePath('/admin/availability')
  revalidatePath('/barbershops/[id]', 'page')
}
