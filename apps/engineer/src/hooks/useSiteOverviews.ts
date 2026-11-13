"use client"

import { useMemo } from "react"
import { useQueries } from "@tanstack/react-query"
import { useEngineerClients } from "@/hooks/useEngineer"
import { getProductionHistory } from "@/requests/productionHistory"
import {
  DROP_THRESHOLD_PCT,
  PRODUCTION_STATUS_LABEL,
  buildProductionWindow,
  fetchRangeFor,
  summarizeProduction,
  summarizeRange,
  type DateRange,
  type ProductionSummary,
  type ProductionWindow,
  type RangeSummary,
} from "@/utils/production"
import type {
  EngineeringDashboardClient,
  EngineeringDashboardSite,
} from "@/types/engineer"

export const PRODUCTION_KEYS = {
  all: ["production-history"] as const,
  history: (siteUid: string, from: string, to: string) =>
    ["production-history", siteUid, from, to] as const,
}

export type AttentionKind = "offline" | "data" | "drop"

export type AttentionItem = {
  kind: AttentionKind
  title: string
  detail?: string
}

export type SiteOverview = {
  site: EngineeringDashboardSite
  client: EngineeringDashboardClient
  devicesTotal: number
  devicesOffline: number
  production: ProductionSummary | null
  productionState: "loading" | "error" | "ready"
  /** Production over the user-selected range (sites table). */
  range: RangeSummary | null
  rangeState: "loading" | "error" | "ready"
  /** Most severe first: offline devices, then data gaps, then drops. */
  attention: AttentionItem[]
}

function attentionFor(
  site: EngineeringDashboardSite,
  production: ProductionSummary | null
): AttentionItem[] {
  const items: AttentionItem[] = []

  const offline = site.devices.filter((d) => !d.is_online)
  if (offline.length > 0) {
    items.push({
      kind: "offline",
      title:
        offline.length === site.devices.length
          ? "All devices offline"
          : `${offline.length} of ${site.devices.length} devices offline`,
      detail: offline
        .map((d) =>
          d.meter_role ? `${d.device_type} (${d.meter_role})` : d.device_type
        )
        .join(", "),
    })
  }

  if (production && production.issueDays.length > 0) {
    const latest = production.issueDays[production.issueDays.length - 1]
    const n = production.issueDays.length
    items.push({
      kind: "data",
      title: `No production data for ${n} of the last 7 days`,
      detail:
        latest.reason ??
        PRODUCTION_STATUS_LABEL[
          latest.status as keyof typeof PRODUCTION_STATUS_LABEL
        ],
    })
  }

  if (
    production?.weekDeltaPct != null &&
    production.weekDeltaPct <= DROP_THRESHOLD_PCT
  ) {
    items.push({
      kind: "drop",
      title: `Production down ${Math.abs(Math.round(production.weekDeltaPct))}% on the previous week`,
    })
  }

  return items
}

/**
 * One row per site across the whole portfolio, joining the engineer client
 * list (sites + device status) with each site's production history.
 *
 * Production history is a per-site endpoint, so this fans out one request per
 * site. Results are cached for 5 minutes so navigating back to the dashboard
 * doesn't refetch everything.
 */
export function useSiteOverviews(selectedRange: DateRange) {
  const window: ProductionWindow = useMemo(() => buildProductionWindow(), [])
  const clientsQuery = useEngineerClients()
  const clients = clientsQuery.data

  const sites = useMemo(
    () =>
      (clients ?? []).flatMap((client) =>
        client.sites.map((site) => ({ site, client }))
      ),
    [clients]
  )

  const historyQuery = (siteUid: string, from: string, to: string) => ({
    queryKey: PRODUCTION_KEYS.history(siteUid, from, to),
    queryFn: () =>
      getProductionHistory(siteUid, { from_date: from, to_date: to }),
    staleTime: 5 * 60 * 1000,
  })

  // Recent window: drives the tiles and the attention list.
  const histories = useQueries({
    queries: sites.map(({ site }) =>
      historyQuery(site.uid, window.from, window.to)
    ),
  })

  // Selected range for the sites table. The default range fetches exactly
  // the recent window, so it reuses those requests instead of refetching.
  const rangeFetch = fetchRangeFor(selectedRange)
  const sharesRecent =
    rangeFetch.from === window.from && rangeFetch.to === window.to
  const rangeHistories = useQueries({
    queries: sharesRecent
      ? []
      : sites.map(({ site }) =>
          historyQuery(site.uid, rangeFetch.from, rangeFetch.to)
        ),
  })

  const overviews: SiteOverview[] = sites.map(({ site, client }, i) => {
    const h = histories[i]
    const production = h?.data
      ? summarizeProduction(h.data.data.items, window)
      : null
    const r = sharesRecent ? h : rangeHistories[i]
    const range = r?.data
      ? summarizeRange(r.data.data.items, selectedRange)
      : null
    return {
      site,
      client,
      devicesTotal: site.devices.length,
      devicesOffline: site.devices.filter((d) => !d.is_online).length,
      production,
      productionState: h?.isError ? "error" : production ? "ready" : "loading",
      attention: attentionFor(site, production),
      range,
      rangeState: r?.isError ? "error" : range ? "ready" : "loading",
    }
  })

  return {
    window,
    clients: clients ?? [],
    overviews,
    isLoadingClients: clientsQuery.isLoading,
    isClientsError: clientsQuery.isError,
    isLoadingProduction: histories.some((h) => h.isLoading),
    isFetchingRange: (sharesRecent ? histories : rangeHistories).some(
      (h) => h.isFetching
    ),
  }
}
