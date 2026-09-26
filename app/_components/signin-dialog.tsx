import Image from 'next/image'
import { Button } from './ui/button'
import { DialogTitle, DialogDescription } from './ui/dialog'
import { DialogHeader } from './ui/dialog'
import { signIn } from 'next-auth/react'

const SigInDialog = () => {
  const handleLoginWithGoogleClick = () => signIn('google')

  return (
    <>
      <DialogHeader className="text-center">
        <DialogTitle className="pb-2 text-base font-bold">
          Faça login na plataforma
        </DialogTitle>
        <DialogDescription className="text-sm">
          Conecte-se usando sua conta do Google.
        </DialogDescription>
      </DialogHeader>
      <Button
        className="gap-2 rounded-[10px] p-4 text-sm font-bold"
        variant="outline"
        onClick={handleLoginWithGoogleClick}
      >
        <Image
          width={18}
          height={18}
          alt="fazer login com o google"
          src="/google.svg"
        />
        <p>Google</p>
      </Button>
    </>
  )
}

export default SigInDialog
