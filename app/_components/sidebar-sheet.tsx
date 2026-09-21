'use client'

import { quickSearchOptinons } from '../_constants/search'
import Link from 'next/link'
import { CalendarIcon, HomeIcon, LogInIcon, LogOutIcon } from 'lucide-react'

import { SheetClose, SheetContent, SheetHeader, SheetTitle } from './ui/sheet'
import { Button } from './ui/button'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Avatar, AvatarImage } from './ui/avatar'

const SideBarSheet = () => {
  const { data } = useSession()
  const handleLoginWithGoogleClick = () => signIn('google')
  const handleLogoutClick = () => signOut()
  return (
    <SheetContent className="overflow-y-auto">
      <SheetHeader>
        <SheetTitle className="text-left">Menu</SheetTitle>
      </SheetHeader>
      <div className="flex items-center justify-between gap-2 border-b border-solid p-5 py-2">
        {data?.user ? (
          <div className="flex items-center gap-2 pb-2 pl-5">
            <Avatar>
              <AvatarImage src={data?.user?.image ?? ''} />
            </Avatar>

            <div className="ml-3 flex flex-col gap-1">
              <span className="font-bold">{data.user.name}</span>
              <span className="text-xs">{data.user.email}</span>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold">Olá, faça seu login!</h2>
            <Dialog>
              <DialogTrigger
                render={
                  <Button size="icon">
                    <LogInIcon />
                  </Button>
                }
              ></DialogTrigger>
              <DialogContent className="w-[90%]">
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
                    width={16}
                    height={16}
                    alt="fazer login com o google"
                    src="./google.svg"
                  />
                  <p>Google</p>
                </Button>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>

      <div className="flex flex-col justify-start gap-1 border-b border-solid py-5">
        <SheetClose
          render={
            <Button
              variant="ghost"
              className="justify-start gap-2"
              render={<Link href="/" />}
            >
              <HomeIcon size={18} />
              Início
            </Button>
          }
        ></SheetClose>
        <Button className="justify-start gap-2" variant="ghost">
          <CalendarIcon size={18} />
          Agendamentos
        </Button>
      </div>

      <div className="flex flex-col gap-1 border-b border-solid py-5">
        {quickSearchOptinons.map((option) => (
          <SheetClose
            key={option.title}
            render={
              <Button
                className="justify-start gap-2"
                key={option.title}
                variant="ghost"
                render={
                  <Link href={`/barbershops?service=${option.title}`}>
                    <Image
                      src={option.imageURL}
                      height={18}
                      width={18}
                      alt={option.title}
                    />
                    {option.title}
                  </Link>
                }
              ></Button>
            }
          ></SheetClose>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          className="justify-start gap-2"
          onClick={handleLogoutClick}
        >
          <LogOutIcon size={18} />
          Sair da conta
        </Button>
      </div>
    </SheetContent>
  )
}

export default SideBarSheet
