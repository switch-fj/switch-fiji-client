"use client"

import { useQuery } from "@tanstack/react-query"
import { getPortfolioStats } from "@/requests/portfolio"

export const PORTFOLIO_KEYS = {
  stats: ["portfolio", "stats"] as const,
}

export const usePortfolioStats = () => {
  return useQuery({
    queryKey: PORTFOLIO_KEYS.stats,
    queryFn: getPortfolioStats,
  })
}
