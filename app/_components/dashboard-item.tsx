import type { ReactNode } from 'react'

import { Card, CardContent } from './ui/card'

interface DashBoardItemProps {
  text: string
  value: number | string
  action?: ReactNode
}

const DashBoardItem = ({ text, value, action }: DashBoardItemProps) => {
  return (
    <Card className="rounded-2xl border p-4 shadow-sm">
      <CardContent className="flex justify-between px-1 py-2">
        <h3 className="text-sm font-semibold text-gray-400">{text}</h3>
        <div className="relative">
          <div className="absolute top-8 right-5">{action}</div>
        </div>
      </CardContent>
      <p className="mt-3 text-3xl font-bold">
        {value}
        {typeof value === 'string' ? '/5' : null}
      </p>
    </Card>
  )
}

export default DashBoardItem
