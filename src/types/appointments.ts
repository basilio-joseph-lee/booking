export interface Appointment {
  appointment_id: number
  guest: number
  booking: number
  service_type: string
  room: number
  scheduled_at: string
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed" | string
  assigned_staff: number | null
  notes: string
  created_at: string
}

export type CreateAppointmentPayload = Omit<Appointment, "appointment_id" | "created_at">
export type UpdateAppointmentPayload = Partial<CreateAppointmentPayload>