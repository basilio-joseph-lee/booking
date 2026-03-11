import { API_BASE_URL } from "@/config/api"
import { Guest, CreateGuestPayload, UpdateGuestPayload } from "@/types/guests"

// ─── READ ALL ────────────────────────────────────────────────────────────────

export async function getGuests(): Promise<Guest[]> {
  const res = await fetch(`${API_BASE_URL}guests/`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Failed to fetch guests: ${res.status}`)
  return res.json()
}

// ─── READ ONE ────────────────────────────────────────────────────────────────

export async function getGuestById(id: number): Promise<Guest> {
  const res = await fetch(`${API_BASE_URL}guests/${id}/`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Failed to fetch guest ${id}: ${res.status}`)
  return res.json()
}

// ─── CREATE ──────────────────────────────────────────────────────────────────

export async function createGuest(data: CreateGuestPayload): Promise<Guest> {
  const res = await fetch(`${API_BASE_URL}guests/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create guest: ${res.status}`)
  return res.json()
}

// ─── UPDATE (PATCH) ──────────────────────────────────────────────────────────

export async function updateGuest(
  id: number,
  data: UpdateGuestPayload
): Promise<Guest> {
  const res = await fetch(`${API_BASE_URL}guests/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update guest ${id}: ${res.status}`)
  return res.json()
}

// ─── UPDATE (PUT) ────────────────────────────────────────────────────────────

export async function replaceGuest(
  id: number,
  data: CreateGuestPayload
): Promise<Guest> {
  const res = await fetch(`${API_BASE_URL}guests/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to replace guest ${id}: ${res.status}`)
  return res.json()
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function deleteGuest(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}guests/${id}/`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(`Failed to delete guest ${id}: ${res.status}`)
}