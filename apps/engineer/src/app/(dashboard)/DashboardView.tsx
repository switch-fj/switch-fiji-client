"use client"

import { useState } from "react"
import { useIsFetching, useQueryClient } from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"
import { useEngineerStats, ENGINEER_KEYS } from "@/hooks/useEngineer"
import { ALERT_KEYS } from "@/hooks/useAlerts"
import {
  PRODUCTION_KEYS,
  recentRange,
  useSiteOverviews,
} from "@/hooks/useSiteOverviews"
import type { EngineeringDashboardClient } from "@/types/engineer"
import { OverviewTiles } from "./components/OverviewTiles"
import { AttentionPanel } from "./components/AttentionPanel"
import { SitesOverviewTable } from "./components/SitesOverviewTable"
import { ClientDrawer } from "./components/ClientDrawer"

/** The dashboard is a quick health check: a fixed recent window. Custom
 * ranges, year-to-date and the full history live on each site's page. */
export default function DashboardView() {
  const queryClient = useQueryClient()
  const [drawerClient, setDrawerClient] =
    useState<EngineeringDashboardClient | null>(null)

  const { data: statsData } = useEngineerStats()
  const stats = statsData?.data
  const {
    window,
    overviews,
    isLoadingClients,
    isClientsError,
    isLoadingProduction,
    activeAlerts,
    isLoadingAlerts,
    alertsError,
  } = useSiteOverviews()
  const range = recentRange(window)

  const isRefreshing =
    useIsFetching({ queryKey: ENGINEER_KEYS.clients }) +
      useIsFetching({ queryKey: PRODUCTION_KEYS.all }) >
    0

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["engineer"] })
    queryClient.invalidateQueries({ queryKey: PRODUCTION_KEYS.all })
    queryClient.invalidateQueries({ queryKey: ALERT_KEYS.all })
  }

  // Keep the drawer showing fresh data after a refetch (e.g. after editing).
  const openClient = drawerClient
    ? (overviews.find((o) => o.client.uid === drawerClient.uid)?.client ??
      drawerClient)
    : null

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1D1D1D]">Overview</h1>
          {stats && (
            <p className="text-muted-foreground text-sm">
              {stats.clients} clients · {stats.sites} sites · {stats.devices}{" "}
              devices
            </p>
          )}
        </div>
        <button
          onClick={refresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 text-sm font-medium text-[#FA4F19] hover:opacity-80 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <OverviewTiles
        overviews={overviews}
        window={window}
        isLoadingClients={isLoadingClients}
        isLoadingProduction={isLoadingProduction}
        isLoadingAlerts={isLoadingAlerts}
      />

      <AttentionPanel
        alerts={activeAlerts}
        isLoading={isLoadingAlerts}
        error={alertsError}
      />

      <SitesOverviewTable
        overviews={overviews}
        isLoading={isLoadingClients}
        isError={isClientsError}
        range={range}
        onOpenClient={setDrawerClient}
      />

      <ClientDrawer client={openClient} onClose={() => setDrawerClient(null)} />
    </div>
  )
}
