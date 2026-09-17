'use client'

import { Button } from '@/app/_components/ui/button'

import { SmartphoneIcon } from 'lucide-react'
import { toast } from 'sonner'

interface PhoneItemProps {
  phone: string
}

const PhoneItem = ({ phone }: PhoneItemProps) => {
  // COPIAR NUMERO
  const handleCopyPhoneClick = (phones: string) => {
    navigator.clipboard.writeText(phones)
    toast.success("Telefone copiado com sucesso!")
  }
  return (
    <div className="space-y-3 p-5">
      <div className="flex justify-between" key={phone}>
        {/* ESQUERDA */}
        <div className="flex items-center gap-2">
          <SmartphoneIcon />
          <p className="text-sm">{phone}</p>
        </div>
        {/* DIREITA */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCopyPhoneClick(phone)}
        >
          Copiar
        </Button>
      </div>
    </div>
  )
}

export default PhoneItem
