import { API_BASE_URL } from "@/config/api"
import { User, CreateUserPayload, UpdateUserPayload } from "@/types/user"

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE_URL}/users/`)
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`)
  return res.json()
}

export async function getUserById(id: number): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users/${id}/`)
  if (!res.ok) throw new Error(`User not found: ${res.status}`)
  return res.json()
}

export async function createUser(data: CreateUserPayload): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create user: ${res.status}`)
  return res.json()
}

export async function updateUser(id: number, data: UpdateUserPayload): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update user: ${res.status}`)
  return res.json()
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/users/${id}/`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(`Failed to delete user: ${res.status}`)
}