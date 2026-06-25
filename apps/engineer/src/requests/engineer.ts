import api from "@/lib/axios"
import { ENGINEER } from "@/constants/api"
import type {
  ResourceStats,
  PaginatedEngineerClients,
  EngineeringDashboardSite,
  UpdateClientInput,
  UpdateSiteInput,
} from "@/types/engineer"
import type { ServerResponse } from "@workspace/api"

export const getEngineerStats = async (): Promise<
  ServerResponse<ResourceStats>
> => {
  const { data } = await api.get<ServerResponse<ResourceStats>>(ENGINEER.STATS)
  return data
}

export const getEngineerClients = async (): Promise<
  ServerResponse<PaginatedEngineerClients>
> => {
  const { data } = await api.get<ServerResponse<PaginatedEngineerClients>>(
    ENGINEER.CLIENTS
  )
  return data
}

export const getClientSites = async (
  clientUid: string
): Promise<ServerResponse<EngineeringDashboardSite[]>> => {
  const { data } = await api.get<ServerResponse<EngineeringDashboardSite[]>>(
    ENGINEER.CLIENT_SITES(clientUid)
  )
  return data
}

export const updateClient = async (
  clientUid: string,
  payload: UpdateClientInput
): Promise<ServerResponse<boolean>> => {
  const { data } = await api.patch<ServerResponse<boolean>>(
    ENGINEER.UPDATE_CLIENT(clientUid),
    payload
  )
  return data
}

export const updateSite = async (
  siteUid: string,
  payload: UpdateSiteInput
): Promise<ServerResponse<boolean>> => {
  const { data } = await api.patch<ServerResponse<boolean>>(
    ENGINEER.UPDATE_SITE,
    payload,
    { params: { site_uid: siteUid } }
  )
  return data
}
