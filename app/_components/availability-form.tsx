'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { saveWeeklyAvailability } from '../_actions/save-weekly-availability'
import type { WeeklyAvailabilityEntry } from '../_data/get-weekly-availability'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

const weekdays = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

interface AvailabilityFormProps {
  initialEntries: WeeklyAvailabilityEntry[]
}

export function AvailabilityForm({ initialEntries }: AvailabilityFormProps) {
  const [entries, setEntries] = useState(initialEntries)
  const [isSaving, startTransition] = useTransition()

  const updateEntry = (
    weekday: number,
    updates: Partial<WeeklyAvailabilityEntry>
  ) => {
    setEntries((currentEntries) =>
      currentEntries.map((entry) =>
        entry.weekday === weekday ? { ...entry, ...updates } : entry
      )
    )
  }

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveWeeklyAvailability(entries)
        toast.success('Disponibilidade semanal salva.')
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Não foi possível salvar a disponibilidade.'
        )
      }
    })
  }

  return (
    <section className="space-y-4 p-5">
      <div>
        <h2 className="text-xl font-semibold">Dias e horários disponíveis</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Defina um intervalo semanal recorrente. Os clientes poderão reservar
          em intervalos de 30 minutos.
        </p>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => (
          <Card key={entry.weekday}>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center justify-between gap-4 sm:w-48">
                <h3 className="font-medium">{weekdays[entry.weekday]}</h3>
                <Button
                  type="button"
                  variant={entry.isOpen ? 'default' : 'outline'}
                  size="sm"
                  aria-pressed={entry.isOpen}
                  onClick={() =>
                    updateEntry(entry.weekday, { isOpen: !entry.isOpen })
                  }
                >
                  {entry.isOpen ? 'Aberto' : 'Fechado'}
                </Button>
              </div>

              <div className="grid flex-1 grid-cols-2 gap-3 sm:max-w-sm">
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Abre</span>
                  <input
                    type="time"
                    step={1800}
                    value={entry.startTime}
                    disabled={!entry.isOpen}
                    onChange={(event) =>
                      updateEntry(entry.weekday, {
                        startTime: event.target.value,
                      })
                    }
                    className="border-input bg-background h-9 w-full rounded-md border px-2 disabled:opacity-50"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Fecha</span>
                  <input
                    type="time"
                    step={1800}
                    value={entry.endTime}
                    disabled={!entry.isOpen}
                    onChange={(event) =>
                      updateEntry(entry.weekday, {
                        endTime: event.target.value,
                      })
                    }
                    className="border-input bg-background h-9 w-full rounded-md border px-2 disabled:opacity-50"
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Salvando...' : 'Salvar disponibilidade'}
      </Button>
    </section>
  )
}
