"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getSitePvs,
  createSitePvs,
  editSitePvs,
  getSiteDegradation,
  createSiteDegradation,
  editSiteDegradation,
} from "@/requests/engineer"
import type {
  SitePvSummaryInput,
  UpdateSitePvSummaryInput,
  SiteDegradationInput,
} from "@/types/engineer"

export const SITE_PV_KEYS = {
  pvs: (siteUid: string) => ["site", siteUid, "pvs"] as const,
  degradation: (siteUid: string) => ["site", siteUid, "degradation"] as const,
}

export const useSitePvs = (siteUid: string | null) => {
  return useQuery({
    queryKey: SITE_PV_KEYS.pvs(siteUid ?? ""),
    queryFn: () => getSitePvs(siteUid!),
    enabled: !!siteUid,
  })
}

export const useCreateSitePvs = (siteUid: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SitePvSummaryInput) =>
      createSitePvs(siteUid, payload),
    onSuccess: (res) => {
      toast.success(res.message || "PV summary created successfully.")
      queryClient.invalidateQueries({ queryKey: SITE_PV_KEYS.pvs(siteUid) })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create PV summary.")
    },
  })
}

export const useEditSitePvs = (siteUid: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateSitePvSummaryInput) =>
      editSitePvs(siteUid, payload),
    onSuccess: (res) => {
      toast.success(res.message || "PV summary updated successfully.")
      queryClient.invalidateQueries({ queryKey: SITE_PV_KEYS.pvs(siteUid) })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update PV summary.")
    },
  })
}

export const useSiteDegradation = (siteUid: string | null) => {
  return useQuery({
    queryKey: SITE_PV_KEYS.degradation(siteUid ?? ""),
    queryFn: () => getSiteDegradation(siteUid!),
    enabled: !!siteUid,
  })
}

export const useCreateSiteDegradation = (siteUid: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SiteDegradationInput) =>
      createSiteDegradation(siteUid, payload),
    onSuccess: (res) => {
      toast.success(res.message || "Degradation table created successfully.")
      queryClient.invalidateQueries({
        queryKey: SITE_PV_KEYS.degradation(siteUid),
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create degradation table.")
    },
  })
}

export const useEditSiteDegradation = (siteUid: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SiteDegradationInput) =>
      editSiteDegradation(siteUid, payload),
    onSuccess: (res) => {
      toast.success(res.message || "Degradation table updated successfully.")
      queryClient.invalidateQueries({
        queryKey: SITE_PV_KEYS.degradation(siteUid),
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update degradation table.")
    },
  })
}
