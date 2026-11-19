"use client"

import { useMemo } from "react"
import { keepPreviousData, useQueries } from "@tanstack/react-query"
import { useEngineerClients } from "@/hooks/useEngineer"
import { getProductionHistory } from "@/requests/productionHistory"
import { useSiteTimezones } from "@/utils/siteTimezone"
import { useActiveAlerts } from "@/hooks/useAlerts"
import type { Alert } from "@/types/alerts"
import { SEVERITY_META } from "@/utils/alerts"
import {
  buildProductionWindow,
  latestCompleteDay,
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
  /** Active (open + acknowledged) alerts from the alerts API, critical
   * first, then most recently detected. */
  alerts: Alert[]
}

/**
 * One row per site across the whole portfolio, joining the engineer client
 * list (sites + device status) with each site's production history.
 *
 * Production history is a per-site endpoint, so this fans out one request per
 * site, cached for 5 minutes. Each site's window ends at its own latest
 * completed day (its timezone, once known — see utils/siteTimezone), since
 * the endpoint rejects any date that's still "today" for the site.
 *
 * The sites table shows the last 14 days compared with the 14 before, which
 * is exactly this 28-day window — so it needs no extra requests.
 */
export function useSiteOverviews() {
  const zones = useSiteTimezones()
  const alertsQuery = useActiveAlerts()

  // Active alerts grouped by site, most severe and most recent first.
  const alertsBySite = useMemo(() => {
    const map = new Map<string, Alert[]>()
    const sorted = [...(alertsQuery.data ?? [])].sort(compareAlerts)
    for (const a of sorted) {
      const list = map.get(a.site_uid)
      if (list) list.push(a)
      else map.set(a.site_uid, [a])
    }
    return map
  }, [alertsQuery.data])
  const clientsQuery = useEngineerClients()
  const clients = clientsQuery.data

  const sites = useMemo(
    () =>
      (clients ?? []).flatMap((client) =>
        client.sites.map((site) => ({
          site,
          client,
          window: buildProductionWindow(latestCompleteDay(zones[site.uid])),
        }))
      ),
    [clients, zones]
  )

  const histories = useQueries({
    queries: sites.map(({ site, window: w }) => ({
      queryKey: PRODUCTION_KEYS.history(site.uid, w.from, w.to),
      queryFn: () =>
        getProductionHistory(site.uid, { from_date: w.from, to_date: w.to }),
      staleTime: 5 * 60 * 1000,
      placeholderData: keepPreviousData,
    })),
  })

  const overviews: SiteOverview[] = sites.map(
    ({ site, client, window: w }, i) => {
      const h = histories[i]
      const items = h?.data?.data.items
      const production = items ? summarizeProduction(items, w) : null
      const range = items ? summarizeRange(items, recentRange(w)) : null
      const state = h?.isError ? "error" : production ? "ready" : "loading"
      return {
        site,
        client,
        devicesTotal: site.devices.length,
        devicesOffline: site.devices.filter((d) => !d.is_online).length,
        production,
        productionState: state,
        alerts: alertsBySite.get(site.uid) ?? [],
        range,
        rangeState: state,
      }
    }
  )

  // Sites can sit in different timezones; headings use the most recent
  // window (most sites are in Fiji, the furthest ahead).
  const window = useMemo(
    () =>
      sites.reduce<ProductionWindow>(
        (best, s) => (s.window.to > best.to ? s.window : best),
        buildProductionWindow(latestCompleteDay(null))
      ),
    [sites]
  )

  return {
    window,
    clients: clients ?? [],
    overviews,
    isLoadingClients: clientsQuery.isLoading,
    isClientsError: clientsQuery.isError,
    isLoadingProduction: histories.some((h) => h.isLoading),
    /** Every active alert, including any for sites not in the client list. */
    activeAlerts: alertsQuery.data,
    isLoadingAlerts: alertsQuery.isLoading,
    alertsError: alertsQuery.error,
  }
}

/** The last 14 days of a window (the table's range; the 14 before it are
 * the comparison period). */
export function recentRange(w: ProductionWindow): DateRange {
  return { from: w.stripDates[0], to: w.to }
}

/** Critical before warning, then most recently detected first. */
export function compareAlerts(a: Alert, b: Alert) {
  return (
    SEVERITY_META[a.severity].rank - SEVERITY_META[b.severity].rank ||
    b.last_detected_at.localeCompare(a.last_detected_at)
  )
}
