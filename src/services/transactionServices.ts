import { API_BASE_URL } from "@/config/api"
import { Transaction, CreateTransactionPayload, UpdateTransactionPayload } from "@/types/transaction"

// ─── READ ALL ────────────────────────────────────────────────────────────────

export async function getTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${API_BASE_URL}transactions/`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.status}`)
  return res.json()
}

// ─── READ ONE ────────────────────────────────────────────────────────────────

export async function getTransactionById(id: number): Promise<Transaction> {
  const res = await fetch(`${API_BASE_URL}transactions/${id}/`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Failed to fetch transaction ${id}: ${res.status}`)
  return res.json()
}

// ─── CREATE ──────────────────────────────────────────────────────────────────

export async function createTransaction(data: CreateTransactionPayload): Promise<Transaction> {
  const res = await fetch(`${API_BASE_URL}transactions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create transaction: ${res.status}`)
  return res.json()
}

// ─── UPDATE (PATCH) ──────────────────────────────────────────────────────────

export async function updateTransaction(
  id: number,
  data: UpdateTransactionPayload
): Promise<Transaction> {
  const res = await fetch(`${API_BASE_URL}transactions/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update transaction ${id}: ${res.status}`)
  return res.json()
}

// ─── UPDATE (PUT) ────────────────────────────────────────────────────────────

export async function replaceTransaction(
  id: number,
  data: CreateTransactionPayload
): Promise<Transaction> {
  const res = await fetch(`${API_BASE_URL}transactions/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to replace transaction ${id}: ${res.status}`)
  return res.json()
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function deleteTransaction(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}transactions/${id}/`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(`Failed to delete transaction ${id}: ${res.status}`)
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export async function getTransactionsByGuest(guestId: number): Promise<Transaction[]> {
  const transactions = await getTransactions()
  return transactions.filter((t) => t.guest === guestId)
}

export async function getTransactionsByBooking(bookingId: number): Promise<Transaction[]> {
  const transactions = await getTransactions()
  return transactions.filter((t) => t.booking === bookingId)
}

export async function getTransactionsByCategory(category: string): Promise<Transaction[]> {
  const transactions = await getTransactions()
  return transactions.filter((t) => t.category === category)
}