"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getSiteBatterySoc,
  getSiteBatteryConfig,
  createSiteBatteryConfig,
} from "@/requests/batterySoc"
import type { BatterySocConfigInputItem } from "@/types/engineer"

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

const batteryConfigKey = (siteUid: string) =>
  ["site", siteUid, "battery-config"] as const

export const useSiteBatteryConfig = (
  siteUid: string | null,
  enabled = true
) => {
  return useQuery({
    queryKey: batteryConfigKey(siteUid ?? ""),
    queryFn: () => getSiteBatteryConfig(siteUid!),
    enabled: !!siteUid && enabled,
  })
}

export const useCreateSiteBatteryConfig = (siteUid: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (configInput: BatterySocConfigInputItem[]) =>
      createSiteBatteryConfig(siteUid, configInput),
    onSuccess: (res) => {
      toast.success(res.message || "Battery config created successfully.")
      queryClient.invalidateQueries({ queryKey: batteryConfigKey(siteUid) })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create battery config.")
    },
  })
}
