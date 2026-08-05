"use client"

import { useQuery } from "@tanstack/react-query"
import { getSiteMpptFunctionCheck } from "@/requests/mpptCheck"

export const useSiteMpptFunctionCheck = (
  siteUid: string | null,
  dateAt: number,
  enabled = true
) => {
  return useQuery({
    queryKey: ["site", siteUid ?? "", "mppt-function-check", dateAt],
    queryFn: () => getSiteMpptFunctionCheck(siteUid!, dateAt),
    enabled: !!siteUid && enabled,
  })
}
