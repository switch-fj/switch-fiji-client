"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getSites, addSite, streamSiteStats } from "@/requests/site"
import type { CreateSiteInput, SiteStats } from "@/types/site"

export const SITE_KEYS = {
  all: ["sites"] as const,
  byClient: (clientUid: string) => ["sites", clientUid] as const,
}

export const useSites = (clientUid: string | undefined) => {
  return useQuery({
    queryKey: SITE_KEYS.byClient(clientUid ?? ""),
    queryFn: () => getSites(clientUid!),
    enabled: !!clientUid,
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
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add site.")
    },
  })
}
