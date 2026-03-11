export interface Transaction {
  transaction_id: number
  booking: number
  guest: number
  category: string
  amount: string
  description: string
  transaction_date: string
  created_by: number | null
  created_at: string
}

export type CreateTransactionPayload = Omit<Transaction, "transaction_id" | "created_at">
export type UpdateTransactionPayload = Partial<CreateTransactionPayload>