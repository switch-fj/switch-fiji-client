"use client"

import { useState, type ReactNode } from "react"
import { CircleAlert, Info, Loader2, RefreshCw } from "lucide-react"
import { useProductionYtd } from "@/hooks/useProductionYtd"
import type { ProductionTotals, ProductionYTD } from "@/types/engineer"
import {
  ColumnChart,
  LineChart,
  NAVY,
  TipRow,
  type Column,
  type LinePoint,
} from "./charts"
import {
  COVERAGE_ROWS,
  GROUP_COLOR,
  actualFallback,
  baselineText,
  calculating,
  formatDay,
  formatMonth,
  formatRatio,
  kwhOr,
  unavailable,
} from "./ytdText"

type Mode = "monthly" | "cumulative"

export function YtdSection({ siteId }: { siteId: string }) {
  const ytd = useProductionYtd(siteId)
  const { data } = ytd

  return (
    <section className="border-border/60 rounded-xl border bg-white">
      <div className="border-border/60 flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-[#1D1D1D]">
            Year to date{data ? ` · ${data.year}` : ""}
          </h3>
          <p className="text-muted-foreground text-sm">
            {data?.to_date
              ? `${formatDay(data.from_date)} – ${formatDay(data.to_date)} · completed days, ${data.timezone} time`
              : "Completed days this year, in the site's timezone"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {ytd.isPolling && (
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Calculating remaining days…
            </span>
          )}
          <button
            onClick={() => ytd.checkAgain()}
            disabled={ytd.isFetching}
            className="border-border/60 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-[#1D1D1D] hover:bg-neutral-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${ytd.isFetching ? "animate-spin" : ""}`}
            />
            Check again
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-5">
        {ytd.isLoading ? (
          <Skeleton />
        ) : !data ? (
          <ErrorState kind={ytd.errorKind} message={ytd.error?.message} />
        ) : (
          <YtdBody data={data} stale={!!ytd.error} timedOut={ytd.timedOut} />
        )}
      </div>
    </section>
  )
}

function YtdBody({
  data,
  stale,
  timedOut,
}: {
  data: ProductionYTD
  stale: boolean
  timedOut: boolean
}) {
  const [mode, setMode] = useState<Mode>("monthly")
  const t = data.totals
  const c = t.coverage

  const notices: ReactNode[] = []
  if (stale)
    notices.push(
      <Notice key="stale" tone="warn">
        Couldn&apos;t refresh — showing the last results we loaded.
      </Notice>
    )
  if (data.dispatch_failed)
    notices.push(
      <Notice key="dispatch" tone="warn">
        The calculation service didn&apos;t accept new work, so some days
        haven&apos;t been calculated yet. Try &ldquo;Check again&rdquo; in a few
        minutes.
      </Notice>
    )
  if (timedOut)
    notices.push(
      <Notice key="timeout" tone="info">
        Some days are still being calculated. Results below are partial — use
        &ldquo;Check again&rdquo; to pick up the rest.
      </Notice>
    )
  if (data.baseline_reason)
    notices.push(
      <Notice key="baseline" tone="info">
        {baselineText(data.baseline_reason)}
      </Notice>
    )

  if (!data.to_date || c.calendar_days === 0) {
    return (
      <>
        {notices}
        <Empty
          title={`No completed days in ${data.year} yet`}
          body="The first day of the year becomes available after midnight, site time."
        />
      </>
    )
  }

  if (c.eligible_days === 0) {
    return (
      <>
        {notices}
        <Empty
          title="No eligible days in this period"
          body={`All ${c.calendar_days} days fall outside this site's contract window, so there's nothing to report yet. That isn't the same as zero production.`}
        />
      </>
    )
  }

  return (
    <>
      {notices}

      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          label="Actual production"
          value={kwhOr(t.actual_production_kwh, actualFallback(t))}
          muted={t.actual_production_kwh === null}
          badge={
            t.actual_production_kwh !== null && !t.is_complete
              ? "Partial"
              : undefined
          }
          sub={`${c.complete} of ${c.eligible_days} eligible days`}
        />
        <Stat
          label="Expected for eligible period"
          value={kwhOr(t.expected_production_kwh, "Unavailable")}
          muted={t.expected_production_kwh === null}
          badge={
            t.expected_production_kwh !== null && !t.expected_is_complete
              ? "Partial"
              : undefined
          }
          sub={
            t.expected_is_complete
              ? `Forecast for all ${c.eligible_days} eligible days`
              : `Forecast for ${t.expected_days} of ${c.eligible_days} eligible days`
          }
        />
        <Stat
          label="Actual vs expected on covered days"
          value={
            t.performance_ratio === null
              ? "Comparison unavailable"
              : formatRatio(t.performance_ratio)
          }
          muted={t.performance_ratio === null}
          small={t.performance_ratio === null}
          sub={
            t.comparison_days > 0
              ? `Based on ${t.comparison_days} of ${c.eligible_days} eligible days with both figures`
              : "No days have both actual and expected figures yet"
          }
        />
      </div>

      <div className="border-border/60 rounded-lg border p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-lg bg-neutral-100 p-0.5">
            {(["monthly", "cumulative"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-md px-3 py-1 text-sm transition-colors ${
                  mode === m
                    ? "bg-white font-semibold text-[#1D1D1D] shadow-sm"
                    : "text-muted-foreground hover:text-[#1D1D1D]"
                }`}
              >
                {m === "monthly" ? "By month" : "Running total"}
              </button>
            ))}
          </div>
          <Legend mode={mode} />
        </div>
        {mode === "monthly" ? (
          <ColumnChart columns={monthlyColumns(data)} />
        ) : (
          <LineChart points={cumulativePoints(data)} />
        )}
      </div>

      <Coverage totals={t} />
    </>
  )
}

// ── Chart data ─────────────────────────────────────────────────────────────

function coverageLine(t: ProductionTotals) {
  return `${t.coverage.complete} of ${t.coverage.eligible_days} eligible days`
}

function monthlyColumns(data: ProductionYTD): Column[] {
  return data.months.map((m) => {
    const t = m.totals
    const actual = t.actual_production_kwh
    const tone: Column["tone"] =
      actual === null
        ? calculating(t.coverage) === 0 && unavailable(t.coverage) > 0
          ? "issue"
          : "empty"
        : t.is_complete
          ? "complete"
          : "partial"
    return {
      key: m.month,
      label: formatMonth(m.month),
      value: actual,
      tone,
      expected: t.expected_production_kwh,
      ariaLabel: `${formatMonth(m.month, true)}: actual ${kwhOr(actual, actualFallback(t))}, expected ${kwhOr(t.expected_production_kwh, "unavailable")}`,
      tooltip: (
        <MonthTip
          title={formatMonth(m.month, true)}
          from={m.from_date}
          to={m.to_date}
          totals={t}
        />
      ),
    }
  })
}

function cumulativePoints(data: ProductionYTD): LinePoint[] {
  return data.months.map((m) => {
    const t = m.cumulative
    return {
      key: m.month,
      label: formatMonth(m.month),
      actual: t.actual_production_kwh,
      expected: t.expected_production_kwh,
      // A carried-forward total doesn't mean the month produced nothing —
      // hollow points flag months with gaps.
      partial: !m.totals.is_complete,
      ariaLabel: `Up to ${formatDay(m.to_date)}: actual ${kwhOr(t.actual_production_kwh, "unavailable")}, expected ${kwhOr(t.expected_production_kwh, "unavailable")}`,
      tooltip: (
        <MonthTip
          title={`1 Jan – ${formatDay(m.to_date, false)}`}
          totals={t}
          note={
            !m.totals.is_complete
              ? `${formatMonth(m.month, true)} has days without valid data, so this total is partial.`
              : undefined
          }
        />
      ),
    }
  })
}

function MonthTip({
  title,
  from,
  to,
  totals: t,
  note,
}: {
  title: string
  from?: string
  to?: string
  totals: ProductionTotals
  note?: string
}) {
  const partialMonth =
    from && to && t.coverage.calendar_days < daysInMonth(from)
  return (
    <>
      <div className="font-semibold text-[#1D1D1D]">{title}</div>
      {partialMonth && (
        <div className="text-muted-foreground">
          {formatDay(from!, false)} – {formatDay(to!, false)} so far
        </div>
      )}
      <div className="mt-1.5 flex flex-col gap-1">
        <TipRow
          swatch={
            <span
              className="h-2.5 w-2.5 rounded-[3px]"
              style={{ background: NAVY }}
            />
          }
          label={t.is_complete ? "Actual" : "Actual (partial)"}
          value={kwhOr(t.actual_production_kwh, actualFallback(t))}
        />
        <TipRow
          swatch={<span className="h-0.5 w-2.5 rounded-full bg-[#1D1D1D]" />}
          label="Expected"
          value={kwhOr(t.expected_production_kwh, "Unavailable")}
        />
        {t.performance_ratio !== null && (
          <TipRow
            label="Actual vs expected"
            value={formatRatio(t.performance_ratio)}
          />
        )}
      </div>
      <div className="text-muted-foreground mt-1.5 border-t border-neutral-100 pt-1.5">
        {coverageLine(t)}
        {calculating(t.coverage) > 0 &&
          ` · ${calculating(t.coverage)} calculating`}
        {unavailable(t.coverage) > 0 && (
          <span className="text-[#B8380D]">
            {` · ${unavailable(t.coverage)} unavailable`}
          </span>
        )}
      </div>
      {note && <div className="text-muted-foreground mt-1">{note}</div>}
    </>
  )
}

function daysInMonth(date: string) {
  const [y, m] = date.split("-").map(Number)
  return new Date(y, m, 0).getDate()
}

// ── Pieces ─────────────────────────────────────────────────────────────────

function Legend({ mode }: { mode: Mode }) {
  const item = (swatch: ReactNode, label: string) => (
    <span className="flex items-center gap-1.5">
      {swatch}
      {label}
    </span>
  )
  return (
    <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
      {mode === "monthly" ? (
        <>
          {item(
            <span className="h-2.5 w-2.5 rounded-[3px] bg-[#024159]" />,
            "Actual"
          )}
          {item(
            <span className="h-2.5 w-2.5 rounded-[3px] bg-[#024159]/40" />,
            "Actual, partial month"
          )}
          {item(
            <span className="h-0.5 w-3 rounded-full bg-[#1D1D1D]" />,
            "Expected"
          )}
          {item(
            <span className="h-1 w-2.5 rounded-[1px] bg-[#FA4F19]" />,
            "Unavailable"
          )}
        </>
      ) : (
        <>
          {item(
            <span className="h-0.5 w-3 rounded-full bg-[#024159]" />,
            "Actual"
          )}
          {item(
            <span className="w-3 border-t-2 border-dashed border-[#1D1D1D]/55" />,
            "Expected"
          )}
          {item(
            <span className="h-2 w-2 rounded-full border-2 border-[#024159] bg-white" />,
            "Month has gaps"
          )}
        </>
      )}
    </div>
  )
}

function Coverage({ totals: t }: { totals: ProductionTotals }) {
  const c = t.coverage
  const groups = (["complete", "calculating", "unavailable"] as const).map(
    (g) => ({
      g,
      n: COVERAGE_ROWS.filter((r) => r.group === g).reduce(
        (s, r) => s + c[r.key],
        0
      ),
    })
  )
  const rows = COVERAGE_ROWS.filter((r) => c[r.key] > 0)

  return (
    <div className="border-border/60 rounded-lg border p-4">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold text-[#1D1D1D]">Data coverage</h4>
        <span className="text-muted-foreground text-xs">
          {c.complete} of {c.eligible_days} eligible days have valid production
        </span>
      </div>
      <div
        className="flex h-2 w-full gap-[2px]"
        role="img"
        aria-label={groups.map((x) => `${x.n} ${x.g}`).join(", ")}
      >
        {groups
          .filter((x) => x.n > 0)
          .map((x) => (
            <span
              key={x.g}
              className="dash-fade rounded-full"
              style={{ flexGrow: x.n, background: GROUP_COLOR[x.g] }}
            />
          ))}
      </div>
      <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: GROUP_COLOR[r.group] }}
            />
            <span className="flex-1 text-[#1D1D1D]">{r.label}</span>
            <span className="text-muted-foreground tabular-nums">
              {c[r.key]} {c[r.key] === 1 ? "day" : "days"}
            </span>
          </li>
        ))}
      </ul>
      {c.excluded_days > 0 && (
        <p className="text-muted-foreground mt-3 text-xs">
          {c.excluded_days} {c.excluded_days === 1 ? "day falls" : "days fall"}{" "}
          outside the contract window and{" "}
          {c.excluded_days === 1 ? "isn't" : "aren't"} counted — that&apos;s
          expected, not missing data.
        </p>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  sub,
  badge,
  muted,
  small,
}: {
  label: string
  value: string
  sub: string
  badge?: string
  muted?: boolean
  small?: boolean
}) {
  return (
    <div className="border-border/60 flex flex-col gap-1.5 rounded-lg border px-4 py-3">
      <span className="text-sm text-[#1D1D1D]">{label}</span>
      <span className="flex flex-wrap items-center gap-2">
        <span
          className={`font-semibold ${small ? "text-lg" : "text-2xl"} ${muted ? "text-muted-foreground" : "text-[#1D1D1D]"}`}
        >
          {value}
        </span>
        {badge && (
          <span className="rounded-md bg-[#024159]/10 px-1.5 py-0.5 text-xs font-semibold text-[#024159]">
            {badge}
          </span>
        )}
      </span>
      <span className="text-muted-foreground text-xs">{sub}</span>
    </div>
  )
}

function Notice({
  tone,
  children,
}: {
  tone: "warn" | "info"
  children: ReactNode
}) {
  const Icon = tone === "warn" ? CircleAlert : Info
  return (
    <p
      className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm ${
        tone === "warn"
          ? "bg-[#FA4F19]/10 text-[#B8380D]"
          : "bg-[#CCEFFC]/60 text-[#024159]"
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  )
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed px-6 py-10 text-center">
      <p className="text-sm font-semibold text-[#1D1D1D]">{title}</p>
      <p className="text-muted-foreground max-w-md text-sm">{body}</p>
    </div>
  )
}

function ErrorState({
  kind,
  message,
}: {
  kind: string | null
  message?: string
}) {
  if (kind === "not-found")
    return (
      <Empty
        title="Year-to-date production isn't available yet"
        body="The report hasn't been switched on for this site yet, or the site no longer exists. Daily production below is unaffected."
      />
    )
  if (kind === "forbidden")
    return (
      <Empty
        title="You don't have access to this report"
        body="Year-to-date production is only available to internal staff."
      />
    )
  return (
    <Empty
      title="Couldn't load year-to-date production"
      body={message ?? "Something went wrong. Use “Check again” to retry."}
    />
  )
}

function Skeleton() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-muted h-24 animate-pulse rounded-lg" />
        ))}
      </div>
      <div className="bg-muted h-72 animate-pulse rounded-lg" />
    </>
  )
}
