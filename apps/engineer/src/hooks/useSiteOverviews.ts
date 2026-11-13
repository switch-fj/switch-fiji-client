"use client"

import { useMemo } from "react"
import { keepPreviousData, useQueries } from "@tanstack/react-query"
import { useEngineerClients } from "@/hooks/useEngineer"
import { getProductionHistory } from "@/requests/productionHistory"
import { useSiteTimezones } from "@/utils/siteTimezone"
import {
  DROP_THRESHOLD_PCT,
  PRODUCTION_STATUS_LABEL,
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
 * site, cached for 5 minutes. Each site's window ends at its own latest
 * completed day (its timezone, once known — see utils/siteTimezone), since
 * the endpoint rejects any date that's still "today" for the site.
 *
 * The sites table shows the last 14 days compared with the 14 before, which
 * is exactly this 28-day window — so it needs no extra requests.
 */
export function useSiteOverviews() {
  const zones = useSiteTimezones()
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
        attention: attentionFor(site, production),
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
  }
}

/** The last 14 days of a window (the table's range; the 14 before it are
 * the comparison period). */
export function recentRange(w: ProductionWindow): DateRange {
  return { from: w.stripDates[0], to: w.to }
}
