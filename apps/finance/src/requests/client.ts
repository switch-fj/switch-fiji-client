import api from "@/lib/axios"
import { CLIENT } from "@/constants/api"
import type {
  CreateClientInput,
  PaginatedClients,
  ServerResponse,
} from "@/types/client"

export type { CreateClientInput } from "@/types/client"

export type GetClientsParams = {
  limit?: number
  cursor?: string
}

export const getClients = async (
  params?: GetClientsParams
): Promise<ServerResponse<PaginatedClients>> => {
  const { data } = await api.get<ServerResponse<PaginatedClients>>(
    CLIENT.LIST,
    { params }
  )
  return data
}

export const addClient = async (
  payload: CreateClientInput
): Promise<ServerResponse<string>> => {
  const { data } = await api.post<ServerResponse<string>>(CLIENT.ADD, payload)
  return data
}
