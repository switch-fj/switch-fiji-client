import api from "@/lib/axios"
import { AUTH, ENGINEER } from "@/constants/api"
import { EnumStaffRole } from "@/constants/mangle"
import type {
  RegisterEngineerInput,
  PaginatedUsers,
  GetUsersParams,
} from "@/types/engineer"
import type { ServerResponse } from "@/types/client"

export const registerEngineer = async (
  payload: RegisterEngineerInput
): Promise<ServerResponse<boolean>> => {
  const { data } = await api.post<ServerResponse<boolean>>(AUTH.REGISTER, {
    email: payload.email,
    role: EnumStaffRole.ENGINEER,
  })
  return data
}

export const getUsers = async (
  params?: GetUsersParams
): Promise<ServerResponse<PaginatedUsers>> => {
  const { data } = await api.get<ServerResponse<PaginatedUsers>>(
    ENGINEER.LIST,
    { params }
  )
  return data
}
