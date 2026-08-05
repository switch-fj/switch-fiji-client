"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Info } from "lucide-react"
import { useEngineerClients } from "@/hooks/useEngineer"
import type { EngineeringDashboardClient } from "@/types/engineer"
import { ClientDrawer } from "./ClientDrawer"
import { StatusBadge } from "./StatusBadge"

type SortKey = "sites" | "devices"

function SortableHeader({
  label,
  col,
  active,
  onClick,
}: {
  label: string
  col: SortKey
  active: SortKey | null
  onClick: (col: SortKey) => void
}) {
  return (
    <th
      className="text-foreground cursor-pointer px-4 py-3 text-left text-sm font-semibold select-none"
      onClick={() => onClick(col)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-opacity ${active === col ? "opacity-100" : "opacity-40"}`}
        />
      </span>
    </th>
  )
}

function deriveStatus(client: EngineeringDashboardClient) {
  const allDevices = client.sites.flatMap((s) => s.devices)
  const offlineCount = allDevices.filter((d) => !d.is_online).length
  return {
    status: offlineCount > 0 ? ("meter_offline" as const) : ("active" as const),
    meterOfflineCount: offlineCount,
  }
}

export function ClientStatusTable() {
  const [deviceFilter, setDeviceFilter] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [selectedClient, setSelectedClient] =
    useState<EngineeringDashboardClient | null>(null)

  const { data, isLoading } = useEngineerClients()
  const clients = data?.data.items ?? []

  const toggleSort = (col: SortKey) =>
    setSortKey((prev) => (prev === col ? null : col))

  const filtered = clients.filter((c) => {
    if (deviceFilter === "all") return true
    const { status } = deriveStatus(c)
    if (deviceFilter === "online") return status === "active"
    if (deviceFilter === "offline") return status === "meter_offline"
    return true
  })

  const rows = [...filtered].sort((a, b) => {
    if (!sortKey) return 0
    if (sortKey === "sites") return a.sites.length - b.sites.length
    const aDevices = a.sites.reduce((n, s) => n + s.devices.length, 0)
    const bDevices = b.sites.reduce((n, s) => n + s.devices.length, 0)
    return aDevices - bDevices
  })

  return (
    <>
      <ClientDrawer
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
      />
      <div className="border-border/60 rounded-xl border bg-white px-4 py-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="mb-5 flex items-center gap-2">
            <span className="text-base font-semibold">Client status</span>
            <Info
              className="h-4 w-4 rounded-full border-none bg-[#024159]"
              stroke="#ffff"
            />
          </div>
          <div className="relative">
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="border-border/60 text-foreground focus:ring-primary appearance-none rounded-lg border bg-white py-1.5 pr-8 pl-3 text-sm font-medium outline-none focus:ring-1"
            >
              <option value="all">All device</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
            <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2" />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl">
          <table className="w-full">
            <thead>
              <tr className="bg-[#00AEEF]/40 px-4">
                <th className="text-foreground px-4 py-3 text-left text-sm font-bold">
                  Client name
                </th>
                <SortableHeader
                  label="Sites"
                  col="sites"
                  active={sortKey}
                  onClick={toggleSort}
                />
                <SortableHeader
                  label="Devices"
                  col="devices"
                  active={sortKey}
                  onClick={toggleSort}
                />
                <th className="text-foreground px-4 py-3 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="text-foreground px-4 py-3 text-right text-sm font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-border/40 divide-y">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="bg-muted h-4 w-full animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-muted-foreground px-4 py-8 text-center text-sm"
                  >
                    No clients found
                  </td>
                </tr>
              ) : (
                rows.map((client) => {
                  const { status, meterOfflineCount } = deriveStatus(client)
                  const deviceCount = client.sites.reduce(
                    (n, s) => n + s.devices.length,
                    0
                  )
                  return (
                    <tr
                      key={client.uid}
                      onClick={() => setSelectedClient(client)}
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3.5 text-sm font-medium">
                        {client.client_name}
                      </td>
                      <td className="text-muted-foreground px-4 py-3.5 text-sm">
                        {client.sites.length}
                      </td>
                      <td className="text-muted-foreground px-4 py-3.5 text-sm">
                        {deviceCount}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge
                          status={status}
                          meterOfflineCount={meterOfflineCount}
                        />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <ChevronRight className="text-muted-foreground ml-auto h-4 w-4" />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
