export interface PendingBookingPreviewItem {
  id: string
  date: Date
  user: { name: string | null }
  service: {
    name: string
    price: number
    barbershop: { name: string }
  }
}
