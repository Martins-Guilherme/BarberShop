export interface PendingBookingPreviewItem {
  id: string
  date: Date
  paymentStatus: 'pending' | 'approved' | 'rejected' | 'expired' | 'refunded'
  paymentExpiresAt: Date | null
  paymentAmount: number
  user: { name: string | null }
  service: {
    name: string
    price: number
    barbershop: { name: string }
  }
}
