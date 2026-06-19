import { z } from "zod"

export const RegisterEngineerSchema = z.object({
  email: z.email("Enter a valid email"),
})

export type RegisterEngineerInput = z.infer<typeof RegisterEngineerSchema>

export type UserSummary = {
  uid: string
  created_at: string
  updated_at: string
  email: string
}

export type UserModel = {
  uid: string
  created_at: string
  updated_at: string
  email: string
  is_email_verified: boolean
  role: number
  registrar_uid: string | null
  registrar: UserSummary | null
}

export type PaginatedUsers = {
  items: UserModel[]
  pagination: {
    limit: number
    next_cursor: string | null
    prev_cursor: string | null
  }
}

export type GetUsersParams = {
  q?: string
  limit?: number
  next_cursor?: string
  prev_cursor?: string
}
