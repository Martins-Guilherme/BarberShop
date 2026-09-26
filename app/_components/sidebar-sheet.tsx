'use client'

import { quickSearchOptinons } from '../_constants/search'
import Link from 'next/link'
import { CalendarIcon, HomeIcon, LogInIcon, LogOutIcon } from 'lucide-react'

import { SheetClose, SheetContent, SheetHeader, SheetTitle } from './ui/sheet'
import { Button } from './ui/button'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { signOut, useSession } from 'next-auth/react'
import { Avatar, AvatarImage } from './ui/avatar'
import SigInDialog from './signin-dialog'

const SideBarSheet = () => {
  const { data } = useSession()
  const handleLogoutClick = () => signOut()
  return (
    <SheetContent className="overflow-y-auto">
      <SheetHeader>
        <SheetTitle className="text-left">Menu</SheetTitle>
      </SheetHeader>
      <div className="flex items-center justify-between gap-2 border-b border-solid p-5 py-2">
        {data?.user ? (
          <div className="flex items-center gap-2 pb-2">
            <Avatar>
              <AvatarImage src={data?.user?.image as any} />
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
                <SigInDialog />
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
      {data?.user && (
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
      )}
    </SheetContent>
  )
}

export default SideBarSheet
