import type { ProductionDay, ProductionStatus } from "@/types/engineer"
import { localDateToDateString } from "@/utils/date"

/** Days with one of these statuses mean the site should have produced data
 * but didn't — worth an engineer's attention. ("unsupported" is a site that
 * can't be metered for production at all, so it's not flagged.) */
export const ISSUE_STATUSES: ReadonlySet<ProductionStatus> = new Set([
  "missing",
  "invalid",
  "error",
])

export const PRODUCTION_STATUS_LABEL: Record<ProductionStatus, string> = {
  pending: "In progress",
  complete: "Complete",
  missing: "No data",
  invalid: "Invalid reading",
  unsupported: "Not supported",
  error: "Error",
}

/** Week-on-week change at or below this is called out as a production drop. */
export const DROP_THRESHOLD_PCT = -20

/** A week's average only counts if at least this many days are complete —
 * otherwise a couple of missing days would read as a fake drop. */
const MIN_COMPLETE_DAYS_FOR_TREND = 4

/**
 * Timezone the sites run in. Production-history counts days in the site's
 * own timezone, but the engineer clients list doesn't include it (it only
 * comes back in the production response, after the dates are chosen) — so
 * dates are worked out in Fiji time rather than the viewer's browser time.
 * Without this, a viewer behind Fiji (e.g. in Nigeria) would lag a whole day
 * behind for most of their afternoon.
 */
export const SITE_TIMEZONE = "Pacific/Fiji"

/** Today's date, "YYYY-MM-DD", in the sites' timezone. */
export function siteToday(now = new Date(), timeZone = SITE_TIMEZONE): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

/**
 * The newest date production-history will accept: yesterday in the site's
 * timezone. The endpoint only serves completed days, so asking for the
 * site's today is rejected.
 */
export function latestCompleteDay(now = new Date()): string {
  return shiftDate(siteToday(now), -1)
}

export type ProductionWindow = {
  /** Fetch range, "YYYY-MM-DD". */
  from: string
  to: string
  yesterday: string
  /** Every date from `from` to `to`, oldest first (the portfolio chart). */
  dates: string[]
  /** 14 dates ending yesterday, oldest first — what the strip draws. */
  stripDates: string[]
  /** The 7 complete days ending yesterday, and the 7 before them. */
  last7: string[]
  prev7: string[]
}

export function buildProductionWindow(now = new Date()): ProductionWindow {
  const today = siteToday(now)
  const day = (offset: number) => shiftDate(today, offset)
  const range = (fromOffset: number, toOffset: number) =>
    Array.from({ length: toOffset - fromOffset + 1 }, (_, i) =>
      day(fromOffset + i)
    )

  return {
    // Ends yesterday: the endpoint rejects today (see latestCompleteDay).
    // Reaches back 28 days (not just the 14 the tiles need) so it exactly
    // matches the sites table's default "14 days vs previous 14" fetch — the
    // two share one request per site.
    from: day(-28),
    to: day(-1),
    yesterday: day(-1),
    dates: range(-28, -1),
    stripDates: range(-14, -1),
    last7: range(-7, -1),
    prev7: range(-14, -8),
  }
}

export type ProductionPoint = {
  date: string
  /** "none" = the API returned no row for this date. */
  status: ProductionStatus | "none"
  kwh: number | null
  reason: string | null
}

export type ProductionSummary = {
  /** One point per date in the whole window. */
  days: ProductionPoint[]
  strip: ProductionPoint[]
  yesterday: ProductionPoint
  last7Kwh: number
  last7CompleteDays: number
  /** Average-daily change vs the previous week; null when either week has
   * too few complete days to compare fairly. */
  weekDeltaPct: number | null
  /** Days in the last 7 with missing / invalid / error status. */
  issueDays: ProductionPoint[]
  /** Every day in the window is "unsupported". */
  unsupported: boolean
}

export function summarizeProduction(
  items: ProductionDay[],
  window: ProductionWindow
): ProductionSummary {
  const byDate = new Map(items.map((d) => [d.date_at.slice(0, 10), d]))

  const point = (date: string): ProductionPoint => {
    const d = byDate.get(date)
    if (!d) return { date, status: "none", kwh: null, reason: null }
    return {
      date,
      status: d.status,
      kwh:
        d.status === "complete" && typeof d.production_kwh === "number"
          ? d.production_kwh
          : null,
      reason: formatReason(d.reason),
    }
  }

  const completeKwh = (dates: string[]) => {
    const kwhs = dates
      .map(point)
      .filter((p) => p.status === "complete" && p.kwh !== null)
      .map((p) => p.kwh as number)
    return { total: kwhs.reduce((a, b) => a + b, 0), days: kwhs.length }
  }

  const last7 = completeKwh(window.last7)
  const prev7 = completeKwh(window.prev7)
  const canCompare =
    last7.days >= MIN_COMPLETE_DAYS_FOR_TREND &&
    prev7.days >= MIN_COMPLETE_DAYS_FOR_TREND
  const prevAvg = canCompare ? prev7.total / prev7.days : 0
  const weekDeltaPct =
    canCompare && prevAvg > 0
      ? ((last7.total / last7.days - prevAvg) / prevAvg) * 100
      : null

  const allDates = [...window.prev7, ...window.last7]

  return {
    days: window.dates.map(point),
    strip: window.stripDates.map(point),
    yesterday: point(window.yesterday),
    last7Kwh: last7.total,
    last7CompleteDays: last7.days,
    weekDeltaPct,
    issueDays: window.last7
      .map(point)
      .filter((p) => ISSUE_STATUSES.has(p.status as ProductionStatus)),
    unsupported:
      items.length > 0 &&
      allDates.every((date) => point(date).status === "unsupported"),
  }
}

/** Plain-English versions of the reason codes production-history returns. */
const REASON_TEXT: Record<string, string> = {
  missing_contract_configuration: "Site has no contract set up",
  missing_boundary_reading: "No meter reading at the start or end of the day",
}

/** Turns a reason code like "missing_boundary_reading" into readable text.
 * Unknown codes fall back to the code with underscores as spaces. */
export function formatReason(reason?: string | null): string | null {
  if (!reason) return null
  if (REASON_TEXT[reason]) return REASON_TEXT[reason]
  if (!/^[a-z0-9_]+$/.test(reason)) return reason
  const text = reason.replace(/_/g, " ")
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatKwh(kwh: number): string {
  if (kwh >= 10_000) {
    return `${(kwh / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} MWh`
  }
  return `${kwh.toLocaleString(undefined, {
    maximumFractionDigits: kwh >= 100 ? 0 : 1,
  })} kWh`
}

/** "Tue 11 Nov" from a "YYYY-MM-DD" string, without timezone drift. */
export function formatShortDay(date: string): string {
  const [y, m, d] = date.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

// ── Selectable date ranges (sites table) ────────────────────────────────────

/** Inclusive range of "YYYY-MM-DD" dates. */
export type DateRange = { from: string; to: string }

export type RangePreset =
  | "yesterday"
  | "7d"
  | "14d"
  | "30d"
  | "month"
  | "custom"

export const RANGE_PRESETS: {
  key: Exclude<RangePreset, "custom">
  label: string
}[] = [
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "7 days" },
  { key: "14d", label: "14 days" },
  { key: "30d", label: "30 days" },
  { key: "month", label: "This month" },
]

export const DEFAULT_RANGE_PRESET: RangePreset = "14d"

/** Longest custom range — beyond this the daily bars get too thin to read and
 * every site's request gets heavy. */
export const MAX_RANGE_DAYS = 92

export function parseDateString(date: string): Date {
  const [y, m, d] = date.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function shiftDate(date: string, days: number): string {
  const d = parseDateString(date)
  d.setDate(d.getDate() + days)
  return localDateToDateString(d)
}

export function datesInRange(range: DateRange): string[] {
  const out: string[] = []
  for (let d = range.from; d <= range.to; d = shiftDate(d, 1)) out.push(d)
  return out
}

export function rangeLength(range: DateRange): number {
  const ms =
    parseDateString(range.to).getTime() - parseDateString(range.from).getTime()
  return Math.round(ms / 86_400_000) + 1
}

/** The period of equal length immediately before `range`. */
export function previousRange(range: DateRange): DateRange {
  const len = rangeLength(range)
  return { from: shiftDate(range.from, -len), to: shiftDate(range.from, -1) }
}

/** What to request for `range`: the range itself plus the previous period,
 * so the table can show a comparison from a single call per site. */
export function fetchRangeFor(range: DateRange): DateRange {
  return { from: previousRange(range).from, to: range.to }
}

export function presetRange(
  preset: Exclude<RangePreset, "custom">,
  now = new Date()
): DateRange {
  // Presets cover completed days only, ending yesterday.
  const end = latestCompleteDay(now)
  switch (preset) {
    case "yesterday":
      return { from: end, to: end }
    case "7d":
      return { from: shiftDate(end, -6), to: end }
    case "14d":
      return { from: shiftDate(end, -13), to: end }
    case "30d":
      return { from: shiftDate(end, -29), to: end }
    case "month":
      // Month to date. On the 1st there are no completed days yet this
      // month, so it shows last month in full.
      return { from: `${end.slice(0, 8)}01`, to: end }
  }
}

export function formatRange(range: DateRange): string {
  const from = parseDateString(range.from)
  const to = parseDateString(range.to)
  const sameYear = from.getFullYear() === to.getFullYear()
  const fmt = (d: Date, withYear: boolean) =>
    d.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      ...(withYear ? { year: "numeric" } : {}),
    })
  return range.from === range.to
    ? fmt(to, true)
    : `${fmt(from, !sameYear)} – ${fmt(to, true)}`
}

export type RangeSummary = {
  strip: ProductionPoint[]
  totalKwh: number
  completeDays: number
  /** Days that should have data by now (everything except "pending"). */
  expectedDays: number
  issueDays: number
  avgDailyKwh: number | null
  /** Average-daily change vs the previous period of equal length; null when
   * either period has fewer than half its days complete. */
  deltaPct: number | null
  unsupported: boolean
}

export function summarizeRange(
  items: ProductionDay[],
  range: DateRange
): RangeSummary {
  const byDate = new Map(items.map((d) => [d.date_at.slice(0, 10), d]))
  const point = (date: string): ProductionPoint => {
    const d = byDate.get(date)
    if (!d) return { date, status: "none", kwh: null, reason: null }
    return {
      date,
      status: d.status,
      kwh:
        d.status === "complete" && typeof d.production_kwh === "number"
          ? d.production_kwh
          : null,
      reason: formatReason(d.reason),
    }
  }

  const stats = (r: DateRange) => {
    const pts = datesInRange(r).map(point)
    const complete = pts.filter(
      (p) => p.status === "complete" && p.kwh !== null
    )
    const total = complete.reduce((a, p) => a + (p.kwh as number), 0)
    return { pts, total, days: complete.length }
  }

  const current = stats(range)
  const previous = stats(previousRange(range))
  const minDays = Math.max(1, Math.ceil(rangeLength(range) / 2))
  const canCompare = current.days >= minDays && previous.days >= minDays
  const prevAvg = canCompare ? previous.total / previous.days : 0

  return {
    strip: current.pts,
    totalKwh: current.total,
    completeDays: current.days,
    expectedDays: current.pts.filter((p) => p.status !== "pending").length,
    issueDays: current.pts.filter((p) =>
      ISSUE_STATUSES.has(p.status as ProductionStatus)
    ).length,
    avgDailyKwh: current.days > 0 ? current.total / current.days : null,
    deltaPct:
      canCompare && prevAvg > 0
        ? ((current.total / current.days - prevAvg) / prevAvg) * 100
        : null,
    unsupported:
      items.length > 0 && current.pts.every((p) => p.status === "unsupported"),
  }
}
