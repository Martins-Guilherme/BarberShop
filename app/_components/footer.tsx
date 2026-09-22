'use client'

import Link from 'next/link'
import { Card, CardContent } from './ui/card'

const Footer = () => {
  return (
    <footer>
      <Card>
        <CardContent className="px-5 py-3">
          <p className="text-sm text-gray-400">
            © 2026 Copyright <span className="font-bold">Barber Shop</span>{' '}
            <Link href="https://martins-guilherme.github.io/privacidade.github.io/">
              Politicas de privacidade
            </Link>
          </p>
        </CardContent>
      </Card>
    </footer>
  )
}

export default Footer
