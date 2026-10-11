'use client'

import { useRef, useState } from 'react'

import { Star } from 'lucide-react'

import { Button } from './ui/button'
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { UptoDateReview } from '../_actions/uptodate-review'
import Image from 'next/image'
import { toast } from 'sonner'

interface UpdateScoreReviewProps {
  barbershop: string
  bookingId: string
}
type Status = 'idle' | 'submitting' | 'success'

const UpdateScoreReview = ({
  barbershop,
  bookingId,
}: UpdateScoreReviewProps) => {
  const [rating, setRating] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const submittingRef = useRef(false)
  const score = [1, 2, 3, 4, 5]

  const handleSubmitReview = async (bookingId: string, rating: number) => {
    if (submittingRef.current) return
    if (rating <= 0 || rating > 5) return

    submittingRef.current = true
    setStatus('submitting')

    try {
      const result = await UptoDateReview({ bookingId, rating })

      if (!result.success) {
        toast.error(result.error)
        setStatus('idle')
        return
      }

      setStatus('success')
    } catch (err) {
      console.error(err)
      toast.error('Não foi possível enviar sua avaliação. Tente novamente.')
      setStatus('idle')
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <>
      {status !== 'success' ? (
        <>
          <DialogHeader className="w-full items-center pt-1">
            <DialogTitle className="pb-2 text-center text-base font-bold">
              Avalie sua experiência
            </DialogTitle>
            <DialogDescription className="max-w-[80%] text-center text-sm font-normal">
              Toque nas estrelas para avaliar sua experiência na {barbershop}
            </DialogDescription>
            <DialogDescription className="flex items-center justify-center space-x-5 p-5">
              {score.map((star) => (
                <Button
                  className="w-fit"
                  key={star}
                  variant="ghost"
                  size="icon"
                  type="button"
                  disabled={status === 'submitting'}
                  onClick={() => setRating(star)}
                  render={
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? 'fill-primary text-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                  }
                ></Button>
              ))}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row items-center justify-center gap-3">
            <div className="w-full">
              {rating ? (
                <Button
                  disabled={status === 'submitting'}
                  className="w-full"
                  onClick={() => handleSubmitReview(bookingId, rating)}
                  type="button"
                >
                  {status === 'submitting' ? 'Enviando...' : 'Confirmar'}
                </Button>
              ) : (
                <DialogClose
                  render={
                    <Button variant="secondary" className="w-full">
                      Voltar
                    </Button>
                  }
                />
              )}
            </div>
          </DialogFooter>
        </>
      ) : (
        <DialogHeader className="w-full items-center justify-center">
          <div className="p-5">
            <Image
              src="/check-circle.svg"
              width={72}
              height={72}
              alt={barbershop}
            />
          </div>
          <DialogTitle className="text-base font-bold capitalize">
            avaliação efetuada
          </DialogTitle>
          <p className="pt-2 pb-5 text-center text-sm text-gray-400">
            Sua avaliação foi efetuada com sucesso
          </p>
          <DialogClose
            render={
              <Button className="w-full px-5" type="button">
                Fechar
              </Button>
            }
          />
        </DialogHeader>
      )}
    </>
  )
}

export default UpdateScoreReview
