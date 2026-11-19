"use client"

import { useMemo } from "react"
import { useEngineerClients } from "@/hooks/useEngineer"
import type {
  EngineeringDashboardClient,
  EngineeringDashboardDevice,
  EngineeringDashboardSite,
} from "@/types/engineer"

export type SiteEntry = {
  site: EngineeringDashboardSite
  client: EngineeringDashboardClient
}

/** Looks up sites and devices by uid from the engineer client list (already
 * cached by the dashboard), so alerts can show names instead of uids. */
export function useSiteDirectory() {
  const { data: clients, isLoading } = useEngineerClients()

  return useMemo(() => {
    const sites = new Map<string, SiteEntry>()
    const devices = new Map<string, EngineeringDashboardDevice>()
    for (const client of clients ?? []) {
      for (const site of client.sites) {
        sites.set(site.uid, { site, client })
        for (const d of site.devices) devices.set(d.uid, d)
      }
    }
    return {
      isLoading,
      sites: [...sites.values()],
      site: (uid: string) => sites.get(uid),
      device: (uid: string | null) => (uid ? devices.get(uid) : undefined),
    }
  }, [clients, isLoading])
}

export const siteName = (entry?: SiteEntry) =>
  entry?.site.site_name ?? "Unnamed site"

export const deviceName = (d?: {
  device_type: string
  meter_role: string | null
}) => {
  if (!d) return null
  const type = d.device_type.charAt(0).toUpperCase() + d.device_type.slice(1)
  return d.meter_role ? `${type} · ${d.meter_role}` : type
}
