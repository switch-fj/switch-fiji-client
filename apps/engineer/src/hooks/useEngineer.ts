"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { fetchAllCursorPages } from "@workspace/api"
import {
  getEngineerStats,
  getEngineerClients,
  getClientSites,
  updateClient,
  updateSite,
} from "@/requests/engineer"
import type {
  EngineeringDashboardClient,
  UpdateClientInput,
  UpdateSiteInput,
} from "@/types/engineer"

export const ENGINEER_KEYS = {
  stats: ["engineer", "stats"] as const,
  clients: ["engineer", "clients"] as const,
  clientSites: (clientUid: string) =>
    ["engineer", "clients", clientUid, "sites"] as const,
}

export const useEngineerStats = () => {
  return useQuery({
    queryKey: ENGINEER_KEYS.stats,
    queryFn: getEngineerStats,
  })
}

// Every client (with its sites and devices) across all cursor pages — the
// overview needs the full portfolio to build per-site rows and totals.
export const useEngineerClients = () => {
  return useQuery({
    queryKey: ENGINEER_KEYS.clients,
    queryFn: () =>
      fetchAllCursorPages<EngineeringDashboardClient>((cursor) =>
        getEngineerClients({ limit: 100, next_cursor: cursor })
      ),
  })
}

export const useClientSites = (clientUid: string | null) => {
  return useQuery({
    queryKey: ENGINEER_KEYS.clientSites(clientUid ?? ""),
    queryFn: () => getClientSites(clientUid!),
    enabled: !!clientUid,
  })
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      clientUid,
      payload,
    }: {
      clientUid: string
      payload: UpdateClientInput
    }) => updateClient(clientUid, payload),
    onSuccess: (res) => {
      toast.success(res.message || "Client updated successfully.")
      queryClient.invalidateQueries({ queryKey: ENGINEER_KEYS.clients })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update client.")
    },
  })
}

export const useUpdateSite = (clientUid: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      siteUid,
      payload,
    }: {
      siteUid: string
      payload: UpdateSiteInput
    }) => updateSite(siteUid, payload),
    onSuccess: (res) => {
      toast.success(res.message || "Site updated successfully.")
      queryClient.invalidateQueries({ queryKey: ENGINEER_KEYS.clients })
      queryClient.invalidateQueries({
        queryKey: ENGINEER_KEYS.clientSites(clientUid),
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update site.")
    },
  })
}
