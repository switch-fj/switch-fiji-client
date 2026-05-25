"use client"

const LABEL_MAP: Record<string, string> = {
  load: "Load",
  backup_gen: "Backup Gen",
  solar: "Solar",
  grid: "Grid",
  battery: "Battery",
}

const SLICE_COLORS = ["#F97316", "#1D3D6E", "#22C55E", "#A855F7", "#EF4444"]

type Slice = { key: string; label: string; value: number; color: string }

function parseEnergyMix(raw: string | null): Slice[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as Record<string, number>
    return Object.entries(parsed)
      .filter(([, v]) => typeof v === "number" && v > 0)
      .map(([key, value], i) => ({
        key,
        label: LABEL_MAP[key] ?? key.replace(/_/g, " "),
        value: Number(value),
        color: SLICE_COLORS[i % SLICE_COLORS.length],
      }))
  } catch {
    return []
  }
}

function DonutChart({ slices, total }: { slices: Slice[]; total: number }) {
  const r = 58
  const cx = 88
  const cy = 88
  const strokeWidth = 22
  const circumference = 2 * Math.PI * r

  let cumulativeFraction = 0

  return (
    <svg width="176" height="176" viewBox="0 0 176 176" className="shrink-0">
      {slices.length === 0 ? (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
      ) : (
        slices.map((slice) => {
          const fraction = slice.value / total
          const dashLen = fraction * circumference
          const startDeg = cumulativeFraction * 360 - 90
          cumulativeFraction += fraction
          return (
            <circle
              key={slice.key}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={0}
              transform={`rotate(${startDeg} ${cx} ${cy})`}
            />
          )
        })
      )}
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fontSize="10"
        fill="#6B7280"
        fontWeight="500"
      >
        Total Usage
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fontSize="20"
        fill="#111827"
        fontWeight="700"
      >
        {total > 0 ? Math.round(total) : "—"}
      </text>
      <text x={cx} y={cy + 26} textAnchor="middle" fontSize="10" fill="#9CA3AF">
        kWh
      </text>
    </svg>
  )
}

type Props = {
  energyMix: string | null
  isLoading?: boolean
  periodLabel?: string
}

export default function EnergyMixCard({
  energyMix,
  isLoading,
  periodLabel,
}: Props) {
  const slices = parseEnergyMix(energyMix)
  const total = slices.reduce((sum, s) => sum + s.value, 0)

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="border-b px-6 py-4">
        <h2 className="text-text-1 font-semibold">Energy Mix</h2>
        {periodLabel && (
          <p className="text-muted-foreground mt-0.5 text-xs">{periodLabel}</p>
        )}
      </div>

      {isLoading ? (
        <div className="flex animate-pulse items-center gap-8 p-6">
          <div className="flex-1 space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-200" />
                <div className="h-3 w-24 rounded bg-gray-200" />
              </div>
            ))}
          </div>
          <div className="h-[176px] w-[176px] rounded-full bg-gray-200" />
        </div>
      ) : slices.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-2">
          <p className="text-text-1 text-base font-semibold">No data yet</p>
          <p className="text-muted-foreground text-sm">
            Energy mix data will appear here once available.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-6 px-6 py-5">
            {/* Legend */}
            <div className="flex flex-1 flex-col gap-3">
              {slices.map((slice) => (
                <div key={slice.key} className="flex items-center gap-2.5">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-text-1 text-sm">{slice.label}</span>
                </div>
              ))}
            </div>
            <DonutChart slices={slices} total={total} />
          </div>

          <div className="border-t px-6 pb-5">
            {slices.map((slice) => (
              <div
                key={slice.key}
                className="flex items-center justify-between border-b py-2.5 last:border-b-0"
              >
                <span className="text-text-1 flex items-center gap-2 text-sm">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  {slice.label}
                </span>
                <span className="text-text-1 text-sm font-semibold">
                  {slice.value.toFixed(2)} kWh
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
