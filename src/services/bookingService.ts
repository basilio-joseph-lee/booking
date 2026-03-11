import { API_BASE_URL } from "@/config/api"
import { Booking, CreateBookingPayload, UpdateBookingPayload } from "@/types/bookings"

// ─── READ ALL ────────────────────────────────────────────────────────────────

export async function getBookings(): Promise<Booking[]> {
  const res = await fetch(`${API_BASE_URL}bookings/`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Failed to fetch bookings: ${res.status}`)
  return res.json()
}

// ─── READ ONE ────────────────────────────────────────────────────────────────

export async function getBookingById(id: number): Promise<Booking> {
  const res = await fetch(`${API_BASE_URL}bookings/${id}/`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Failed to fetch booking ${id}: ${res.status}`)
  return res.json()
}

// ─── CREATE ──────────────────────────────────────────────────────────────────

export async function createBooking(data: CreateBookingPayload): Promise<Booking> {
  const res = await fetch(`${API_BASE_URL}bookings/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create booking: ${res.status}`)
  return res.json()
}

// ─── UPDATE (PATCH) ──────────────────────────────────────────────────────────

export async function updateBooking(
  id: number,
  data: UpdateBookingPayload
): Promise<Booking> {
  const res = await fetch(`${API_BASE_URL}bookings/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update booking ${id}: ${res.status}`)
  return res.json()
}

// ─── UPDATE (PUT) ────────────────────────────────────────────────────────────

export async function replaceBooking(
  id: number,
  data: CreateBookingPayload
): Promise<Booking> {
  const res = await fetch(`${API_BASE_URL}bookings/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to replace booking ${id}: ${res.status}`)
  return res.json()
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function deleteBooking(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}bookings/${id}/`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(`Failed to delete booking ${id}: ${res.status}`)
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export async function getBookingsByStatus(status: string): Promise<Booking[]> {
  const bookings = await getBookings()
  return bookings.filter((b) => b.status === status)
}

export async function getBookingsByGuest(guestId: number): Promise<Booking[]> {
  const bookings = await getBookings()
  return bookings.filter((b) => b.guest === guestId)
}

export async function getBookingsByRoom(roomId: number): Promise<Booking[]> {
  const bookings = await getBookings()
  return bookings.filter((b) => b.room === roomId)
}