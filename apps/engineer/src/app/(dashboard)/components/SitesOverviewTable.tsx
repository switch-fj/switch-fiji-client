"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { EditSiteDialog } from "./EditSiteDialog"
import { MaintenanceLogDialog } from "../sites/[siteId]/maintenance/MaintenanceLogDialog"
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Eye,
  Pencil,
  Wrench,
  Search,
} from "lucide-react"
import {
  formatKwh,
  formatRange,
  rangeLength,
  type DateRange,
} from "@/utils/production"
import type { SiteOverview } from "@/hooks/useSiteOverviews"
import type { EngineeringDashboardClient } from "@/types/engineer"
import { ProductionStrip, ProductionStripLegend } from "./ProductionStrip"

type FilterKey = "all" | "attention" | "offline"
type SortKey = "total" | "average"
type Sort = { key: SortKey; dir: "asc" | "desc" } | null

const SEVERITY: Record<string, number> = { offline: 0, data: 1, drop: 2 }

function severityOf(o: SiteOverview) {
  return o.attention.length === 0
    ? Infinity
    : Math.min(...o.attention.map((a) => SEVERITY[a.kind]))
}

function sortValue(o: SiteOverview, key: SortKey): number | null {
  const r = o.range
  if (!r || r.unsupported || r.completeDays === 0) return null
  return key === "total" ? r.totalKwh : r.avgDailyKwh
}

export function SitesOverviewTable({
  overviews,
  isLoading,
  isError,
  range,
  onOpenClient,
}: {
  overviews: SiteOverview[]
  isLoading: boolean
  isError: boolean
  range: DateRange
  onOpenClient: (client: EngineeringDashboardClient) => void
}) {
  const router = useRouter()
  const [editing, setEditing] = useState<SiteOverview | null>(null)
  const [logging, setLogging] = useState<SiteOverview | null>(null)
  const [filter, setFilter] = useState<FilterKey>("all")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<Sort>(null)

  const days = rangeLength(range)

  const counts = {
    all: overviews.length,
    attention: overviews.filter((o) => o.attention.length > 0).length,
    offline: overviews.filter((o) => o.devicesOffline > 0).length,
  }

  const term = search.trim().toLowerCase()
  const rows = overviews
    .filter((o) => {
      if (filter === "attention" && o.attention.length === 0) return false
      if (filter === "offline" && o.devicesOffline === 0) return false
      if (!term) return true
      return (
        (o.site.site_name ?? "").toLowerCase().includes(term) ||
        o.client.client_name.toLowerCase().includes(term) ||
        (o.site.gateway_id ?? "").toLowerCase().includes(term)
      )
    })
    .sort((a, b) => {
      if (sort) {
        // Sites without a value always sink to the bottom.
        const av = sortValue(a, sort.key)
        const bv = sortValue(b, sort.key)
        if (av === null && bv === null) return 0
        if (av === null) return 1
        if (bv === null) return -1
        return sort.dir === "asc" ? av - bv : bv - av
      }
      // Default: problems first, then alphabetical by client and site.
      return (
        severityOf(a) - severityOf(b) ||
        a.client.client_name.localeCompare(b.client.client_name) ||
        (a.site.site_name ?? "").localeCompare(b.site.site_name ?? "")
      )
    })

  const toggleSort = (key: SortKey) =>
    setSort((prev) =>
      prev?.key !== key
        ? { key, dir: "desc" }
        : prev.dir === "desc"
          ? { key, dir: "asc" }
          : null
    )

  const tabs: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All sites" },
    { key: "attention", label: "Needs attention" },
    { key: "offline", label: "Devices offline" },
  ]

  return (
    <div className="border-border/60 rounded-xl border bg-white shadow-sm">
      <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div className="flex items-center gap-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`pb-1 text-sm transition-colors ${
                filter === t.key
                  ? "border-b-2 border-[#024159] font-semibold text-[#1D1D1D]"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              {t.label}
              <span className="text-muted-foreground ml-1.5 font-normal">
                {isLoading ? "" : counts[t.key]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search site, client or gateway"
            className="border-border/60 focus:ring-primary h-9 w-64 rounded-lg border bg-white pr-3 pl-8 text-sm outline-none focus:ring-1"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-4">
        <p className="text-sm text-[#1D1D1D]">
          <span className="font-semibold">Last {days} days</span>
          <span className="text-muted-foreground">
            {" "}
            · {formatRange(range)}, compared with the {days} days before. Open a
            site for year to date and custom ranges.
          </span>
        </p>
        <ProductionStripLegend />
      </div>

      <div className="overflow-x-auto p-5">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-sky-100">
              <th className="rounded-l-md px-3 py-2 text-left font-semibold text-[#1D1D1D]">
                Site
              </th>
              <th className="px-3 py-2 text-left font-semibold whitespace-nowrap text-[#1D1D1D]">
                Daily production
              </th>
              <SortableTh
                label="Total"
                active={sort?.key === "total" ? sort.dir : null}
                onClick={() => toggleSort("total")}
              />
              <SortableTh
                label="Daily average"
                active={sort?.key === "average" ? sort.dir : null}
                onClick={() => toggleSort("average")}
              />
              <th className="px-3 py-2 text-left font-semibold text-[#1D1D1D]">
                Data
              </th>
              <th className="px-3 py-2 text-left font-semibold text-[#1D1D1D]">
                Devices
              </th>
              <th className="rounded-r-md px-3 py-2">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [0, 1, 2, 3].map((i) => (
                <tr key={i}>
                  {[0, 1, 2, 3, 4, 5, 6].map((j) => (
                    <td key={j} className="border-border/60 border-b px-3 py-4">
                      <div className="bg-muted h-4 w-full animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-red-600">
                  Couldn&apos;t load sites. Try refreshing the page.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-muted-foreground px-3 py-10 text-center"
                >
                  {overviews.length === 0
                    ? "No sites yet."
                    : term
                      ? `No sites match "${search.trim()}".`
                      : filter === "attention"
                        ? "No sites need attention right now."
                        : "No sites have offline devices."}
                </td>
              </tr>
            ) : (
              rows.map((o, i) => (
                <SiteRow
                  key={o.site.uid}
                  overview={o}
                  days={days}
                  striped={i % 2 === 1}
                  onOpen={() =>
                    router.push(
                      `/sites/${o.site.uid}?name=${encodeURIComponent(o.site.site_name ?? "Site")}`
                    )
                  }
                  onOpenClient={() => onOpenClient(o.client)}
                  onEdit={() => setEditing(o)}
                  onLogMaintenance={() => setLogging(o)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditSiteDialog
          site={editing.site}
          clientUid={editing.client.uid}
          isOpen
          onClose={() => setEditing(null)}
        />
      )}
      <MaintenanceLogDialog
        siteId={logging?.site.uid ?? ""}
        isOpen={logging !== null}
        onClose={() => setLogging(null)}
        existing={null}
      />
    </div>
  )
}

function SortableTh({
  label,
  active,
  onClick,
}: {
  label: string
  active: "asc" | "desc" | null
  onClick: () => void
}) {
  return (
    <th
      className="cursor-pointer px-3 py-2 text-left font-semibold whitespace-nowrap text-[#1D1D1D] select-none"
      onClick={onClick}
      aria-sort={
        active === "asc"
          ? "ascending"
          : active === "desc"
            ? "descending"
            : "none"
      }
    >
      <span className="flex items-center gap-1">
        {label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${active ? "opacity-100" : "opacity-40"} ${active === "asc" ? "rotate-180" : ""}`}
        />
      </span>
    </th>
  )
}

function Skeleton({ width }: { width: string }) {
  return <div className={`bg-muted h-4 animate-pulse rounded ${width}`} />
}

function SiteRow({
  overview: o,
  days,
  striped,
  onOpen,
  onOpenClient,
  onEdit,
  onLogMaintenance,
}: {
  overview: SiteOverview
  days: number
  striped: boolean
  onOpen: () => void
  onOpenClient: () => void
  onEdit: () => void
  onLogMaintenance: () => void
}) {
  const cell = "border-border/60 border-b px-3 py-3 align-middle"
  const r = o.range
  const loading = o.rangeState === "loading"
  const noValue = !r || r.unsupported
  const flagged = o.attention.length > 0

  return (
    <tr
      className={`transition-colors hover:bg-sky-100/60 ${striped ? "bg-sky-50" : "bg-white"}`}
    >
      <td
        className={`${cell} ${flagged ? "shadow-[inset_3px_0_0_#FA4F19]" : ""}`}
      >
        <button
          onClick={onOpen}
          className="block text-left font-semibold text-[#1D1D1D] hover:text-[#024159] hover:underline"
        >
          {o.site.site_name ?? "Unnamed site"}
        </button>
        <button
          onClick={onOpenClient}
          className="text-muted-foreground text-xs hover:text-[#024159] hover:underline"
          title="Open client"
        >
          {o.client.client_name}
        </button>
      </td>

      <td className={cell}>
        <ProductionStrip summary={r} state={o.rangeState} days={days} />
      </td>

      <td className={`${cell} whitespace-nowrap tabular-nums`}>
        {loading ? (
          <Skeleton width="w-20" />
        ) : noValue || r.completeDays === 0 ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <span className="font-medium text-[#1D1D1D]">
            {formatKwh(r.totalKwh)}
          </span>
        )}
      </td>

      <td className={`${cell} whitespace-nowrap tabular-nums`}>
        {loading ? (
          <Skeleton width="w-20" />
        ) : noValue || r.avgDailyKwh === null ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <>
            <span className="block font-medium text-[#1D1D1D]">
              {formatKwh(r.avgDailyKwh)}
            </span>
            {r.deltaPct !== null && (
              <span
                className={`flex items-center gap-0.5 text-xs ${r.deltaPct < 0 ? "text-[#B8380D]" : "text-green-700"}`}
                title="Change in daily average vs the previous period"
              >
                {r.deltaPct < 0 ? (
                  <ArrowDown className="h-3 w-3" />
                ) : (
                  <ArrowUp className="h-3 w-3" />
                )}
                {Math.abs(Math.round(r.deltaPct))}%
              </span>
            )}
          </>
        )}
      </td>

      <td className={`${cell} whitespace-nowrap`}>
        {loading ? (
          <Skeleton width="w-16" />
        ) : noValue ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <>
            <span className="block text-[#1D1D1D] tabular-nums">
              {r.completeDays}/{r.expectedDays} days
            </span>
            {r.issueDays > 0 && (
              <span className="text-xs text-[#B8380D]">
                {r.issueDays} {r.issueDays === 1 ? "gap" : "gaps"}
              </span>
            )}
          </>
        )}
      </td>

      <td className={cell}>
        {o.devicesTotal === 0 ? (
          <span className="text-muted-foreground">None</span>
        ) : o.devicesOffline > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#FA4F19]/15 px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-[#B8380D]">
            <span className="h-2 w-2 rounded-full bg-[#FA4F19]" />
            {o.devicesOffline} of {o.devicesTotal} offline
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {o.devicesTotal} online
          </span>
        )}
      </td>

      <td className={`${cell} text-right`}>
        <div className="flex items-center justify-end gap-0.5">
          <RowAction
            label="View site"
            hint="Live readings, devices, maintenance and alerts"
            onClick={onOpen}
          >
            <Eye className="h-4 w-4" />
          </RowAction>
          <RowAction
            label="Edit site"
            hint="Rename, or change gateway and firmware"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
          </RowAction>
          <RowAction
            label="Log maintenance"
            hint="Record cleaning, servicing or a repair"
            onClick={onLogMaintenance}
            align="end"
          >
            <Wrench className="h-4 w-4" />
          </RowAction>
        </div>
      </td>
    </tr>
  )
}

function RowAction({
  label,
  hint,
  onClick,
  align = "center",
  children,
}: {
  label: string
  /** Short helper line shown under the label in the tooltip. */
  hint: string
  onClick: () => void
  /** "end" keeps the last icon's tooltip from running off the table edge. */
  align?: "center" | "end"
  children: React.ReactNode
}) {
  return (
    <span className="group/action relative inline-flex">
      <button
        onClick={onClick}
        aria-label={label}
        aria-description={hint}
        className="text-muted-foreground rounded-md p-1.5 transition-colors hover:bg-[#024159]/10 hover:text-[#024159] focus-visible:bg-[#024159]/10 focus-visible:text-[#024159] focus-visible:outline-none"
      >
        {children}
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute bottom-full z-20 mb-1.5 w-max max-w-52 rounded-md bg-[#1D1D1D] px-2.5 py-1.5 text-left text-xs opacity-0 shadow-md transition-opacity delay-0 group-focus-within/action:opacity-100 group-hover/action:opacity-100 group-hover/action:delay-300 ${
          align === "end" ? "right-0" : "left-1/2 -translate-x-1/2"
        }`}
      >
        <span className="block font-semibold text-white">{label}</span>
        <span className="block text-white/70">{hint}</span>
      </span>
    </span>
  )
}
