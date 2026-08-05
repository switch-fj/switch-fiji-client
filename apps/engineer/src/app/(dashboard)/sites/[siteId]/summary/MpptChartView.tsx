"use client"

import { Fragment, useState } from "react"
import { ChevronDown, ChevronLeft, ChevronUp, Pencil, Plus } from "lucide-react"
import { DatePickerInput } from "@workspace/ui"
import { useSitePvs, useSiteDegradation } from "@/hooks/useSitePv"
import {
  useSitePanels,
  useSiteStringWiring,
  useSiteDevices,
} from "@/hooks/useSitePanels"
import { useSiteMpptFunctionCheck } from "@/hooks/useMpptCheck"
import { formatIsoDateOnly, isoDateOnlyToLocalDate } from "@/utils/date"
import type {
  SiteDeviceModel,
  SitePanelRef,
  StringWiringItemInput,
  StringWiringSchematicItem,
  MpptFunctionRow,
  ExpectedMpptARow,
  MpptFnCheckTimeSlot,
} from "@/types/engineer"
import { PvSummaryDialog } from "./PvSummaryDialog"
import { DegradationDialog } from "./DegradationDialog"
import { PanelConfigDialog } from "./PanelConfigDialog"
import { StringWiringDialog } from "./StringWiringDialog"

const TABS = [
  "Chart View",
  "Panel Config",
  "PV Summary",
  "Battery SOC",
] as const

// ---- Chart View ----

const CHART_SERIES = [
  {
    id: "1.1",
    color: "#00822E",
    values: [2, 3, 5, 25, 55, 70, 78, 74, 60, 52, 30, 10],
  },
  {
    id: "1.2",
    color: "#FA4F19",
    values: [2, 4, 8, 30, 58, 75, 82, 79, 64, 55, 32, 12],
  },
  {
    id: "2.1",
    color: "#024159",
    values: [1, 3, 6, 22, 50, 68, 76, 72, 58, 48, 28, 9],
  },
  {
    id: "2.2",
    color: "#8B5CF6",
    values: [2, 3, 7, 28, 54, 72, 80, 77, 62, 53, 31, 11],
  },
  {
    id: "31",
    color: "#00AEEF",
    values: [3, 5, 9, 32, 60, 78, 85, 81, 66, 57, 34, 14],
  },
  {
    id: "3.2",
    color: "#4B5563",
    values: [1, 2, 4, 20, 48, 66, 74, 70, 56, 46, 26, 8],
  },
] as const

const CHART_TIMES = [
  "9:00am",
  "9:30am",
  "10:00am",
  "10:30am",
  "11:00am",
  "11:30am",
  "12:00pm",
  "12:30pm",
  "1:00pm",
  "1:30pm",
  "2:00pm",
  "2:30pm",
]

const CHART_Y_LABELS = [
  "100%",
  "90%",
  "80%",
  "70%",
  "60%",
  "50%",
  "40%",
  "30%",
  "20%",
  "10%",
  "0%",
]

const TABLE_TIMES = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
]

// ---- Panel Config ----

// ---- Battery SOC ----

const BATTERY_CHART_SERIES = [
  {
    id: "1.1",
    color: "#00822E",
    values: [20, 42, 58, 68, 80, 88, 68, 62, 78, 86, 50, 65],
  },
  {
    id: "1.2",
    color: "#FA4F19",
    values: [65, 72, 80, 85, 90, 80, 88, 90, 80, 90, 70, 88],
  },
]

const BATTERY_TIME_CHECK = [
  {
    id: "Battery1.1",
    values: [20, 50, 60, 67, 75, 90, 67, 64, 74, 87, 45, 65, 77],
  },
  {
    id: "Battery1.2",
    values: [99, 100, 98, 99, 99, 98, 98, 90, 88, 91, 91, 44, 91],
  },
]

function pathFromValues(
  values: readonly number[],
  width: number,
  height: number
) {
  const step = width / (values.length - 1)
  return values
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${i * step},${height - (v / 100) * height}`
    )
    .join(" ")
}

const CHART_WIDTH = 480
const CHART_HEIGHT = 220

function LineChart({
  series,
  yLabels,
  xLabels,
}: {
  series: readonly { id: string; color: string; values: readonly number[] }[]
  yLabels: readonly string[]
  xLabels: readonly string[]
}) {
  const rowCount = yLabels.length - 1
  const colCount = xLabels.length - 1

  return (
    <div className="flex gap-2">
      <div className="text-muted-foreground flex flex-col justify-between py-1 text-[10px]">
        {yLabels.map((y) => (
          <span key={y}>{y}</span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="h-56 w-full"
          preserveAspectRatio="none"
        >
          {yLabels.map((_, i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={(i / rowCount) * CHART_HEIGHT}
              x2={CHART_WIDTH}
              y2={(i / rowCount) * CHART_HEIGHT}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}
          {xLabels.map((_, i) => (
            <line
              key={`v${i}`}
              x1={(i / colCount) * CHART_WIDTH}
              y1="0"
              x2={(i / colCount) * CHART_WIDTH}
              y2={CHART_HEIGHT}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}
          {series.map((s) => (
            <path
              key={s.id}
              d={pathFromValues(s.values, CHART_WIDTH, CHART_HEIGHT)}
              fill="none"
              stroke={s.color}
              strokeWidth="1.5"
            />
          ))}
        </svg>
        <div className="text-muted-foreground mt-1 flex justify-between text-[10px]">
          {xLabels.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function TableBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-sky-100 px-3 py-2 text-center text-sm font-semibold text-[#1D1D1D]">
      {children}
    </div>
  )
}

type MpptChartViewProps = {
  siteId: string
  onBack: () => void
}

export function MpptChartView({ siteId, onBack }: MpptChartViewProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [checkDate, setCheckDate] = useState(() => new Date())

  const { data: pvsRes } = useSitePvs(siteId)
  const commissionedAt = pvsRes?.data?.commissioned_at ?? null
  const minCheckDate = commissionedAt
    ? isoDateOnlyToLocalDate(commissionedAt)
    : undefined
  const maxCheckDate = new Date()
  const checkDateMatchers = minCheckDate
    ? [{ before: minCheckDate }, { after: maxCheckDate }]
    : [{ after: maxCheckDate }]

  const dateAt = Math.floor(checkDate.getTime() / 1000)
  const { data: mpptCheckRes, isLoading: isMpptCheckLoading } =
    useSiteMpptFunctionCheck(siteId, dateAt, activeTab === 0)
  const mpptCheckRecords = mpptCheckRes?.data?.mppt_fn_check_table_str
    ? parseMpptFnCheckTable(mpptCheckRes.data.mppt_fn_check_table_str)
    : []

  return (
    <div className="flex flex-col">
      {/* Header */}
      <button
        onClick={onBack}
        className="border-border/60 hover:bg-muted/20 flex w-full items-center gap-3 border-b px-6 py-5 text-left transition-colors"
      >
        <ChevronLeft className="text-muted-foreground h-6 w-6" />
        <h1 className="text-xl font-bold text-[#1D1D1D]">Dashboard</h1>
      </button>

      <div className="flex flex-col gap-5 p-6">
        <div className="border-border/60 rounded-xl border p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              {TABS.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`pb-1 text-sm font-medium transition-colors ${
                    activeTab === i
                      ? "border-b-2 border-[#024159] font-semibold text-[#1D1D1D]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 0 || activeTab === 3 ? (
              <div className="flex items-center gap-2">
                <button className="border-border/60 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-[#1D1D1D]">
                  This week <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button className="border-border/60 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-[#1D1D1D]">
                  All <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}
          </div>

          {activeTab === 0 && <ChartViewPanel />}
          {activeTab === 1 && <PanelConfigPanel siteId={siteId} />}
          {activeTab === 2 && <PvSummaryPanel siteId={siteId} />}
          {activeTab === 3 && <BatterySocPanel />}
        </div>

        {activeTab === 0 && (
          <CollapsibleTable
            title="MPPT function Check"
            headerRight={
              <DatePickerInput
                value={checkDate}
                onChange={(d) => d && setCheckDate(d)}
                disabledDates={checkDateMatchers}
                className="h-9 text-xs"
              />
            }
          >
            {isMpptCheckLoading ? (
              <div className="bg-muted h-16 w-full animate-pulse rounded-lg" />
            ) : (
              <MpptFunctionCheckTable records={mpptCheckRecords} />
            )}
          </CollapsibleTable>
        )}

        {activeTab === 3 && (
          <CollapsibleTable title="Time Check">
            <BatteryTimeCheckTable />
          </CollapsibleTable>
        )}
      </div>
    </div>
  )
}

function ChartViewPanel() {
  return (
    <>
      <LineChart
        series={CHART_SERIES}
        yLabels={CHART_Y_LABELS}
        xLabels={CHART_TIMES}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <ul className="flex flex-wrap items-center gap-5">
          {CHART_SERIES.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-1.5 text-sm text-[#1D1D1D]"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.id}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-6 text-sm">
          <span className="text-[#1D1D1D]">
            p_total_w (Generator){" "}
            <span className="font-semibold text-[#FA4F19]">1300kW</span>
          </span>
          <span className="text-[#1D1D1D]">
            p_total_w (Site){" "}
            <span className="font-semibold text-[#FA4F19]">15300kW</span>
          </span>
        </div>
      </div>
    </>
  )
}

function CollapsibleTable({
  title,
  headerRight,
  children,
}: {
  title: string
  headerRight?: React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-border/60 rounded-xl border">
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <h3 className="text-base font-semibold text-[#1D1D1D]">{title}</h3>
        </button>
        <div className="flex items-center gap-3">
          {headerRight}
          <button onClick={() => setOpen((v) => !v)}>
            {open ? (
              <ChevronUp className="text-muted-foreground h-4 w-4" />
            ) : (
              <ChevronDown className="text-muted-foreground h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      {open && <div className="overflow-x-auto px-5 pb-5">{children}</div>}
    </div>
  )
}

function parseMpptFnCheckTable(raw: string): MpptFnCheckTimeSlot[] {
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as MpptFnCheckTimeSlot[]) : []
  } catch {
    return []
  }
}

/** `time_at` comes as 24-hour "HH:MM:SS" — display it like the rest of the
 * app's time columns, e.g. "9:00 AM". */
function formatTimeAt(timeAt: string): string {
  const [hh, mm] = timeAt.split(":").map(Number)
  const period = hh >= 12 ? "PM" : "AM"
  const hour12 = hh % 12 === 0 ? 12 : hh % 12
  return `${hour12}:${String(mm).padStart(2, "0")} ${period}`
}

/** Pivots the per-time-slot readings (each with a nested `mppt_keys` list)
 * into a Time header row + an Ir row + one value/pct row-pair per mppt_key. */
function pivotMpptFnCheck(slots: MpptFnCheckTimeSlot[]) {
  const times = slots.map((s) => formatTimeAt(s.time_at))
  const mpptKeys = Array.from(
    new Set(slots.flatMap((s) => s.mppt_keys.map((m) => m.mppt_key)))
  )

  return {
    times,
    irRow: slots.map((s) => s.ir_w_per_m2),
    rows: mpptKeys.map((key) => ({
      key,
      values: slots.map(
        (s) => s.mppt_keys.find((m) => m.mppt_key === key)?.pvn_ip ?? null
      ),
      pct: slots.map(
        (s) => s.mppt_keys.find((m) => m.mppt_key === key)?.pct ?? null
      ),
    })),
  }
}

function MpptFunctionCheckTable({
  records,
}: {
  records: MpptFnCheckTimeSlot[]
}) {
  const { times, irRow, rows } = pivotMpptFnCheck(records)
  const columnCount = times.length + 1

  if (times.length === 0) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">
        No MPPT function check data for this date.
      </p>
    )
  }

  return (
    <table className="w-full border-separate border-spacing-0 text-sm">
      <thead>
        <tr className="bg-sky-100">
          <th className="rounded-l-md px-3 py-2 text-left font-semibold text-[#1D1D1D]">
            Time
          </th>
          {times.map((t, i) => (
            <th
              key={t}
              className={`px-3 py-2 text-left font-semibold whitespace-nowrap text-[#1D1D1D] ${
                i === times.length - 1 ? "rounded-r-md" : ""
              }`}
            >
              {t}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="px-3 py-2 font-medium">Ir</td>
          {irRow.map((v, i) => (
            <td key={i} className="px-3 py-2">
              {v ?? "—"}
            </td>
          ))}
        </tr>
        <tr aria-hidden>
          <td colSpan={columnCount} className="h-2" />
        </tr>
        {rows.map((row, i) => {
          const bg = i === 0 ? "bg-white" : "bg-sky-50"
          return (
            <Fragment key={row.key}>
              <tr className={bg}>
                <td className="border-border/60 rounded-tl-md border-t border-l px-3 py-2 font-medium">
                  {row.key}
                </td>
                {row.values.map((v, j) => (
                  <td
                    key={j}
                    className={`border-border/60 border-t px-3 py-2 ${
                      j === row.values.length - 1
                        ? "rounded-tr-md border-r"
                        : ""
                    }`}
                  >
                    {v ?? "—"}
                  </td>
                ))}
              </tr>
              <tr className={bg}>
                <td className="border-border/60 rounded-bl-md border-b border-l px-3 py-2 font-medium">
                  %
                </td>
                {row.pct.map((p, j) => (
                  <td
                    key={j}
                    className={`border-border/60 border-b px-3 py-2 ${
                      j === row.pct.length - 1 ? "rounded-br-md border-r" : ""
                    }`}
                  >
                    {p === null ? (
                      "—"
                    ) : (
                      <span
                        className={
                          p < 92
                            ? "rounded-md bg-red-100 px-2 py-0.5 text-red-700"
                            : ""
                        }
                      >
                        {Math.round(p)}%
                      </span>
                    )}
                  </td>
                ))}
              </tr>
              {i < rows.length - 1 && (
                <tr aria-hidden>
                  <td colSpan={columnCount} className="h-2" />
                </tr>
              )}
            </Fragment>
          )
        })}
      </tbody>
    </table>
  )
}

/**
 * `string_input` is a JSON-encoded array of the raw rows originally
 * submitted — used to prefill the edit form.
 */
function parseStringInput(raw: string): StringWiringItemInput[] {
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as StringWiringItemInput[]) : []
  } catch {
    return []
  }
}

/**
 * `wring_schematics` is a JSON-encoded array of server-computed per-string
 * rows (panel spec + totals already resolved) — used to render the String
 * Summary table.
 */
function parseWiringSchematics(raw: string): StringWiringSchematicItem[] {
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as StringWiringSchematicItem[]) : []
  } catch {
    return []
  }
}

function parseMpptFnTable(raw: string): MpptFunctionRow[] {
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as MpptFunctionRow[]) : []
  } catch {
    return []
  }
}

function parseExpectedMpptATable(raw: string): ExpectedMpptARow[] {
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ExpectedMpptARow[]) : []
  } catch {
    return []
  }
}

/** `expected_mppt_a_table` is a flat list of (ir_wm2, mppt_key, expected_ip)
 * triples — pivot it into rows per Ir level with one column per mppt_key. */
function pivotExpectedMpptA(rows: ExpectedMpptARow[]) {
  const mpptKeys = Array.from(new Set(rows.map((r) => r.mppt_key)))
  const irLevels = Array.from(new Set(rows.map((r) => r.ir_wm2))).sort(
    (a, b) => b - a
  )
  const lookup = new Map(
    rows.map((r) => [`${r.ir_wm2}:${r.mppt_key}`, r.expected_ip])
  )

  return {
    mpptKeys,
    rows: irLevels.map((ir) => ({
      ir,
      values: mpptKeys.map((key) => lookup.get(`${ir}:${key}`) ?? null),
    })),
  }
}

function PanelSummaryTable({
  panels,
  onEdit,
}: {
  panels: SitePanelRef[]
  onEdit: () => void
}) {
  return (
    <div className="border-border/60 overflow-x-auto rounded-lg border">
      <div className="flex items-center justify-between bg-sky-100 px-3 py-2">
        <span className="text-sm font-semibold text-[#1D1D1D]">
          Panel Types
        </span>
        <button
          onClick={onEdit}
          className="text-[#1D1D1D]/70 hover:text-[#1D1D1D]"
          title="Edit panel config"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            {["Panel Type", "Watt", "Vmp", "Voc", "Imp"].map((h) => (
              <th
                key={h}
                className="border-border/60 text-foreground border-b px-3 py-2 text-left font-semibold"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {panels.map((p, i) => (
            <tr key={p.uid} className={i % 2 === 1 ? "bg-sky-50" : "bg-white"}>
              <td className="border-border/60 border-b px-3 py-2">
                {p.panel_type}
              </td>
              <td className="border-border/60 border-b px-3 py-2">{p.watt}</td>
              <td className="border-border/60 border-b px-3 py-2">{p.vmp}</td>
              <td className="border-border/60 border-b px-3 py-2">{p.voc}</td>
              <td className="border-border/60 border-b px-3 py-2">{p.imp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StringSummaryTable({
  rows,
  panels,
  devices,
  onEdit,
}: {
  rows: StringWiringSchematicItem[]
  panels: SitePanelRef[]
  devices: SiteDeviceModel[]
  onEdit: () => void
}) {
  const panelByUid = new Map(panels.map((p) => [p.uid, p]))
  const deviceBySlaveId = new Map(devices.map((d) => [d.slave_id, d]))

  return (
    <div className="border-border/60 overflow-x-auto rounded-lg border">
      <div className="flex items-center justify-between bg-sky-100 px-3 py-2">
        <span className="text-sm font-semibold text-[#1D1D1D]">
          String Summary
        </span>
        <button
          onClick={onEdit}
          className="text-[#1D1D1D]/70 hover:text-[#1D1D1D]"
          title="Edit string wiring"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            {[
              "String",
              "Inverter",
              "MPPT",
              "String ID",
              "Panel Type",
              "Panel W",
              "Qty",
              "Watt",
              "Panel Voc",
              "Panel Vmp",
              "MPPT Key",
            ].map((h) => (
              <th
                key={h}
                className="border-border/60 text-foreground border-b px-3 py-2 text-left font-semibold whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const panel = panelByUid.get(row.panel_ref_uid)
            const device = deviceBySlaveId.get(row.inverter)
            return (
              <tr
                key={row.string_identity}
                className={i % 2 === 1 ? "bg-sky-50" : "bg-white"}
              >
                <td className="border-border/60 border-b px-3 py-2 font-medium">
                  {row.string_identity}
                </td>
                <td className="border-border/60 border-b px-3 py-2">
                  {device
                    ? `${device.device_type} · ${row.inverter}`
                    : row.inverter}
                </td>
                <td className="border-border/60 border-b px-3 py-2">
                  {row.mppt}
                </td>
                <td className="border-border/60 border-b px-3 py-2">
                  {row.string_id}
                </td>
                <td className="border-border/60 border-b px-3 py-2">
                  {panel?.panel_type ?? "—"}
                </td>
                <td className="border-border/60 border-b px-3 py-2">
                  {row.panel_watt}
                </td>
                <td className="border-border/60 border-b px-3 py-2">
                  {row.panel_qty}
                </td>
                <td className="border-border/60 border-b px-3 py-2">
                  {row.watt}
                </td>
                <td className="border-border/60 border-b px-3 py-2">
                  {row.panel_voc}
                </td>
                <td className="border-border/60 border-b px-3 py-2">
                  {row.panel_vmp}
                </td>
                <td className="border-border/60 border-b px-3 py-2">
                  {row.mppt_key}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function PanelConfigPanel({ siteId }: { siteId: string }) {
  const { data: panelsRes, isLoading: isPanelsLoading } = useSitePanels(siteId)
  const { data: wiringRes, isLoading: isWiringLoading } =
    useSiteStringWiring(siteId)
  const { data: devicesRes } = useSiteDevices(siteId)

  const [panelDialogOpen, setPanelDialogOpen] = useState(false)
  const [wiringDialogOpen, setWiringDialogOpen] = useState(false)

  const panels = panelsRes?.data ?? []
  const wiring = wiringRes?.data ?? null
  const devices = devicesRes?.data ?? []
  const stringInputRows = wiring ? parseStringInput(wiring.string_input) : []
  const schematicRows = wiring?.wring_schematics
    ? parseWiringSchematics(wiring.wring_schematics)
    : []
  const mpptFnRows = wiring?.mppt_fn_table
    ? parseMpptFnTable(wiring.mppt_fn_table)
    : []
  const mpptFnTotal = mpptFnRows.reduce((sum, r) => sum + r.mppt_p_kw, 0)
  const expectedMpptA = wiring?.expected_mppt_a_table
    ? pivotExpectedMpptA(parseExpectedMpptATable(wiring.expected_mppt_a_table))
    : null

  return (
    <div className="flex flex-col gap-5">
      {isPanelsLoading ? (
        <div className="bg-muted h-16 w-full animate-pulse rounded-lg" />
      ) : panels.length === 0 ? (
        <div className="border-border/60 flex flex-col items-center gap-3 rounded-lg border border-dashed py-8 text-center">
          <p className="text-muted-foreground text-sm">
            No panel config yet for this site.
          </p>
          <button
            onClick={() => setPanelDialogOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#024159] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Panel Config
          </button>
        </div>
      ) : (
        <PanelSummaryTable
          panels={panels}
          onEdit={() => setPanelDialogOpen(true)}
        />
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="border-border/60 overflow-hidden rounded-lg border">
          <TableBanner>MPPT Table (charge controller)</TableBanner>
          {isWiringLoading ? (
            <div className="bg-muted m-3 h-16 animate-pulse rounded-lg" />
          ) : mpptFnRows.length === 0 ? (
            <p className="text-muted-foreground px-3 py-6 text-center text-sm">
              Configure string wiring to see this table.
            </p>
          ) : (
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  {[
                    "Inverter",
                    "MP PT",
                    "MPPTKey",
                    "MPPT_Vp",
                    "MPPT_Ip",
                    "MPPT_P(kW)",
                  ].map((h) => (
                    <th
                      key={h}
                      className="border-border/60 text-foreground border-b px-3 py-2 text-left font-semibold whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mpptFnRows.map((row, i) => (
                  <tr
                    key={row.mppt_key}
                    className={i % 2 === 1 ? "bg-sky-50" : "bg-white"}
                  >
                    <td className="border-border/60 border-b px-3 py-2">
                      {row.inverter}
                    </td>
                    <td className="border-border/60 border-b px-3 py-2">
                      {row.mppt}
                    </td>
                    <td className="border-border/60 border-b px-3 py-2">
                      {row.mppt_key}
                    </td>
                    <td className="border-border/60 border-b px-3 py-2">
                      {row.mppt_vp}
                    </td>
                    <td className="border-border/60 border-b px-3 py-2">
                      {row.mppt_ip}
                    </td>
                    <td className="border-border/60 border-b px-3 py-2">
                      {row.mppt_p_kw}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="px-3 py-2 font-semibold" colSpan={5}>
                    Total
                  </td>
                  <td className="px-3 py-2 font-semibold">
                    {Math.round(mpptFnTotal * 100) / 100}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        <div className="border-border/60 overflow-hidden rounded-lg border">
          <TableBanner>Expected MPPT_A</TableBanner>
          {isWiringLoading ? (
            <div className="bg-muted m-3 h-16 animate-pulse rounded-lg" />
          ) : !expectedMpptA || expectedMpptA.rows.length === 0 ? (
            <p className="text-muted-foreground px-3 py-6 text-center text-sm">
              Configure string wiring to see this table.
            </p>
          ) : (
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="border-border/60 text-foreground border-b px-3 py-2 text-left font-semibold whitespace-nowrap">
                    Ir(w/m2)
                  </th>
                  {expectedMpptA.mpptKeys.map((c) => (
                    <th
                      key={c}
                      className="border-border/60 text-foreground border-b px-3 py-2 text-left font-semibold"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expectedMpptA.rows.map((row, i) => (
                  <tr
                    key={row.ir}
                    className={i % 2 === 1 ? "bg-sky-50" : "bg-white"}
                  >
                    <td className="border-border/60 border-b px-3 py-2">
                      {row.ir}
                    </td>
                    {row.values.map((v, j) => (
                      <td
                        key={j}
                        className="border-border/60 border-b px-3 py-2"
                      >
                        {v ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isWiringLoading ? (
        <div className="bg-muted h-16 w-full animate-pulse rounded-lg" />
      ) : stringInputRows.length === 0 ? (
        <div className="border-border/60 flex flex-col items-center gap-3 rounded-lg border border-dashed py-8 text-center">
          <p className="text-muted-foreground text-sm">
            No string wiring configured yet for this site.
          </p>
          <button
            onClick={() => setWiringDialogOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#024159] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            Configure String Wiring
          </button>
        </div>
      ) : (
        <StringSummaryTable
          rows={schematicRows}
          panels={panels}
          devices={devices}
          onEdit={() => setWiringDialogOpen(true)}
        />
      )}

      <PanelConfigDialog
        siteId={siteId}
        isOpen={panelDialogOpen}
        onClose={() => setPanelDialogOpen(false)}
        existing={panels}
      />
      <StringWiringDialog
        siteId={siteId}
        isOpen={wiringDialogOpen}
        onClose={() => setWiringDialogOpen(false)}
        existingUid={wiring?.uid ?? null}
        existingRows={stringInputRows}
        devices={devices}
        panels={panels}
      />
    </div>
  )
}

type ParsedDegradation = {
  years: string[]
  rows: { month: string; values: (number | string)[] }[]
}

/**
 * The API returns `degradation` as a JSON-encoded array of year-objects,
 * one per year, each mapping month name -> kWh for that year, e.g.
 * `[{"May":14749,"Jun":15617,...}, {"May":14601.51,...}, ...]`.
 * We transpose that into month-rows / year-columns for display.
 */
function parseDegradationTable(raw: string): ParsedDegradation | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return null

    const yearObjects = parsed as Record<string, number>[]
    if (typeof yearObjects[0] !== "object" || yearObjects[0] === null) {
      return null
    }

    const months = Object.keys(yearObjects[0])
    const years = yearObjects.map((_, i) => `Y${i + 1}`)
    const rows = months.map((month) => ({
      month,
      values: yearObjects.map((yearData) => yearData[month]),
    }))

    return { years, rows }
  } catch {
    return null
  }
}

function DegradationTable({ raw }: { raw: string }) {
  const parsed = parseDegradationTable(raw)

  if (!parsed) {
    return (
      <pre className="overflow-x-auto px-3 py-3 text-xs whitespace-pre-wrap text-[#1D1D1D]">
        {raw}
      </pre>
    )
  }

  return (
    <table className="w-full border-separate border-spacing-0 text-sm">
      <thead>
        <tr>
          <th className="border-border/60 text-foreground border-b px-3 py-2 text-left font-semibold">
            Month
          </th>
          {parsed.years.map((y) => (
            <th
              key={y}
              className="border-border/60 text-foreground border-b px-3 py-2 text-left font-semibold"
            >
              {y}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {parsed.rows.map((row, i) => (
          <tr
            key={row.month}
            className={i % 2 === 1 ? "bg-sky-50" : "bg-white"}
          >
            <td className="border-border/60 border-b px-3 py-2 font-medium">
              {row.month}
            </td>
            {row.values.map((v, j) => (
              <td
                key={j}
                className="border-border/60 border-b px-3 py-2 whitespace-nowrap"
              >
                {v}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function PvSummaryPanel({ siteId }: { siteId: string }) {
  const { data: pvsRes, isLoading: isPvsLoading } = useSitePvs(siteId)
  const { data: degradationRes, isLoading: isDegradationLoading } =
    useSiteDegradation(siteId)
  const [pvDialogOpen, setPvDialogOpen] = useState(false)
  const [degradationDialogOpen, setDegradationDialogOpen] = useState(false)

  const pvs = pvsRes?.data ?? null
  const degradation = degradationRes?.data ?? null

  return (
    <div className="flex flex-col gap-5">
      {isPvsLoading ? (
        <div className="bg-muted h-16 w-full animate-pulse rounded-lg" />
      ) : !pvs ? (
        <div className="border-border/60 flex flex-col items-center gap-3 rounded-lg border border-dashed py-8 text-center">
          <p className="text-muted-foreground text-sm">
            No PV summary yet for this site.
          </p>
          <button
            onClick={() => setPvDialogOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#024159] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            Create PV Summary
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2">
            <span className="text-sm text-[#1D1D1D]">
              Expected Production:{" "}
              <span className="font-semibold">
                {pvs.expected_production_kwh}
              </span>
            </span>
            <span className="text-sm text-[#1D1D1D]">
              Year 1 Degradation:{" "}
              <span className="font-semibold">{pvs.year1_degradation}%</span>
            </span>
            <span className="text-sm text-[#1D1D1D]">
              Commisioning Date:{" "}
              <span className="font-semibold">
                {formatIsoDateOnly(pvs.commissioned_at)}
              </span>
            </span>
            <span className="text-sm text-[#1D1D1D]">
              Year2+ Degradation:{" "}
              <span className="font-semibold">
                {pvs.year2plus_degradation}%
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#1D1D1D]">
              System Size kWp:{" "}
              <span className="font-semibold">{pvs.system_size_kwp}</span>
            </span>
            <button
              onClick={() => setPvDialogOpen(true)}
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1 transition-colors"
              title="Edit PV summary"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {isDegradationLoading ? (
        <div className="bg-muted h-16 w-full animate-pulse rounded-lg" />
      ) : !degradation ? (
        <div className="border-border/60 flex flex-col items-center gap-3 rounded-lg border border-dashed py-8 text-center">
          <p className="text-muted-foreground text-sm">
            No degradation table yet for this site.
          </p>
          <button
            onClick={() => setDegradationDialogOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#024159] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Year 1 Degradation
          </button>
        </div>
      ) : (
        <div className="border-border/60 overflow-x-auto rounded-lg border">
          <div className="flex items-center justify-between bg-sky-100 px-3 py-2">
            <span className="text-sm font-semibold text-[#1D1D1D]">
              Degradation table
            </span>
            <button
              onClick={() => setDegradationDialogOpen(true)}
              className="text-[#1D1D1D]/70 hover:text-[#1D1D1D]"
              title="Edit degradation table"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
          <DegradationTable raw={degradation.degradation} />
        </div>
      )}

      <PvSummaryDialog
        siteId={siteId}
        isOpen={pvDialogOpen}
        onClose={() => setPvDialogOpen(false)}
        existing={pvs}
      />
      <DegradationDialog
        siteId={siteId}
        isOpen={degradationDialogOpen}
        onClose={() => setDegradationDialogOpen(false)}
        commissionedAt={pvs?.commissioned_at ?? null}
        existingRaw={degradation?.degradation ?? null}
        isEdit={!!degradation}
      />
    </div>
  )
}

function BatterySocPanel() {
  return (
    <>
      <LineChart
        series={BATTERY_CHART_SERIES}
        yLabels={CHART_Y_LABELS}
        xLabels={CHART_TIMES}
      />

      <ul className="mt-4 flex flex-wrap items-center gap-5">
        {BATTERY_CHART_SERIES.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-1.5 text-sm text-[#1D1D1D]"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.id}
          </li>
        ))}
      </ul>
    </>
  )
}

function BatteryTimeCheckTable() {
  return (
    <table className="w-full border-separate border-spacing-0 text-sm">
      <thead>
        <tr className="bg-sky-100">
          <th className="border-border/60 text-foreground border-b px-3 py-2 text-left font-semibold">
            Time
          </th>
          {TABLE_TIMES.map((t) => (
            <th
              key={t}
              className="border-border/60 text-foreground border-b px-3 py-2 text-left font-semibold whitespace-nowrap"
            >
              {t}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {BATTERY_TIME_CHECK.map((row, i) => (
          <tr key={row.id} className={i % 2 === 1 ? "bg-sky-50" : "bg-white"}>
            <td className="border-border/60 border-b px-3 py-2 font-medium">
              {row.id}
            </td>
            {row.values.map((v, j) => (
              <td key={j} className="border-border/60 border-b px-3 py-2">
                <span className={v < 55 ? "font-medium text-[#FA4F19]" : ""}>
                  {v}%
                </span>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
