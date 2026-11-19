"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDown, ArrowUp } from "lucide-react"
import {
  formatKwh,
  formatShortDay,
  type ProductionWindow,
} from "@/utils/production"
import type { SiteOverview } from "@/hooks/useSiteOverviews"

/** Counts up to `value` when it first arrives or changes. */
function CountUp({
  value,
  format = (n) => Math.round(n).toLocaleString(),
}: {
  value: number
  format?: (n: number) => string
}) {
  const [shown, setShown] = useState(0)
  const from = useRef(0)

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const start = from.current
    if (reduce || start === value) {
      from.current = value
      setShown(value)
      return
    }
    const t0 = performance.now()
    const duration = 900
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - (1 - p) ** 3
      const v = start + (value - start) * eased
      from.current = v
      setShown(v)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])

  return <>{format(shown)}</>
}

/** Tiny daily columns: earlier days faint, the highlighted period in navy. */
function SparkBars({
  points,
  highlightFrom,
}: {
  points: { date: string; kwh: number | null }[]
  highlightFrom: number
}) {
  const max = Math.max(0, ...points.map((p) => p.kwh ?? 0))
  return (
    <div className="flex h-9 items-end gap-[3px]" aria-hidden>
      {points.map((p, i) => {
        const on = i >= highlightFrom
        const h =
          p.kwh === null || max === 0
            ? 2
            : Math.max(3, Math.round((p.kwh / max) * 36))
        return (
          <span
            key={p.date}
            title={`${formatShortDay(p.date)} · ${p.kwh === null ? "No data" : formatKwh(p.kwh)}`}
            className={`dash-grow flex-1 rounded-t-[2px] ${
              p.kwh === null
                ? "bg-neutral-200"
                : on
                  ? "bg-[#024159]"
                  : "bg-[#024159]/20"
            }`}
            style={{ height: h, animationDelay: `${150 + i * 25}ms` }}
          />
        )
      })}
    </div>
  )
}

function Tile({
  label,
  value,
  sub,
  subTone = "muted",
  footer,
  isLoading,
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  subTone?: "muted" | "good" | "bad"
  footer?: React.ReactNode
  isLoading?: boolean
}) {
  const tone =
    subTone === "good"
      ? "text-green-700"
      : subTone === "bad"
        ? "text-[#B8380D]"
        : "text-muted-foreground"
  return (
    <div className="border-border/60 flex min-w-[220px] flex-1 flex-col gap-2 rounded-xl border bg-white px-5 py-4 shadow-sm">
      <span className="text-sm text-[#1D1D1D]">{label}</span>
      {isLoading ? (
        <>
          <div className="bg-muted h-9 w-28 animate-pulse rounded" />
          <div className="bg-muted h-3 w-36 animate-pulse rounded" />
          <div className="bg-muted mt-auto h-9 w-full animate-pulse rounded" />
        </>
      ) : (
        <>
          <span className="text-3xl font-semibold text-[#1D1D1D]">{value}</span>
          {sub && (
            <span className={`flex items-center gap-1 text-xs ${tone}`}>
              {sub}
            </span>
          )}
          {footer && <div className="mt-auto pt-2">{footer}</div>}
        </>
      )}
    </div>
  )
}

export function OverviewTiles({
  overviews,
  window: win,
  isLoadingClients,
  isLoadingProduction,
  isLoadingAlerts,
}: {
  overviews: SiteOverview[]
  window: ProductionWindow
  isLoadingClients: boolean
  isLoadingProduction: boolean
  isLoadingAlerts: boolean
}) {
  const withProduction = overviews.filter(
    (o) => o.production && !o.production.unsupported
  )

  // Portfolio total per day across the window; null where no site reported.
  const daily = win.dates.map((date, i) => {
    let kwh = 0
    let any = false
    for (const o of withProduction) {
      const p = o.production!.days[i]
      if (p?.status === "complete" && p.kwh !== null) {
        kwh += p.kwh
        any = true
      }
    }
    return { date, kwh: any ? kwh : null }
  })
  const last14 = daily.slice(-14)

  // Yesterday
  const reportedYesterday = withProduction.filter(
    (o) => o.production!.yesterday.status === "complete"
  )
  const yesterdayKwh = reportedYesterday.reduce(
    (sum, o) => sum + (o.production!.yesterday.kwh ?? 0),
    0
  )

  // Last 7 days, and a portfolio week-on-week change built only from sites
  // whose own comparison is fair (enough complete days in both weeks).
  const last7Kwh = withProduction.reduce(
    (sum, o) => sum + o.production!.last7Kwh,
    0
  )
  const comparable = withProduction.filter(
    (o) => o.production!.weekDeltaPct !== null
  )
  let weekDelta: number | null = null
  if (comparable.length > 0) {
    let now = 0
    let before = 0
    for (const o of comparable) {
      const p = o.production!
      const avgNow = p.last7Kwh / p.last7CompleteDays
      now += avgNow
      before += avgNow / (1 + p.weekDeltaPct! / 100)
    }
    weekDelta = before > 0 ? ((now - before) / before) * 100 : null
  }

  // Devices
  const devicesTotal = overviews.reduce((n, o) => n + o.devicesTotal, 0)
  const devicesOffline = overviews.reduce((n, o) => n + o.devicesOffline, 0)
  const devicesOnline = devicesTotal - devicesOffline
  const sitesWithOffline = overviews.filter((o) => o.devicesOffline > 0).length

  // Alerts (from the alerts API, via each overview)
  const needsAttention = overviews.filter((o) => o.alerts.length > 0).length
  const alerts = overviews.flatMap((o) => o.alerts)
  const criticalCount = alerts.filter((a) => a.severity === "critical").length
  const warningCount = alerts.length - criticalCount

  const productionLoading = isLoadingClients || isLoadingProduction

  return (
    <div className="flex flex-wrap gap-4">
      <Tile
        label={`Yesterday · ${formatShortDay(win.yesterday)}`}
        value={
          reportedYesterday.length > 0 ? (
            <CountUp value={yesterdayKwh} format={formatKwh} />
          ) : (
            "—"
          )
        }
        sub={
          withProduction.length > 0
            ? `${reportedYesterday.length} of ${withProduction.length} sites reported`
            : undefined
        }
        subTone={
          reportedYesterday.length < withProduction.length ? "bad" : "muted"
        }
        footer={
          withProduction.length > 0 && (
            <SparkBars points={last14} highlightFrom={13} />
          )
        }
        isLoading={productionLoading}
      />
      <Tile
        label="Last 7 days"
        value={
          withProduction.length > 0 ? (
            <CountUp value={last7Kwh} format={formatKwh} />
          ) : (
            "—"
          )
        }
        sub={
          weekDelta !== null ? (
            <>
              {weekDelta < 0 ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUp className="h-3 w-3" />
              )}
              {Math.abs(Math.round(weekDelta))}% vs previous week (daily avg)
            </>
          ) : (
            "Not enough data to compare weeks"
          )
        }
        subTone={weekDelta === null ? "muted" : weekDelta < 0 ? "bad" : "good"}
        footer={
          withProduction.length > 0 && (
            <SparkBars points={last14} highlightFrom={7} />
          )
        }
        isLoading={productionLoading}
      />
      <Tile
        label="Devices online"
        value={
          devicesTotal > 0 ? (
            <>
              <CountUp value={devicesOnline} />
              <span className="text-muted-foreground text-xl font-normal">
                {" "}
                / {devicesTotal}
              </span>
            </>
          ) : (
            "—"
          )
        }
        sub={
          devicesOffline > 0
            ? `${devicesOffline} offline across ${sitesWithOffline} ${sitesWithOffline === 1 ? "site" : "sites"}`
            : devicesTotal > 0
              ? "All devices reporting"
              : undefined
        }
        subTone={devicesOffline > 0 ? "bad" : "muted"}
        footer={
          devicesTotal > 0 && (
            <div
              className="flex h-2 w-full gap-[2px]"
              role="img"
              aria-label={`${devicesOnline} of ${devicesTotal} devices online`}
            >
              {devicesOnline > 0 && (
                <span
                  className="dash-fade rounded-full bg-[#024159]"
                  style={{ flexGrow: devicesOnline }}
                />
              )}
              {devicesOffline > 0 && (
                <span
                  className="dash-fade rounded-full bg-[#FA4F19]"
                  style={{ flexGrow: devicesOffline, animationDelay: "200ms" }}
                />
              )}
            </div>
          )
        }
        isLoading={isLoadingClients}
      />
      <Tile
        label="Sites with active alerts"
        value={
          <>
            <CountUp value={needsAttention} />
            <span className="text-muted-foreground text-xl font-normal">
              {" "}
              / {overviews.length}
            </span>
          </>
        }
        sub={
          isLoadingAlerts
            ? "Checking alerts…"
            : alerts.length === 0
              ? "No active alerts"
              : [
                  criticalCount && `${criticalCount} critical`,
                  warningCount && `${warningCount} warning`,
                ]
                  .filter(Boolean)
                  .join(" · ")
        }
        subTone={criticalCount > 0 && !isLoadingAlerts ? "bad" : "muted"}
        footer={
          overviews.length > 0 && (
            // One square per site, coloured by its most severe alert.
            <div className="flex flex-wrap gap-[3px]" aria-hidden>
              {[...overviews]
                .sort((a, b) => b.alerts.length - a.alerts.length)
                .map((o, i) => (
                  <span
                    key={o.site.uid}
                    title={`${o.site.site_name ?? "Unnamed site"}${o.alerts.length ? ` · ${o.alerts[0].title}` : " · No alerts"}`}
                    className={`dash-fade h-2.5 w-2.5 rounded-[3px] ${
                      !o.alerts.length
                        ? "bg-[#024159]/20"
                        : o.alerts[0].severity === "critical"
                          ? "bg-[#FA4F19]"
                          : "bg-amber-500"
                    }`}
                    style={{ animationDelay: `${i * 40}ms` }}
                  />
                ))}
            </div>
          )
        }
        isLoading={isLoadingClients}
      />
    </div>
  )
}
