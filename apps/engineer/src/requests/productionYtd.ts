import api from "@/lib/axios"
import { SITE } from "@/constants/api"
import type { ProductionYTD } from "@/types/engineer"
import type { ServerResponse } from "@workspace/api"

/** No query parameters — the backend picks the period (1 Jan → yesterday,
 * site-local) and rejects anything else with a 400. */
export const getProductionYtd = async (
  siteUid: string,
  signal?: AbortSignal
): Promise<ServerResponse<ProductionYTD>> => {
  const { data } = await api.get<ServerResponse<ProductionYTD>>(
    SITE.PRODUCTION_YTD(siteUid),
    { signal }
  )
  return data
}
