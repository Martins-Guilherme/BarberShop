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

const SideBarSheet = () => {
  return (
    <SheetContent className="overflow-y-auto">
      <SheetHeader>
        <SheetTitle className="text-left">Menu</SheetTitle>
      </SheetHeader>
      <div className="flex items-center justify-between gap-2 border-b border-solid py-2 pl-5">
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

        {/* <Avatar>
          <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww" />
        </Avatar>

        <div className="ml-3 flex flex-col">
          <span className="font-bold">John Doe</span>
          <span className="text-xs">johndoe@macacuja.io</span>
        </div> */}
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
          <Button
            className="justify-start gap-2"
            key={option.title}
            variant="ghost"
          >
            <Image
              src={option.imageURL}
              height={18}
              width={18}
              alt={option.title}
            />
            {option.title}
          </Button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Button variant="ghost" className="justify-start gap-2">
          <LogOutIcon size={18} />
          Sair da conta
        </Button>
      </div>
    </SheetContent>
  )
}

export default SideBarSheet
