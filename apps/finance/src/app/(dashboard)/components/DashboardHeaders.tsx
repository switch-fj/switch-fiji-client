"use client"

import { ArrowDown, ArrowUp } from "lucide-react"
import type { SiteSummaryMetrics } from "@/types/site"

type DashboardHeadersProps = {
  summary?: SiteSummaryMetrics | null
  isLoadingSummary?: boolean
}

const fmtNum = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 0 })

function StatCard({
  label,
  value,
  deltaDirection,
  deltaText,
  sub,
}: {
  label: string
  value: React.ReactNode
  deltaDirection?: "up" | "down"
  deltaText?: string
  sub?: string
}) {
  return (
    <div className="min-w-[210px] flex-1 rounded-lg border border-neutral-200 bg-white px-5 py-4">
      <p className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-neutral-900">{value}</p>
      {deltaText ? (
        <p
          className={`mt-1 flex items-center gap-1 text-xs font-medium ${
            deltaDirection === "down" ? "text-red-600" : "text-green-600"
          }`}
        >
          {deltaDirection === "down" ? (
            <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUp className="h-3 w-3" />
          )}
          {deltaText}
        </p>
      ) : sub ? (
        <p className="mt-1 text-xs text-neutral-500">{sub}</p>
      ) : null}
    </div>
  )
}

export default function DashboardHeaders({
  summary,
  isLoadingSummary,
}: DashboardHeadersProps) {
  const today = new Date().getDate()

  const productionDelta =
    summary &&
    summary.production_mtd_kwh != null &&
    summary.last_month_production_kwh != null &&
    summary.last_month_production_kwh !== 0
      ? ((summary.production_mtd_kwh - summary.last_month_production_kwh) /
          summary.last_month_production_kwh) *
        100
      : null

  const totalBilled = summary?.total_bill_from_inception
    ? parseFloat(summary.total_bill_from_inception)
    : null

  const health = summary?.site_health

  if (isLoadingSummary) {
    return (
      <div className="flex flex-wrap gap-3 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-[74px] w-[210px] flex-1 animate-pulse rounded-lg border border-neutral-200 bg-neutral-100"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3 px-4 py-3">
      <StatCard
        label={`Production, MTD (Day ${today})`}
        value={
          summary?.production_mtd_kwh != null
            ? `${fmtNum(summary.production_mtd_kwh)} kWh`
            : "—"
        }
        deltaDirection={
          productionDelta != null && productionDelta < 0 ? "down" : "up"
        }
        deltaText={
          productionDelta != null
            ? `${productionDelta >= 0 ? "+" : ""}${productionDelta.toFixed(0)}% vs last month`
            : undefined
        }
        sub={
          summary?.last_month_production_kwh != null
            ? `${fmtNum(summary.last_month_production_kwh)} kWh last month`
            : undefined
        }
      />

      <StatCard
        label="Total Billed"
        value={
          totalBilled != null
            ? `FJD ${totalBilled.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
            : "—"
        }
        sub="since inception"
      />

      <StatCard
        label="Site Health"
        value={health ? `${health.healthy} / ${health.total} healthy` : "—"}
        sub={
          health
            ? `${health.faulty} faulty · ${health.unprovisioned} unprovisioned`
            : undefined
        }
        deltaDirection={health && health.faulty > 0 ? "down" : undefined}
        deltaText={
          health && health.faulty > 0
            ? `${health.faulty} faulty · ${health.unprovisioned} unprovisioned`
            : undefined
        }
      />
    </div>
  )
}
