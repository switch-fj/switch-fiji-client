"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getSitePanels,
  createSitePanels,
  editSitePanels,
  getSiteStringWiring,
  createSiteStringWiring,
  editSiteStringWiring,
  getSiteDevices,
} from "@/requests/sitePanels"
import type {
  PanelRefItemInput,
  UpdatePanelRefItemInput,
  StringWiringItemInput,
} from "@/types/engineer"

export const SITE_PANEL_KEYS = {
  panels: (siteUid: string) => ["site", siteUid, "panels"] as const,
  stringWiring: (siteUid: string) =>
    ["site", siteUid, "string-wiring"] as const,
  devices: (siteUid: string) => ["site", siteUid, "devices"] as const,
}

export const useSitePanels = (siteUid: string | null) => {
  return useQuery({
    queryKey: SITE_PANEL_KEYS.panels(siteUid ?? ""),
    queryFn: () => getSitePanels(siteUid!),
    enabled: !!siteUid,
  })
}

export const useCreateSitePanels = (siteUid: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (refs: PanelRefItemInput[]) => createSitePanels(siteUid, refs),
    onSuccess: (res) => {
      toast.success(res.message || "Panel config created successfully.")
      queryClient.invalidateQueries({
        queryKey: SITE_PANEL_KEYS.panels(siteUid),
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create panel config.")
    },
  })
}

export const useEditSitePanels = (siteUid: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (refs: UpdatePanelRefItemInput[]) =>
      editSitePanels(siteUid, refs),
    onSuccess: (res) => {
      toast.success(res.message || "Panel config updated successfully.")
      queryClient.invalidateQueries({
        queryKey: SITE_PANEL_KEYS.panels(siteUid),
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update panel config.")
    },
  })
}

export const useSiteStringWiring = (siteUid: string | null) => {
  return useQuery({
    queryKey: SITE_PANEL_KEYS.stringWiring(siteUid ?? ""),
    queryFn: () => getSiteStringWiring(siteUid!),
    enabled: !!siteUid,
  })
}

export const useCreateSiteStringWiring = (siteUid: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (strings: StringWiringItemInput[]) =>
      createSiteStringWiring(siteUid, strings),
    onSuccess: (res) => {
      toast.success(res.message || "String wiring configured successfully.")
      queryClient.invalidateQueries({
        queryKey: SITE_PANEL_KEYS.stringWiring(siteUid),
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to configure string wiring.")
    },
  })
}

export const useEditSiteStringWiring = (siteUid: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (strings: StringWiringItemInput[]) =>
      editSiteStringWiring(siteUid, strings),
    onSuccess: (res) => {
      toast.success(res.message || "String wiring updated successfully.")
      queryClient.invalidateQueries({
        queryKey: SITE_PANEL_KEYS.stringWiring(siteUid),
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update string wiring.")
    },
  })
}

export const useSiteDevices = (siteUid: string | null) => {
  return useQuery({
    queryKey: SITE_PANEL_KEYS.devices(siteUid ?? ""),
    queryFn: () => getSiteDevices(siteUid!),
    enabled: !!siteUid,
  })
}
