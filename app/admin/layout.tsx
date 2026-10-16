import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Header from '../_components/header'
import { authOptions } from '../_lib/auth'
import { AdminNavigation } from '../_components/admin-navigation'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <>
      <Header />
      <AdminNavigation />
      {children}
    </>
  )
}
