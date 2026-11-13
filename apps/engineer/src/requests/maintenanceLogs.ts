import api from "@/lib/axios"
import { SITE } from "@/constants/api"
import type {
  CreateMaintenanceLogInput,
  MaintenanceLog,
  MaintenanceLogQuery,
  PaginatedMaintenanceLogs,
  UpdateMaintenanceLogInput,
} from "@/types/engineer"
import type { ServerResponse } from "@workspace/api"

export const getMaintenanceLogs = async (
  siteUid: string,
  query: MaintenanceLogQuery
): Promise<ServerResponse<PaginatedMaintenanceLogs>> => {
  const { data } = await api.get<ServerResponse<PaginatedMaintenanceLogs>>(
    SITE.MAINTENANCE_LOGS(siteUid),
    { params: query }
  )
  return data
}

export const createMaintenanceLog = async (
  siteUid: string,
  payload: CreateMaintenanceLogInput
): Promise<ServerResponse<MaintenanceLog>> => {
  const { data } = await api.post<ServerResponse<MaintenanceLog>>(
    SITE.MAINTENANCE_LOGS(siteUid),
    payload
  )
  return data
}

export const updateMaintenanceLog = async (
  siteUid: string,
  logUid: string,
  payload: UpdateMaintenanceLogInput
): Promise<ServerResponse<MaintenanceLog>> => {
  const { data } = await api.patch<ServerResponse<MaintenanceLog>>(
    SITE.MAINTENANCE_LOG(siteUid, logUid),
    payload
  )
  return data
}

export const deleteMaintenanceLog = async (
  siteUid: string,
  logUid: string
): Promise<ServerResponse<boolean>> => {
  const { data } = await api.delete<ServerResponse<boolean>>(
    SITE.MAINTENANCE_LOG(siteUid, logUid)
  )
  return data
}
