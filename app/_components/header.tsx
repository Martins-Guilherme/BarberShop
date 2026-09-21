import Image from 'next/image'
import Link from 'next/link'

import { MenuIcon } from 'lucide-react'

import { Card, CardContent } from './ui/card'
import { Sheet, SheetTrigger } from './ui/sheet'
import { Button } from './ui/button'
import SideBarSheet from './sidebar-sheet'

const Header = () => {
  return (
    <Card>
      <CardContent className="flex flex-row items-center justify-between p-5">
        <Link href="/">
          <Image alt="FSW Barber" src="/logo.png" height={18} width={120} />
        </Link>
        {/* MENU */}
        <Sheet>
          <SheetTrigger
            render={
              <Button size="icon" variant="outline">
                <MenuIcon />
              </Button>
            }
          ></SheetTrigger>
          <SideBarSheet />
        </Sheet>
      </CardContent>
    </Card>
  )
}

export default Header
