import { API_BASE_URL } from "@/config/api"
import { User } from "@/types/user"

// ─── READ ALL ────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE_URL}users/`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`)
  return res.json()
}

// ─── READ ONE ────────────────────────────────────────────────────────────────

export async function getUserById(id: number): Promise<User> {
  const res = await fetch(`${API_BASE_URL}users/${id}/`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Failed to fetch user ${id}: ${res.status}`)
  return res.json()
}

// ─── CREATE ──────────────────────────────────────────────────────────────────

export async function createUser(
  data: Omit<User, "id" | "created_at" | "updated_at">
): Promise<User> {
  const res = await fetch(`${API_BASE_URL}users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create user: ${res.status}`)
  return res.json()
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────

export async function updateUser(
  id: number,
  data: Omit<User, "id" | "created_at" | "updated_at"> & { password?: string }
): Promise<User> {
  const payload = { ...data }
  if (!payload.password || payload.password.trim() === "") {
    delete payload.password
  }

  const res = await fetch(`${API_BASE_URL}users/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Failed to update user: ${res.status}`)
  return res.json()
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}users/${id}/`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(`Failed to delete user: ${res.status}`)
}