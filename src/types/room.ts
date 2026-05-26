export interface Room {
  room_id: number
  room_number: string
  floor: number
  type: "Standard" | "Deluxe" | string
  status: "Available" | "Occupied" | "Housekeeping" | "Maintenance" | string
  price_per_night: string
  max_occupancy: number
  description: string
  image_url: string
  created_at: string
  updated_at: string
}

export type CreateRoomPayload = Omit<Room, "room_id" | "created_at" | "updated_at" | "status"> & {
  status?: string;
}
export type UpdateRoomPayload = Partial<CreateRoomPayload>