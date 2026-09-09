"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { fetchAllCursorPages } from "@workspace/api"
import {
  getSites,
  getAllSites,
  getSitesSummary,
  addSite,
  streamSiteStats,
} from "@/requests/site"
import type { CreateSiteInput, SiteStats, SiteWithMetrics } from "@/types/site"

export const SITE_KEYS = {
  all: ["sites"] as const,
  byClient: (clientUid: string) => ["sites", clientUid] as const,
  allWithMetrics: (q?: string) =>
    ["sites", "all-with-metrics", q ?? ""] as const,
  summary: ["sites", "summary"] as const,
}

export const useSites = (clientUid: string | undefined) => {
  return useQuery({
    queryKey: SITE_KEYS.byClient(clientUid ?? ""),
    queryFn: () => getSites(clientUid!),
    enabled: !!clientUid,
  })
}

// Portfolio-wide sites (with devices, contract, and billing/coverage
// metrics), used by the dashboard's sites table. The endpoint is cursor
// paginated with no total-count field, so we walk every page to get the
// full list — the dashboard needs it in full anyway, both to render the
// table and to derive the "sites below coverage target" stat.
export const useAllSitesWithMetrics = (params?: { q?: string }) => {
  return useQuery({
    queryKey: SITE_KEYS.allWithMetrics(params?.q),
    queryFn: () =>
      fetchAllCursorPages<SiteWithMetrics>((cursor) =>
        getAllSites({ q: params?.q, limit: 100, next_cursor: cursor })
      ),
  })
}

// Portfolio-wide stat tiles for the dashboard header: MTD production (vs
// last month), cumulative billing since inception, and site health counts.
export const useSitesSummary = () => {
  return useQuery({
    queryKey: SITE_KEYS.summary,
    queryFn: getSitesSummary,
  })
}

export const useSiteStats = (siteUid: string) => {
  const [stats, setStats] = useState<SiteStats | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!siteUid) return
    const cleanup = streamSiteStats(
      siteUid,
      (data) => {
        setStats(data)
        setError(false)
      },
      () => setError(true)
    )
    return cleanup
  }, [siteUid])

  return { stats, error }
}

export const useAddSite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSiteInput) => addSite(payload),
    onSuccess: (response, variables) => {
      toast.success(response.message || "Site added successfully.")
      queryClient.invalidateQueries({
        queryKey: SITE_KEYS.byClient(variables.client_uid),
      })
      queryClient.invalidateQueries({ queryKey: SITE_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ["clients"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add site.")
    },
  })
}
