"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, Pencil, Eye } from "lucide-react"
import type {
  EngineeringDashboardClient,
  EngineeringDashboardSite,
} from "@/types/engineer"
import { useClientSites } from "@/hooks/useEngineer"
import { StatusBadge } from "./StatusBadge"
import { EditClientDialog } from "./EditClientDialog"
import { EditSiteDialog } from "./EditSiteDialog"

function deriveClientStatus(client: EngineeringDashboardClient) {
  const allDevices = client.sites.flatMap((s) => s.devices)
  const offlineCount = allDevices.filter((d) => !d.is_online).length
  return {
    status: offlineCount > 0 ? ("meter_offline" as const) : ("active" as const),
    meterOfflineCount: offlineCount,
  }
}

type ClientDrawerProps = {
  client: EngineeringDashboardClient | null
  onClose: () => void
}

export function ClientDrawer({ client, onClose }: ClientDrawerProps) {
  const router = useRouter()
  const [editClientOpen, setEditClientOpen] = useState(false)
  const [editSite, setEditSite] = useState<EngineeringDashboardSite | null>(
    null
  )

  const { data: sitesData, isLoading: isLoadingSites } = useClientSites(
    client?.uid ?? null
  )
  const sites = sitesData?.data ?? client?.sites ?? []

  const derived = client ? deriveClientStatus(client) : null
  const totalDevices = sites.reduce((n, s) => n + s.devices.length, 0)

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${client ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-[640px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${client ? "translate-x-0" : "translate-x-full"}`}
      >
        {!client ? null : (
          <div className="flex h-full flex-col overflow-y-auto">
            {/* Header */}
            <div className="border-border/60 flex items-center justify-between border-b px-6 py-5">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-[#1D1D1D]">
                  {client.client_name}
                </h2>
                <button
                  onClick={() => setEditClientOpen(true)}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1 transition-colors"
                  title="Edit client"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </div>

            <div className="flex flex-col gap-5 p-6">
              {/* Status + meta */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Status:</span>
                  {derived && (
                    <StatusBadge
                      status={derived.status}
                      meterOfflineCount={derived.meterOfflineCount}
                    />
                  )}
                </div>
                <p className="text-sm text-[#1D1D1D]">
                  Total Sites:{" "}
                  <span className="font-semibold">{sites.length}</span>
                </p>
                <p className="text-sm text-[#1D1D1D]">
                  Total Devices:{" "}
                  <span className="font-semibold">{totalDevices}</span>
                </p>
              </div>

              {/* Sites table */}
              <div className="border-border/60 overflow-hidden rounded-xl border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#00AEEF]/40">
                      <th className="text-foreground px-4 py-3 text-left font-semibold">
                        Site name
                      </th>
                      <th className="text-foreground px-4 py-3 text-left font-semibold">
                        Gateway ID
                      </th>
                      <th className="text-foreground px-4 py-3 text-left font-semibold">
                        Devices
                      </th>
                      <th className="text-foreground px-4 py-3 text-left font-semibold">
                        Status
                      </th>
                      <th className="text-foreground px-4 py-3 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-border/40 divide-y">
                    {isLoadingSites ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 5 }).map((_, j) => (
                            <td key={j} className="px-4 py-3">
                              <div className="bg-muted h-4 w-full animate-pulse rounded" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : sites.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-muted-foreground px-4 py-6 text-center"
                        >
                          No sites found
                        </td>
                      </tr>
                    ) : (
                      sites.map((site) => {
                        const offlineDevices = site.devices.filter(
                          (d) => !d.is_online
                        ).length
                        const siteStatus =
                          offlineDevices > 0
                            ? ("meter_offline" as const)
                            : ("all_online" as const)
                        return (
                          <tr
                            key={site.uid}
                            className="hover:bg-muted/20 bg-white"
                          >
                            <td className="px-4 py-3 font-medium">
                              {site.site_name ?? "—"}
                            </td>
                            <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                              {site.gateway_id}
                            </td>
                            <td className="text-muted-foreground px-4 py-3">
                              {site.devices.length}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge
                                status={siteStatus}
                                meterOfflineCount={offlineDevices}
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/sites/${site.uid}?name=${encodeURIComponent(site.site_name ?? "Site")}`
                                    )
                                  }
                                  className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1 transition-colors"
                                  title="View site"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditSite(site)}
                                  className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1 transition-colors"
                                  title="Edit site"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit client dialog */}
      {client && (
        <EditClientDialog
          client={client}
          isOpen={editClientOpen}
          onClose={() => setEditClientOpen(false)}
        />
      )}

      {/* Edit site dialog */}
      {editSite && client && (
        <EditSiteDialog
          site={editSite}
          clientUid={client.uid}
          isOpen={!!editSite}
          onClose={() => setEditSite(null)}
        />
      )}
    </>
  )
}
