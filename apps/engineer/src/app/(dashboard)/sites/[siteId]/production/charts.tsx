"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

/**
 * Small hand-rolled SVG charts for the site Production tab. One series in
 * navy, an optional "expected" marker, recessive grid, hover tooltip that
 * also opens on keyboard focus. Null values are gaps — never drawn as zero.
 */

export const NAVY = "#024159"
const PARTIAL = "rgba(2, 65, 89, 0.4)"
const ISSUE = "#FA4F19"
const EXPECTED = "#1D1D1D"
const GRID = "#EEF0F2"
const AXIS = "#D4D7DB"
const M = { top: 16, right: 8, bottom: 28, left: 52 }

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) =>
      setWidth(Math.floor(entry.contentRect.width))
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

/** Rounds an axis step to 1 / 2 / 2.5 / 5 × 10ⁿ. */
function niceStep(raw: number) {
  if (raw <= 0) return 1
  const pow = 10 ** Math.floor(Math.log10(raw))
  const n = raw / pow
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pow
}

const tickLabel = (v: number) =>
  v >= 10_000
    ? `${(v / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}K`
    : v.toLocaleString()

function yScale(max: number, plotH: number) {
  const step = niceStep(max / 4)
  const top = Math.max(step, Math.ceil(max / step) * step)
  const ticks = Array.from(
    { length: Math.round(top / step) + 1 },
    (_, i) => i * step
  )
  return { ticks, scale: (v: number) => (v / top) * plotH }
}

function topRoundedPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, h, w / 2)
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`
}

function Grid({
  ticks,
  scale,
  baseline,
  left,
  right,
  unit,
}: {
  ticks: number[]
  scale: (v: number) => number
  baseline: number
  left: number
  right: number
  unit: string
}) {
  return (
    <>
      {ticks.map((t) => {
        const y = baseline - scale(t)
        return (
          <g key={t}>
            <line
              x1={left}
              x2={right}
              y1={y}
              y2={y}
              stroke={t === 0 ? AXIS : GRID}
            />
            <text
              x={left - 8}
              y={y}
              dy="0.32em"
              textAnchor="end"
              className="fill-neutral-500 text-[11px] tabular-nums"
            >
              {tickLabel(t)}
            </text>
          </g>
        )
      })}
      <text
        x={left - 8}
        y={M.top - 6}
        textAnchor="end"
        className="fill-neutral-500 text-[11px]"
      >
        {unit}
      </text>
    </>
  )
}

function Tooltip({
  x,
  width,
  children,
}: {
  x: number
  width: number
  children: ReactNode
}) {
  const flip = x > width / 2
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute top-0 z-10 w-60 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-xs shadow-lg"
      style={flip ? { right: width - x + 12 } : { left: x + 12 }}
    >
      {children}
    </div>
  )
}

// ── Columns ────────────────────────────────────────────────────────────────

export type ColumnTone = "complete" | "partial" | "issue" | "empty"

export type Column = {
  key: string
  /** Axis label; empty string to skip this column's label. */
  label: string
  value: number | null
  tone: ColumnTone
  /** Optional expected value, drawn as a dark tick across the slot. */
  expected?: number | null
  tooltip: ReactNode
  ariaLabel: string
}

export function ColumnChart({
  columns,
  height = 240,
  unit = "kWh",
}: {
  columns: Column[]
  height?: number
  unit?: string
}) {
  const [ref, width] = useWidth()
  const [hover, setHover] = useState<number | null>(null)

  const plotW = Math.max(0, width - M.left - M.right)
  const plotH = height - M.top - M.bottom
  const baseline = M.top + plotH
  const max = Math.max(
    0,
    ...columns.map((c) => c.value ?? 0),
    ...columns.map((c) => c.expected ?? 0)
  )
  const { ticks, scale } = yScale(max, plotH)
  const band = columns.length ? plotW / columns.length : 0
  const barW = Math.min(24, Math.max(3, band * 0.6))
  const markW = Math.min(40, Math.max(6, band * 0.8))
  const cx = (i: number) => M.left + i * band + band / 2

  return (
    <div ref={ref} className="relative" onPointerLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={height} className="block overflow-visible">
          <Grid
            ticks={ticks}
            scale={scale}
            baseline={baseline}
            left={M.left}
            right={M.left + plotW}
            unit={unit}
          />
          {columns.map((c, i) => {
            const x = cx(i) - barW / 2
            const dim = hover !== null && hover !== i
            let mark: ReactNode = null
            if (c.tone === "issue") {
              mark = (
                <rect
                  x={x}
                  y={baseline - 4}
                  width={barW}
                  height={4}
                  rx={1}
                  fill={ISSUE}
                />
              )
            } else if (c.value === null || c.tone === "empty") {
              mark = (
                <rect
                  x={x}
                  y={baseline - 2}
                  width={barW}
                  height={2}
                  fill="#D4D7DB"
                />
              )
            } else {
              // A real zero still gets a visible 2px stub.
              const h = Math.max(2, scale(c.value))
              mark = (
                <path
                  d={topRoundedPath(x, baseline - h, barW, h)}
                  fill={c.tone === "partial" ? PARTIAL : NAVY}
                />
              )
            }
            return (
              <g
                key={c.key}
                className="dash-grow transition-opacity duration-150"
                style={{
                  animationDelay: `${i * 20}ms`,
                  opacity: dim ? 0.35 : 1,
                }}
              >
                {mark}
                {c.expected != null && (
                  <line
                    x1={cx(i) - markW / 2}
                    x2={cx(i) + markW / 2}
                    y1={baseline - scale(c.expected)}
                    y2={baseline - scale(c.expected)}
                    stroke={EXPECTED}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                )}
              </g>
            )
          })}
          {columns.map((c, i) =>
            c.label ? (
              <text
                key={`${c.key}-label`}
                x={cx(i)}
                y={baseline + 18}
                textAnchor="middle"
                className="fill-neutral-500 text-[11px]"
              >
                {c.label}
              </text>
            ) : null
          )}
          {columns.map((c, i) => (
            <rect
              key={`${c.key}-hit`}
              x={M.left + i * band}
              y={M.top}
              width={band}
              height={plotH + 8}
              fill="transparent"
              tabIndex={0}
              aria-label={c.ariaLabel}
              onPointerEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="outline-none"
            />
          ))}
        </svg>
      )}
      {hover !== null && columns[hover] && (
        <Tooltip x={cx(hover)} width={width}>
          {columns[hover].tooltip}
        </Tooltip>
      )}
    </div>
  )
}

// ── Lines ──────────────────────────────────────────────────────────────────

export type LinePoint = {
  key: string
  label: string
  actual: number | null
  expected: number | null
  /** Draw this point hollow — the value is a partial/carried-forward total. */
  partial: boolean
  tooltip: ReactNode
  ariaLabel: string
}

/** Splits a series into runs of consecutive non-null points. */
function runs(values: (number | null)[]) {
  const out: { i: number; v: number }[][] = []
  let cur: { i: number; v: number }[] = []
  values.forEach((v, i) => {
    if (v === null) {
      if (cur.length) out.push(cur)
      cur = []
    } else cur.push({ i, v })
  })
  if (cur.length) out.push(cur)
  return out
}

export function LineChart({
  points,
  height = 240,
  unit = "kWh",
}: {
  points: LinePoint[]
  height?: number
  unit?: string
}) {
  const [ref, width] = useWidth()
  const [hover, setHover] = useState<number | null>(null)

  const plotW = Math.max(0, width - M.left - M.right)
  const plotH = height - M.top - M.bottom
  const baseline = M.top + plotH
  const max = Math.max(
    0,
    ...points.map((p) => p.actual ?? 0),
    ...points.map((p) => p.expected ?? 0)
  )
  const { ticks, scale } = yScale(max, plotH)
  const band = points.length ? plotW / points.length : 0
  const cx = (i: number) => M.left + i * band + band / 2
  const cy = (v: number) => baseline - scale(v)

  const path = (run: { i: number; v: number }[]) =>
    run.map((p, k) => `${k ? "L" : "M"}${cx(p.i)},${cy(p.v)}`).join("")

  const actualRuns = runs(points.map((p) => p.actual))
  const expectedRuns = runs(points.map((p) => p.expected))

  return (
    <div ref={ref} className="relative" onPointerLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={height} className="block overflow-visible">
          <Grid
            ticks={ticks}
            scale={scale}
            baseline={baseline}
            left={M.left}
            right={M.left + plotW}
            unit={unit}
          />

          {hover !== null && (
            <line
              x1={cx(hover)}
              x2={cx(hover)}
              y1={M.top}
              y2={baseline}
              stroke={AXIS}
            />
          )}

          {/* Expected: dashed, the forecast convention */}
          {expectedRuns.map((run, k) => (
            <path
              key={`e${k}`}
              d={path(run)}
              fill="none"
              stroke={EXPECTED}
              strokeOpacity={0.55}
              strokeWidth={2}
              strokeDasharray="5 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Actual: navy line over a light wash */}
          {actualRuns.map((run, k) => (
            <g key={`a${k}`} className="dash-fade">
              {run.length > 1 && (
                <path
                  d={`${path(run)}L${cx(run[run.length - 1].i)},${baseline}L${cx(run[0].i)},${baseline}Z`}
                  fill={NAVY}
                  fillOpacity={0.08}
                />
              )}
              <path
                d={path(run)}
                fill="none"
                stroke={NAVY}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          ))}
          {points.map((p, i) =>
            p.actual === null ? null : (
              <circle
                key={`${p.key}-dot`}
                cx={cx(i)}
                cy={cy(p.actual)}
                r={hover === i ? 5 : 4}
                fill={p.partial ? "white" : NAVY}
                stroke={p.partial ? NAVY : "white"}
                strokeWidth={2}
              />
            )
          )}

          {points.map((p, i) => (
            <text
              key={`${p.key}-label`}
              x={cx(i)}
              y={baseline + 18}
              textAnchor="middle"
              className="fill-neutral-500 text-[11px]"
            >
              {p.label}
            </text>
          ))}

          {points.map((p, i) => (
            <rect
              key={`${p.key}-hit`}
              x={M.left + i * band}
              y={M.top}
              width={band}
              height={plotH + 8}
              fill="transparent"
              tabIndex={0}
              aria-label={p.ariaLabel}
              onPointerEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="outline-none"
            />
          ))}
        </svg>
      )}
      {hover !== null && points[hover] && (
        <Tooltip x={cx(hover)} width={width}>
          {points[hover].tooltip}
        </Tooltip>
      )}
    </div>
  )
}

/** Tooltip row: value first, then the series name. */
export function TipRow({
  swatch,
  label,
  value,
}: {
  swatch?: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2">
      {swatch}
      <span className="text-muted-foreground min-w-0 flex-1 truncate">
        {label}
      </span>
      <span className="font-medium text-[#1D1D1D] tabular-nums">{value}</span>
    </div>
  )
}
