"use client"

import { useQuery } from "@tanstack/react-query"
import { getSiteBatterySoc } from "@/requests/batterySoc"

export const useSiteBatterySoc = (
  siteUid: string | null,
  dateAt: number,
  enabled = true
) => {
  return useQuery({
    queryKey: ["site", siteUid ?? "", "battery-soc", dateAt],
    queryFn: () => getSiteBatterySoc(siteUid!, dateAt),
    enabled: !!siteUid && enabled,
  })
}
