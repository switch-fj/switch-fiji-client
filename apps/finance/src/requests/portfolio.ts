import api from "@/lib/axios"
import { PORTFOLIO } from "@/constants/api"
import type { PortfolioStats } from "@/types/portfolio"
import type { ServerResponse } from "@/types/client"

export const getPortfolioStats = async (): Promise<
  ServerResponse<PortfolioStats>
> => {
  const { data } = await api.get<ServerResponse<PortfolioStats>>(
    PORTFOLIO.STATS
  )
  return data
}
