import api from "@/lib/axios"
import { SITE } from "@/constants/api"
import type { ProductionHistory } from "@/types/engineer"
import type { ServerResponse } from "@workspace/api"

export const getProductionHistory = async (
  siteUid: string,
  params: { from_date: string; to_date: string; refresh?: boolean }
): Promise<ServerResponse<ProductionHistory>> => {
  const { data } = await api.get<ServerResponse<ProductionHistory>>(
    SITE.PRODUCTION_HISTORY(siteUid),
    { params }
  )
  return data
}
