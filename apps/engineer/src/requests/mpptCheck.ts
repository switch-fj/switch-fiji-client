import api from "@/lib/axios"
import { SITE } from "@/constants/api"
import type { SiteMpptFunctionCheck } from "@/types/engineer"
import type { ServerResponse } from "@workspace/api"

export const getSiteMpptFunctionCheck = async (
  siteUid: string,
  dateAt: number
): Promise<ServerResponse<SiteMpptFunctionCheck | null>> => {
  const { data } = await api.get<ServerResponse<SiteMpptFunctionCheck | null>>(
    SITE.MPPT_FUNCTION_CHECK(siteUid),
    { params: { date_at: dateAt } }
  )
  return data
}
