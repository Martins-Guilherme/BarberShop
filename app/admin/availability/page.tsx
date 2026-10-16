import { getWeeklyAvailability } from '../../_data/get-weekly-availability'
import { AvailabilityForm } from '../availability-form'

export default async function AvailabilityPage() {
  const availability = await getWeeklyAvailability()

  return (
    <main className="space-y-2 p-5">
      <div>
        <p className="text-muted-foreground font-medium tracking-[0.18em] uppercase">
          Painel administrativo
        </p>
        <h1 className="mt-2 text-3xl font-bold">Disponibilidade</h1>
      </div>
      <AvailabilityForm initialEntries={availability} />
    </main>
  )
}
