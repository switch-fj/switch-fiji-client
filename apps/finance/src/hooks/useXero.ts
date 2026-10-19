"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getXeroSettings,
  getXeroTaxMappings,
  setXeroTaxMapping,
  updateXeroSettings,
} from "@/requests/xero"
import type { XeroSettingsModel, XeroTaxMappingInput } from "@/types/xero"

export const XERO_KEYS = {
  settings: ["xero", "settings"] as const,
  taxMappings: ["xero", "tax-mappings"] as const,
}

export const useXeroSettings = () =>
  useQuery({
    queryKey: XERO_KEYS.settings,
    queryFn: getXeroSettings,
    select: (res) => res.data,
  })

export const useUpdateXeroSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: XeroSettingsModel) => updateXeroSettings(payload),
    onSuccess: (response) => {
      toast.success(response.message || "Xero settings updated.")
      queryClient.setQueryData(XERO_KEYS.settings, response)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update Xero settings.")
    },
  })
}

export const useXeroTaxMappings = () =>
  useQuery({
    queryKey: XERO_KEYS.taxMappings,
    queryFn: getXeroTaxMappings,
    select: (res) => res.data,
  })

export const useSetXeroTaxMapping = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: XeroTaxMappingInput) => setXeroTaxMapping(payload),
    onSuccess: (response) => {
      toast.success(response.message || "Xero tax mapping saved.")
      queryClient.invalidateQueries({ queryKey: XERO_KEYS.taxMappings })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save Xero tax mapping.")
    },
  })
}
