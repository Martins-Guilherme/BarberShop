'use client'

import { useState } from 'react'

import { Star } from 'lucide-react'

import { Button } from './ui/button'
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { toast } from 'sonner'

interface UpdateScoreReviewProps {
  barbershop: string
  bookingId: string
}

const UpdateScoreReview = ({
  barbershop,
  bookingId,
}: UpdateScoreReviewProps) => {
  const [rating, setRating] = useState(0)
  const [status, setStatus] = useState(false)
  const score = [1, 2, 3, 4, 5]

  const handleSubmitReview = async (bookingId: string, rating: number) => {
    try {
      if (rating <= 0) return
      toast.success('Em processo de atualização.')
      console.log({ bookingId, rating })
      setStatus(true)
    } catch (err) {
      console.error(err)
    }
  }

  const selectedReviewStar = (star: number) => {
    setRating(star)
  }
  return (
    <>
      {!status ? (
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
                  onClick={() => selectedReviewStar(star)}
                  render={
                    <Star
                      key={star}
                      className={`h-8 w-8 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  }
                ></Button>
              ))}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row items-center justify-center gap-3">
            <DialogClose className="w-full">
              <Button variant="secondary" className="w-full">
                Voltar
              </Button>
            </DialogClose>
            <DialogClose className="w-full">
              {rating ? (
                <>
                  <Button
                    disabled={status}
                    className="w-full"
                    onClick={() => handleSubmitReview(bookingId, rating)}
                  >
                    Confirmar
                  </Button>
                </>
              ) : (
                <></>
              )}
            </DialogClose>
          </DialogFooter>
        </>
      ) : (
        <></>
      )}
    </>
  )
}

export default UpdateScoreReview
