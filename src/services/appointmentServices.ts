import { API_BASE_URL } from "@/config/api"
import { Appointment, CreateAppointmentPayload, UpdateAppointmentPayload } from "@/types/appointments"

// ─── READ ALL ────────────────────────────────────────────────────────────────

export async function getAppointments(): Promise<Appointment[]> {
  const res = await fetch(`${API_BASE_URL}appointments/`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Failed to fetch appointments: ${res.status}`)
  return res.json()
}

// ─── READ ONE ────────────────────────────────────────────────────────────────

export async function getAppointmentById(id: number): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}appointments/${id}/`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Failed to fetch appointment ${id}: ${res.status}`)
  return res.json()
}

// ─── CREATE ──────────────────────────────────────────────────────────────────

export async function createAppointment(data: CreateAppointmentPayload): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}appointments/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create appointment: ${res.status}`)
  return res.json()
}

// ─── UPDATE (PATCH) ──────────────────────────────────────────────────────────

export async function updateAppointment(
  id: number,
  data: UpdateAppointmentPayload
): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}appointments/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update appointment ${id}: ${res.status}`)
  return res.json()
}

// ─── UPDATE (PUT) ────────────────────────────────────────────────────────────

export async function replaceAppointment(
  id: number,
  data: CreateAppointmentPayload
): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}appointments/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to replace appointment ${id}: ${res.status}`)
  return res.json()
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function deleteAppointment(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}appointments/${id}/`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(`Failed to delete appointment ${id}: ${res.status}`)
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export async function getAppointmentsByStatus(status: string): Promise<Appointment[]> {
  const appointments = await getAppointments()
  return appointments.filter((a) => a.status === status)
}

export async function getAppointmentsByGuest(guestId: number): Promise<Appointment[]> {
  const appointments = await getAppointments()
  return appointments.filter((a) => a.guest === guestId)
}

export async function getAppointmentsByStaff(staffId: number): Promise<Appointment[]> {
  const appointments = await getAppointments()
  return appointments.filter((a) => a.assigned_staff === staffId)
}