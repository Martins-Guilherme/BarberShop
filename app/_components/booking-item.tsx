import { Card, CardContent } from './ui/card'
import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'

// TODO: Receber agendamentos como props

const BookingItem = () => {
  return (
    <>
      <h2 className="mt-6 mb-3 text-xl font-bold text-gray-400 uppercase">
        Agendamentos
      </h2>
      <Card className="p-0">
        <CardContent className="flex justify-between">
          {/* Esquerdo */}
          <div className="flex flex-col gap-2 py-5 pl-5">
            <Badge className="w-fit">Confirmado</Badge>
            <h3 className="font-semibold">Corte de cabelo</h3>

            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="https://utfs.io/f/7e309eaa-d722-465b-b8b6-76217404a3d3-16s.png" />
              </Avatar>
              <p className="text-sm">Barbearia FSW</p>
            </div>
          </div>
          {/* Direito */}
          <div className="flex flex-col items-center justify-center border-l-2 border-solid px-5 pl-6">
            <p className="text-sm">Setembro</p>
            <p className="text-2xl">19</p>
            <p className="text-sm">20:00</p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default BookingItem
