export interface Guest {
  guest_id: number
  full_name: string
  email: string
  phone: string
  id_type: string
  id_number: string
  created_at: string
  user_id: number
}

export type CreateGuestPayload = Omit<Guest, "guest_id" | "created_at">
export type UpdateGuestPayload = Partial<CreateGuestPayload>