"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Wrench,
  Sparkles,
  Check,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { Button } from "@workspace/ui"
import { EnumContractType, EnumContractSystemMode } from "@/constants/mangle"
import type { ClientModel } from "@/types/client"
import type { SitePortfolioMetrics, SiteWithMetrics } from "@/types/site"

type SitesOverviewTableProps = {
  sites: SiteWithMetrics[]
  clientsById: Map<string, ClientModel>
  isLoading?: boolean
  isError?: boolean
}

const fmtNum = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 0 })

function systemBadge(contract: SiteWithMetrics["contract"]) {
  if (!contract) return null
  if (contract.contract_type === EnumContractType.LEASE) {
    return { label: "LEASE", tone: "bg-violet-100 text-violet-700" }
  }
  return contract.system_mode === EnumContractSystemMode.OFF_GRID
    ? { label: "OFF-GRID", tone: "bg-amber-100 text-amber-700" }
    : { label: "ON-GRID", tone: "bg-blue-100 text-blue-700" }
}

function productionDeltaPct(m: SitePortfolioMetrics) {
  if (
    m.production_mtd_kwh == null ||
    m.last_month_production_kwh == null ||
    m.last_month_production_kwh === 0
  )
    return null
  return (
    ((m.production_mtd_kwh - m.last_month_production_kwh) /
      m.last_month_production_kwh) *
    100
  )
}

function isBelowTarget(m: SitePortfolioMetrics) {
  return (
    m.coverage_actual_pct != null &&
    m.coverage_target_pct != null &&
    m.coverage_actual_pct < m.coverage_target_pct
  )
}

function ProductionCell({ metrics }: { metrics: SitePortfolioMetrics }) {
  const delta = productionDeltaPct(metrics)
  if (metrics.production_mtd_kwh == null) {
    return <span className="text-muted-foreground text-sm">—</span>
  }
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold">
          {fmtNum(metrics.production_mtd_kwh)} kWh
        </span>
        {delta != null && (
          <span
            className={`text-xs font-medium ${delta < 0 ? "text-red-600" : "text-green-600"}`}
          >
            {delta < 0 ? "▼" : "▲"}
            {Math.abs(delta).toFixed(0)}%
          </span>
        )}
      </div>
      {metrics.last_month_production_kwh != null && (
        <p className="text-muted-foreground text-xs">
          vs {fmtNum(metrics.last_month_production_kwh)} kWh last month
        </p>
      )}
    </div>
  )
}

// ── "Trend, vs Plan" and "Signals" — PREVIEW ONLY ───────────────────────────
// Neither column has a backing field yet: the API has no 3mo/6mo history,
// no sparkline series, and no demand/maintenance signal data (only
// production_mtd_kwh, last_month_production_kwh, coverage, and billing — see
// SitePortfolioMetrics). Per request, these render fixed placeholder values
// matching the mockup pixel-for-pixel so the layout is ready to go; swap
// PLACEHOLDER_SIGNALS for real per-site data once the backend exposes it.
type SparklineShape = "down-steep" | "down-mild" | "up-mild" | "flat"

type PlaceholderSignal = {
  trend3moPct: number
  trend6moPct: number
  sparkline: SparklineShape
  hasWrench: boolean
  hasPendingIcon: boolean
  hasCheck: boolean
  demand: { pct: number | null; direction: "up" | "down" | "steady" } | null
}

const PLACEHOLDER_SIGNALS: PlaceholderSignal[] = [
  {
    trend3moPct: -13,
    trend6moPct: -5,
    sparkline: "down-steep",
    hasWrench: true,
    hasPendingIcon: true,
    hasCheck: false,
    demand: null,
  },
  {
    trend3moPct: -9,
    trend6moPct: -8,
    sparkline: "down-mild",
    hasWrench: false,
    hasPendingIcon: true,
    hasCheck: true,
    demand: { pct: -6, direction: "down" },
  },
  {
    trend3moPct: 1,
    trend6moPct: 0,
    sparkline: "up-mild",
    hasWrench: false,
    hasPendingIcon: false,
    hasCheck: true,
    demand: { pct: 14, direction: "up" },
  },
  {
    trend3moPct: 0,
    trend6moPct: 1,
    sparkline: "flat",
    hasWrench: false,
    hasPendingIcon: false,
    hasCheck: true,
    demand: { pct: null, direction: "steady" },
  },
]

function getPlaceholderSignal(index: number): PlaceholderSignal {
  return PLACEHOLDER_SIGNALS[index % PLACEHOLDER_SIGNALS.length]!
}

const SPARKLINE_PATH: Record<SparklineShape, string> = {
  "down-steep": "M2,4 L20,6 L38,14 L58,18",
  "down-mild": "M2,4 L20,6 L38,10 L58,12",
  "up-mild": "M2,14 L20,12 L38,8 L58,4",
  flat: "M2,9 L20,8 L38,9 L58,8",
}

function Sparkline({ shape }: { shape: SparklineShape }) {
  const isDown = shape.startsWith("down")
  return (
    <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
      <path
        d={SPARKLINE_PATH[shape]}
        stroke={isDown ? "#dc2626" : "#16a34a"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrendCell({ index }: { index: number }) {
  const s = getPlaceholderSignal(index)
  const tone3mo = s.trend3moPct < 0 ? "text-red-600" : "text-green-700"
  const tone6mo = s.trend6moPct < 0 ? "text-red-600" : "text-green-700"
  return (
    <div>
      <Sparkline shape={s.sparkline} />
      <p className={`text-sm font-bold ${tone3mo}`}>
        3mo {s.trend3moPct < 0 ? "▼" : "+"}
        {Math.abs(s.trend3moPct)}%
      </p>
      <p className={`text-sm font-bold ${tone6mo}`}>
        6mo {s.trend6moPct < 0 ? "▼" : "+"}
        {Math.abs(s.trend6moPct)}%
      </p>
    </div>
  )
}

function SignalsCell({ index }: { index: number }) {
  const s = getPlaceholderSignal(index)
  return (
    <div className="flex items-center gap-2">
      {s.hasWrench && (
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100">
          <Wrench className="h-3.5 w-3.5 text-amber-600" />
        </span>
      )}
      {s.hasCheck && (
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-100">
          <Check className="h-3.5 w-3.5 text-neutral-400" />
        </span>
      )}
      {s.hasPendingIcon && (
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-neutral-300">
          <Sparkles className="h-3.5 w-3.5 text-neutral-300" />
        </span>
      )}
      {s.demand && (
        <span
          className={`inline-flex items-center gap-1 rounded-xs px-2 py-1 text-xs font-semibold whitespace-nowrap ${
            s.demand.direction === "down"
              ? "bg-red-100 text-red-700"
              : s.demand.direction === "up"
                ? "bg-green-100 text-green-700"
                : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {s.demand.direction === "down" && <ArrowDown className="h-3 w-3" />}
          {s.demand.direction === "up" && <ArrowUp className="h-3 w-3" />}
          {s.demand.pct != null
            ? `Demand ${s.demand.direction === "down" ? "-" : "+"}${Math.abs(s.demand.pct)}%`
            : "Demand steady"}
        </span>
      )}
    </div>
  )
}

function CoverageCell({ metrics }: { metrics: SitePortfolioMetrics }) {
  if (metrics.coverage_actual_pct == null) {
    return <span className="text-muted-foreground text-sm">—</span>
  }
  const below = isBelowTarget(metrics)
  return (
    <div>
      <span
        className={`text-sm font-semibold ${below ? "text-red-600" : "text-green-600"}`}
      >
        {metrics.coverage_actual_pct.toFixed(0)}%
      </span>
      {metrics.coverage_target_pct != null && (
        <p className="text-muted-foreground text-xs">
          target {metrics.coverage_target_pct.toFixed(0)}%
        </p>
      )}
    </div>
  )
}

function BilledCell({
  metrics,
  currency,
}: {
  metrics: SitePortfolioMetrics
  currency: string
}) {
  const amount = metrics.total_bill_from_inception
    ? parseFloat(metrics.total_bill_from_inception)
    : null
  if (amount == null || Number.isNaN(amount)) {
    return <span className="text-muted-foreground text-sm">—</span>
  }
  return (
    <div>
      <span className="text-sm font-semibold">
        {currency}{" "}
        {amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </span>
      {metrics.billing_frequency && (
        <p className="text-muted-foreground text-xs capitalize">
          billed {metrics.billing_frequency}
        </p>
      )}
    </div>
  )
}

function SiteRow({
  entry,
  client,
  index,
}: {
  entry: SiteWithMetrics
  client: ClientModel | undefined
  index: number
}) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const badge = systemBadge(entry.contract)

  return (
    <>
      <tr className="border-b last:border-0 hover:bg-neutral-50">
        <td className="px-4 py-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 text-left"
          >
            {expanded ? (
              <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
            )}
            <span>
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {client?.client_name ?? "Unknown client"}
                </span>
                {badge && (
                  <span
                    className={`rounded-xs px-1.5 py-0.5 text-[10px] font-semibold ${badge.tone}`}
                  >
                    {badge.label}
                  </span>
                )}
              </span>
              <span className="text-muted-foreground block text-xs">
                {entry.site.site_name ?? "Unnamed site"}
                {entry.site.site_id ? ` · ${entry.site.site_id}` : ""}
              </span>
            </span>
          </button>
        </td>
        <td className="px-4 py-3">
          <ProductionCell metrics={entry.metrics} />
        </td>
        <td className="px-4 py-3">
          <TrendCell index={index} />
        </td>
        <td className="px-4 py-3">
          <SignalsCell index={index} />
        </td>
        <td className="px-4 py-3">
          <CoverageCell metrics={entry.metrics} />
        </td>
        <td className="px-4 py-3">
          <BilledCell
            metrics={entry.metrics}
            currency={entry.contract?.currency ?? "FJD"}
          />
        </td>
      </tr>
      {expanded && (
        <tr className="border-b bg-neutral-50/70 last:border-0">
          <td colSpan={6} className="px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-muted-foreground grid grid-cols-[auto_auto] justify-start gap-x-6 gap-y-1 text-xs">
                <span>Devices</span>
                <span className="text-foreground font-semibold">
                  {entry.devices.length}
                </span>
                <span>Gateway ID</span>
                <span className="text-foreground font-semibold">
                  {entry.site.gateway_id ?? "—"}
                </span>
                <span>Firmware</span>
                <span className="text-foreground font-semibold">
                  {entry.site.firmware ?? "—"}
                </span>
              </div>
              <Button
                className="max-w-40 shrink-0 gap-2 rounded-sm text-sm"
                size="md"
                variant="primary"
                onClick={() =>
                  router.push(
                    `/sites/${entry.site.uid}?` +
                      new URLSearchParams({
                        ...(client?.uid ? { clientUid: client.uid } : {}),
                        ...(entry.contract?.uid
                          ? { contractUid: entry.contract.uid }
                          : {}),
                      }).toString()
                  )
                }
              >
                <ExternalLink className="h-4 w-4" />
                Open Site
              </Button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function SitesOverviewTable({
  sites,
  clientsById,
  isLoading,
  isError,
}: SitesOverviewTableProps) {
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          At or above target
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
          Below target
        </span>
        <span>
          Coverage % is judged against each site&apos;s own target — a low % can
          be green, a high % can be red.
        </span>
      </p>

      <div className="overflow-hidden rounded-md border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-[#E8EEF2] text-left">
              <th className="px-4 py-3 font-semibold">Client</th>
              <th className="px-4 py-3 font-semibold">Production</th>
              <th
                className="px-4 py-3 font-semibold"
                title="Preview layout — not yet wired to live data"
              >
                Trend, vs Plan
              </th>
              <th
                className="px-4 py-3 font-semibold"
                title="Preview layout — not yet wired to live data"
              >
                Signals
              </th>
              <th className="px-4 py-3 font-semibold">Coverage</th>
              <th className="px-4 py-3 font-semibold">Billed</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [0, 1, 2, 3].map((i) => (
                <tr
                  key={i}
                  className={i % 2 === 1 ? "bg-neutral-50" : "bg-white"}
                >
                  {[0, 1, 2, 3, 4, 5].map((j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-destructive px-4 py-8 text-center text-sm"
                >
                  Failed to load sites. Please refresh.
                </td>
              </tr>
            ) : sites.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-muted-foreground px-4 py-8 text-center text-sm"
                >
                  No sites yet.
                </td>
              </tr>
            ) : (
              sites.map((entry, index) => (
                <SiteRow
                  key={entry.site.uid}
                  entry={entry}
                  client={clientsById.get(entry.site.client_uid)}
                  index={index}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
