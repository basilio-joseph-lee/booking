export interface User {
  user_id: number
  name: string
  email: string
}


export type CreateUserPayload = Omit<User, "user_id">

export type UpdateUserPayload = Partial<Omit<User, "user_id">>