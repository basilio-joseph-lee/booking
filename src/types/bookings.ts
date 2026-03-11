export interface Booking {
  booking_id: number
  guest: number
  room: number
  check_in_date: string
  check_out_date: string
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed" | string
  room_status: "Available" | "Occupied" | "Housekeeping" | "Maintenance" | string
  total_amount: string
  notes: string
  created_by: number | null
  created_at: string
}

export type CreateBookingPayload = Omit<Booking, "booking_id" | "created_at">
export type UpdateBookingPayload = Partial<CreateBookingPayload>