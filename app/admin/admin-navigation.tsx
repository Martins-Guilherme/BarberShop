'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from 'cn'

const items = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/availability', label: 'Horários de agendamento' },
]

export function AdminNavigation() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegação administrativa"
      className="flex gap-2 overflow-x-auto border-b px-5 [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
