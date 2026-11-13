import type { ProductionCoverage, ProductionTotals } from "@/types/engineer"
import { formatKwh, parseDateString } from "@/utils/production"

/** "12 Nov 2026" from "YYYY-MM-DD" — built as a local date, so no UTC shift. */
export function formatDay(date: string, withYear = true) {
  return parseDateString(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  })
}

/** "Jan" / "January 2026" from "YYYY-MM". */
export function formatMonth(month: string, long = false) {
  const [y, m] = month.split("-").map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(
    undefined,
    long ? { month: "long", year: "numeric" } : { month: "short" }
  )
}

/** kWh, or a word when the value is null. Zero stays "0 kWh". */
export function kwhOr(value: number | null, fallback: string) {
  return value === null ? fallback : formatKwh(value)
}

export function formatRatio(ratio: number) {
  return `${(ratio * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`
}

export const BASELINE_TEXT: Record<string, string> = {
  missing_baseline_configuration:
    "Expected production hasn't been configured for this site.",
  invalid_baseline_commissioning:
    "The forecast commissioning date needs correcting.",
  invalid_baseline_schedule:
    "The expected-production schedule needs correcting.",
  baseline_month_alignment_mismatch:
    "The forecast schedule doesn't line up with the site's commissioning month.",
  incomplete_baseline_coverage:
    "Expected production is only available for part of this period.",
}

export const baselineText = (reason: string) =>
  BASELINE_TEXT[reason] ??
  "There's a problem with this site's expected-production forecast."

export const calculating = (c: ProductionCoverage) => c.pending + c.unqueued

export const unavailable = (c: ProductionCoverage) =>
  c.missing + c.invalid + c.unsupported + c.failed

/** What to show instead of a null actual: still working, or given up. */
export function actualFallback(t: ProductionTotals) {
  return calculating(t.coverage) > 0 ? "Calculating…" : "Unavailable"
}

export const COVERAGE_ROWS: {
  key: keyof ProductionCoverage
  label: string
  group: "complete" | "calculating" | "unavailable"
}[] = [
  { key: "complete", label: "Valid production", group: "complete" },
  { key: "pending", label: "Calculating now", group: "calculating" },
  { key: "unqueued", label: "Waiting to be calculated", group: "calculating" },
  { key: "missing", label: "Missing meter readings", group: "unavailable" },
  {
    key: "invalid",
    label: "Invalid configuration or readings",
    group: "unavailable",
  },
  {
    key: "unsupported",
    label: "Not supported for this contract",
    group: "unavailable",
  },
  { key: "failed", label: "Calculation failed", group: "unavailable" },
]

export const GROUP_COLOR = {
  complete: "#024159",
  calculating: "#9ec5f4",
  unavailable: "#FA4F19",
} as const
