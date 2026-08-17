import api from "@/lib/axios"
import { SITE } from "@/constants/api"
import type { SiteBatterySoc } from "@/types/engineer"
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
