export interface User {
  id: number
  name: string
  email: string
  role: string
  is_active: boolean
  created_at : string
  updated_at : string
}


export type CreateUserPayload = Omit<User, "id">

export type UpdateUserPayload = Partial<Omit<User, "id">>