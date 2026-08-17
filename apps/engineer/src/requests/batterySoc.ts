import api from "@/lib/axios"
import { SITE } from "@/constants/api"
import type {
  SiteBatterySoc,
  SiteBatteryConfig,
  BatterySocConfigInputItem,
} from "@/types/engineer"
import type { ServerResponse } from "@workspace/api"

export const getSiteBatterySoc = async (
  siteUid: string,
  dateAt: number
): Promise<ServerResponse<SiteBatterySoc>> => {
  const { data } = await api.get<ServerResponse<SiteBatterySoc>>(
    SITE.BATTERY_SOC(siteUid),
    { params: { date_at: dateAt } }
  )
  return data
}

export const getSiteBatteryConfig = async (
  siteUid: string
): Promise<ServerResponse<SiteBatteryConfig | null>> => {
  const { data } = await api.get<ServerResponse<SiteBatteryConfig | null>>(
    SITE.BATTERY_CONFIG(siteUid)
  )
  return data
}

export const createSiteBatteryConfig = async (
  siteUid: string,
  configInput: BatterySocConfigInputItem[]
): Promise<ServerResponse<boolean>> => {
  const { data } = await api.post<ServerResponse<boolean>>(
    SITE.BATTERY_CONFIG(siteUid),
    { config_input: configInput }
  )
  return data
}
