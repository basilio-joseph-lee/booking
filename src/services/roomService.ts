import { API_BASE_URL } from "@/config/api"
import { Room, CreateRoomPayload, UpdateRoomPayload } from "@/types/room"

// ─── READ ALL ────────────────────────────────────────────────────────────────

export async function getRooms(): Promise<Room[]> {
  const res = await fetch(`${API_BASE_URL}rooms/`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Failed to fetch rooms: ${res.status}`)
  return res.json()
}

// ─── READ ONE ────────────────────────────────────────────────────────────────

export async function getRoomById(id: number): Promise<Room> {
  const res = await fetch(`${API_BASE_URL}rooms/${id}/`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Failed to fetch room ${id}: ${res.status}`)
  return res.json()
}

// ─── CREATE ──────────────────────────────────────────────────────────────────

export async function createRoom(data: CreateRoomPayload): Promise<Room> {
  const res = await fetch(`${API_BASE_URL}rooms/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create room: ${res.status}`)
  return res.json()
}

// ─── UPDATE (PATCH) ──────────────────────────────────────────────────────────

export async function updateRoom(
  id: number,
  data: UpdateRoomPayload
): Promise<Room> {
  const res = await fetch(`${API_BASE_URL}rooms/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update room ${id}: ${res.status}`)
  return res.json()
}

// ─── UPDATE (PUT) ────────────────────────────────────────────────────────────

export async function replaceRoom(
  id: number,
  data: CreateRoomPayload
): Promise<Room> {
  const res = await fetch(`${API_BASE_URL}rooms/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to replace room ${id}: ${res.status}`)
  return res.json()
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function deleteRoom(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}rooms/${id}/`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(`Failed to delete room ${id}: ${res.status}`)
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export async function getAvailableRooms(): Promise<Room[]> {
  const rooms = await getRooms()
  return rooms.filter((room) => room.status === "Available")
}

export async function getRoomsByType(type: string): Promise<Room[]> {
  const rooms = await getRooms()
  return rooms.filter((room) => room.type === type)
}

export async function getRoomsByFloor(floor: number): Promise<Room[]> {
  const rooms = await getRooms()
  return rooms.filter((room) => room.floor === floor)
}