import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

interface DashBoardItemProps {
  text: string
  value: number | string
}

const DashBoardItem = ({ text, value }: DashBoardItemProps) => {
  const isNumber = typeof value
  return (
    <Card className="rounded-2xl border p-4 shadow-sm">
      <CardContent className="flex justify-between px-1 py-2">
        <h3 className="text-sm font-semibold text-gray-400">{text}</h3>
        <Button>Verificar</Button>
      </CardContent>
      {isNumber != 'number' ? (
        <p className="mt-3 text-3xl font-bold">{value}/5</p>
      ) : (
        <p className="mt-3 text-3xl font-bold">{value}</p>
      )}
    </Card>
  )
}

export default DashBoardItem
