import {
  ISSUE_STATUSES,
  PRODUCTION_STATUS_LABEL,
  formatKwh,
  formatShortDay,
  type ProductionPoint,
} from "@/utils/production"

function pointLabel(p: ProductionPoint): string {
  const day = formatShortDay(p.date)
  if (p.status === "complete" && p.kwh !== null)
    return `${day} · ${formatKwh(p.kwh)}`
  if (p.status === "none") return `${day} · No record`
  const label = PRODUCTION_STATUS_LABEL[p.status]
  return p.reason ? `${day} · ${label}: ${p.reason}` : `${day} · ${label}`
}

function barStyle(p: ProductionPoint, max: number) {
  switch (p.status) {
    case "complete": {
      if (!p.kwh || max <= 0)
        return { className: "bg-[#024159]/30", height: "2px" }
      return {
        className: "bg-[#024159]",
        height: `${Math.max(10, (p.kwh / max) * 100)}%`,
      }
    }
    case "pending":
      return { className: "bg-[#00AEEF]/40", height: "30%" }
    case "missing":
    case "invalid":
    case "error":
      return { className: "bg-[#FA4F19]", height: "4px" }
    default:
      // "none" and "unsupported": a neutral floor so the gap is visible.
      return { className: "bg-neutral-300", height: "2px" }
  }
}

/** Strip width grows with the number of days (up to a cap) so bars stay
 * readable from 7 days to 3 months. */
function stripWidth(days: number) {
  return Math.min(360, Math.max(180, days * 9))
}

export function ProductionStrip({
  summary,
  state,
  days = 14,
}: {
  summary: { strip: ProductionPoint[]; unsupported: boolean } | null
  state: "loading" | "error" | "ready"
  /** Expected bar count — sizes the loading skeleton to match. */
  days?: number
}) {
  const width = stripWidth(summary?.strip.length ?? days)

  if (state === "loading") {
    return (
      <div className="bg-muted h-8 animate-pulse rounded" style={{ width }} />
    )
  }
  if (state === "error" || !summary) {
    return (
      <span className="text-muted-foreground text-xs">Couldn&apos;t load</span>
    )
  }
  if (summary.unsupported) {
    return (
      <span className="text-muted-foreground text-xs">
        Production not tracked
      </span>
    )
  }

  // A single day has nothing to compare a bar against, so say what happened
  // instead of drawing one full-width bar.
  if (summary.strip.length === 1) {
    const p = summary.strip[0]
    const ok = p.status === "complete"
    const issue = p.status !== "none" && ISSUE_STATUSES.has(p.status)
    const label = ok
      ? "Reported"
      : p.status === "none"
        ? "No record"
        : PRODUCTION_STATUS_LABEL[p.status]
    return (
      <span className="flex items-center gap-1.5 text-xs" title={pointLabel(p)}>
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            ok ? "bg-[#024159]" : issue ? "bg-[#FA4F19]" : "bg-neutral-300"
          }`}
        />
        <span className={issue ? "text-[#B8380D]" : "text-[#1D1D1D]"}>
          {label}
        </span>
        {p.reason && !ok && (
          <span className="text-muted-foreground truncate">· {p.reason}</span>
        )}
      </span>
    )
  }

  const max = Math.max(
    0,
    ...summary.strip.map((p) => (p.status === "complete" ? (p.kwh ?? 0) : 0))
  )
  const n = summary.strip.length
  const gap = n > 60 ? 1 : n > 30 ? 2 : 3

  return (
    <div
      className="flex h-8 items-end"
      style={{ width, gap }}
      role="img"
      aria-label={`Daily production, ${n} days`}
    >
      {summary.strip.map((p) => {
        const { className, height } = barStyle(p, max)
        return (
          <span
            key={p.date}
            title={pointLabel(p)}
            className={`min-w-px flex-1 ${n > 60 ? "rounded-none" : "rounded-[2px]"} ${className}`}
            style={{ height }}
          />
        )
      })}
    </div>
  )
}

export function ProductionStripLegend() {
  const item = (className: string, label: string, height = "h-2.5") => (
    <span className="flex items-center gap-1.5">
      <span className={`w-1.5 rounded-[1px] ${height} ${className}`} />
      {label}
    </span>
  )
  return (
    <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
      {item("bg-[#024159]", "Produced")}
      {item("bg-[#FA4F19]", "Missing or bad data", "h-1")}
      {item("bg-neutral-300", "No record", "h-0.5")}
    </div>
  )
}
