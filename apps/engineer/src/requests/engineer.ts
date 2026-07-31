import api from "@/lib/axios"
import { ENGINEER, SITE } from "@/constants/api"
import type {
  ResourceStats,
  PaginatedEngineerClients,
  EngineeringDashboardSite,
  UpdateClientInput,
  UpdateSiteInput,
  SitePvSummary,
  SitePvSummaryInput,
  UpdateSitePvSummaryInput,
  SitePvDegradation,
  SiteDegradationInput,
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

export const getSitePvs = async (
  siteUid: string
): Promise<ServerResponse<SitePvSummary | null>> => {
  const { data } = await api.get<ServerResponse<SitePvSummary | null>>(
    SITE.PVS(siteUid)
  )
  return data
}

export const createSitePvs = async (
  siteUid: string,
  payload: SitePvSummaryInput
): Promise<ServerResponse<boolean>> => {
  const { data } = await api.post<ServerResponse<boolean>>(
    SITE.PVS(siteUid),
    payload
  )
  return data
}

export const editSitePvs = async (
  siteUid: string,
  payload: UpdateSitePvSummaryInput
): Promise<ServerResponse<boolean>> => {
  const { data } = await api.put<ServerResponse<boolean>>(
    SITE.PVS(siteUid),
    payload
  )
  return data
}

export const getSiteDegradation = async (
  siteUid: string
): Promise<ServerResponse<SitePvDegradation | null>> => {
  const { data } = await api.get<ServerResponse<SitePvDegradation | null>>(
    SITE.DEGRADATION(siteUid)
  )
  return data
}

export const createSiteDegradation = async (
  siteUid: string,
  payload: SiteDegradationInput
): Promise<ServerResponse<SitePvDegradation | null>> => {
  const { data } = await api.post<ServerResponse<SitePvDegradation | null>>(
    SITE.DEGRADATION(siteUid),
    payload
  )
  return data
}

export const editSiteDegradation = async (
  siteUid: string,
  payload: SiteDegradationInput
): Promise<ServerResponse<SitePvDegradation | null>> => {
  const { data } = await api.put<ServerResponse<SitePvDegradation | null>>(
    SITE.DEGRADATION(siteUid),
    payload
  )
  return data
}
