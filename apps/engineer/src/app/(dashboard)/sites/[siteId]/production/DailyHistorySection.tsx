"use client"

import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ArrowDown, ArrowUp, CircleAlert } from "lucide-react"
import { RangeControl } from "@/app/(dashboard)/components/RangeControl"
import { PRODUCTION_KEYS } from "@/hooks/useSiteOverviews"
import { getProductionHistory } from "@/requests/productionHistory"
import type { ProductionStatus } from "@/types/engineer"
import {
  ISSUE_STATUSES,
  PRODUCTION_STATUS_LABEL,
  fetchRangeFor,
  formatKwh,
  formatRange,
  presetRange,
  rangeLength,
  summarizeRange,
  type DateRange,
  type ProductionPoint,
  type RangePreset,
} from "@/utils/production"
import { ColumnChart, type Column } from "./charts"
import { formatDay } from "./ytdText"

const COLLAPSED_GAPS = 5

function columnFor(p: ProductionPoint, i: number, n: number): Column {
  const every = Math.max(1, Math.ceil(n / 8))
  const issue = ISSUE_STATUSES.has(p.status as ProductionStatus)
  const statusText =
    p.status === "none"
      ? "No record"
      : PRODUCTION_STATUS_LABEL[p.status as ProductionStatus]
  return {
    key: p.date,
    label: (n - 1 - i) % every === 0 ? formatDay(p.date, false) : "",
    value: p.status === "complete" ? p.kwh : null,
    tone: p.status === "complete" ? "complete" : issue ? "issue" : "empty",
    ariaLabel: `${formatDay(p.date)}: ${p.status === "complete" && p.kwh !== null ? formatKwh(p.kwh) : statusText}`,
    tooltip: (
      <>
        <div className="text-muted-foreground">{formatDay(p.date)}</div>
        {p.status === "complete" && p.kwh !== null ? (
          <div className="text-base font-semibold text-[#1D1D1D]">
            {formatKwh(p.kwh)}
          </div>
        ) : (
          <>
            <div
              className={`font-semibold ${issue ? "text-[#B8380D]" : "text-[#1D1D1D]"}`}
            >
              {statusText}
            </div>
            {p.reason && (
              <div className="text-muted-foreground mt-0.5">{p.reason}</div>
            )}
          </>
        )}
      </>
    ),
  }
}

export function DailyHistorySection({ siteId }: { siteId: string }) {
  const [preset, setPreset] = useState<RangePreset>("30d")
  const [range, setRange] = useState<DateRange>(() => presetRange("30d"))
  const [showAllGaps, setShowAllGaps] = useState(false)

  // Fetch the range plus the equal period before it, for the comparison.
  const fetchRange = fetchRangeFor(range)
  const query = useQuery({
    queryKey: PRODUCTION_KEYS.history(siteId, fetchRange.from, fetchRange.to),
    queryFn: () =>
      getProductionHistory(siteId, {
        from_date: fetchRange.from,
        to_date: fetchRange.to,
      }),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })

  const history = query.data?.data
  const summary =
    history && history.site_uid === siteId
      ? summarizeRange(history.items, range)
      : null
  const days = rangeLength(range)
  const gaps = (summary?.strip ?? [])
    .filter((p) => ISSUE_STATUSES.has(p.status as ProductionStatus))
    .reverse()
  const visibleGaps = showAllGaps ? gaps : gaps.slice(0, COLLAPSED_GAPS)

  return (
    <section className="border-border/60 rounded-xl border bg-white">
      <div className="border-border/60 flex flex-col gap-3 border-b px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-[#1D1D1D]">
            Daily production
          </h3>
          <p className="text-muted-foreground text-sm">
            {formatRange(range)} · {days} {days === 1 ? "day" : "days"}
            {history?.timezone ? `, ${history.timezone} time` : ""}
            {query.isFetching && !query.isLoading ? " · Updating…" : ""}
          </p>
        </div>
        <RangeControl
          preset={preset}
          range={range}
          onPreset={(p) => {
            setPreset(p)
            setRange(presetRange(p))
          }}
          onCustom={(r) => {
            setPreset("custom")
            setRange(r)
          }}
        />
      </div>

      <div
        className={`flex flex-col gap-5 p-5 transition-opacity ${query.isFetching && !query.isLoading ? "opacity-70" : ""}`}
      >
        {query.isLoading ? (
          <div className="bg-muted h-72 animate-pulse rounded-lg" />
        ) : query.isError && !summary ? (
          <p className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-red-600">
            Couldn&apos;t load daily production. {query.error.message}
          </p>
        ) : !summary ? null : summary.unsupported ? (
          <p className="text-muted-foreground rounded-lg border border-dashed px-6 py-10 text-center text-sm">
            Production isn&apos;t tracked for this site&apos;s contract.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-x-10 gap-y-3">
              <Figure
                label="Total"
                value={summary.completeDays ? formatKwh(summary.totalKwh) : "—"}
              />
              <Figure
                label="Daily average"
                value={
                  summary.avgDailyKwh !== null
                    ? formatKwh(summary.avgDailyKwh)
                    : "—"
                }
                extra={
                  summary.deltaPct !== null && (
                    <span
                      className={`flex items-center gap-0.5 text-xs ${summary.deltaPct < 0 ? "text-[#B8380D]" : "text-green-700"}`}
                    >
                      {summary.deltaPct < 0 ? (
                        <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUp className="h-3 w-3" />
                      )}
                      {Math.abs(Math.round(summary.deltaPct))}% vs previous{" "}
                      {days === 1 ? "day" : `${days} days`}
                    </span>
                  )
                }
              />
              <Figure
                label="Days with data"
                value={`${summary.completeDays} / ${summary.expectedDays}`}
                extra={
                  summary.issueDays > 0 && (
                    <span className="text-xs text-[#B8380D]">
                      {summary.issueDays}{" "}
                      {summary.issueDays === 1 ? "gap" : "gaps"}
                    </span>
                  )
                }
              />
            </div>

            <ColumnChart
              columns={summary.strip.map((p, i) =>
                columnFor(p, i, summary.strip.length)
              )}
            />

            {gaps.length > 0 && (
              <div className="border-border/60 rounded-lg border">
                <div className="border-border/60 flex items-center gap-2 border-b px-4 py-2.5 text-sm font-semibold text-[#1D1D1D]">
                  <CircleAlert className="h-4 w-4 text-[#FA4F19]" />
                  Days without valid data
                  <span className="text-muted-foreground font-normal">
                    {gaps.length}
                  </span>
                </div>
                <ul className="divide-border/40 divide-y text-sm">
                  {visibleGaps.map((p) => (
                    <li key={p.date} className="flex gap-4 px-4 py-2">
                      <span className="w-28 shrink-0 text-[#1D1D1D]">
                        {formatDay(p.date)}
                      </span>
                      <span className="text-[#B8380D]">
                        {PRODUCTION_STATUS_LABEL[p.status as ProductionStatus]}
                      </span>
                      {p.reason && (
                        <span className="text-muted-foreground">
                          {p.reason}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                {gaps.length > COLLAPSED_GAPS && (
                  <button
                    onClick={() => setShowAllGaps((v) => !v)}
                    className="border-border/60 w-full border-t px-4 py-2 text-sm font-medium text-[#024159] hover:bg-neutral-50"
                  >
                    {showAllGaps ? "Show fewer" : `Show all ${gaps.length}`}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

function Figure({
  label,
  value,
  extra,
}: {
  label: string
  value: string
  extra?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-xl font-semibold text-[#1D1D1D] tabular-nums">
        {value}
      </span>
      {extra}
    </div>
  )
}
