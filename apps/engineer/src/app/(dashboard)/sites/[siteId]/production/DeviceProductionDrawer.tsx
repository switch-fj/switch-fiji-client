"use client"

import { useEffect, useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { X } from "lucide-react"
import { RangeControl } from "@/app/(dashboard)/components/RangeControl"
import {
  getDeviceProductionDaily,
  getDeviceProductionTotals,
} from "@/requests/productionHistory"
import type {
  DeviceProductionGroup,
  DeviceProductionPeriod,
  ProductionStatus,
  SiteDeviceModel,
} from "@/types/engineer"
import { localDateToDateString } from "@/utils/date"
import {
  ISSUE_STATUSES,
  formatKwh,
  formatRange,
  formatReason,
  latestCompleteDay,
  parseDateString,
  presetRange,
  rangeLength,
  shiftDate,
  summarizeRange,
  type DateRange,
  type RangePreset,
} from "@/utils/production"
import { useSiteTimezone } from "@/utils/siteTimezone"
import { ColumnChart, type Column } from "./charts"
import { dayColumn } from "./DailyHistorySection"
import { formatDay, formatMonth } from "./ytdText"

const GROUPS: { key: DeviceProductionGroup; label: string }[] = [
  { key: "day", label: "Daily" },
  { key: "week", label: "Weekly" },
  { key: "month", label: "Monthly" },
]

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** The backend only has production history for solar meters ("Device
 * production history is supported for solar meters only"). `meter_role` is
 * free text, so match the roles that measure solar generation: "Micro_inv"
 * (micro-inverter output) plus anything naming solar/PV. Gen_meter,
 * Load_meter and Aux_loads are rejected by the backend. */
const SOLAR_ROLE = /solar|\bpv|micro_?inv/i

export const isSolarMeter = (d: SiteDeviceModel) =>
  SOLAR_ROLE.test(d.meter_role ?? "")

export const deviceLabel = (d: SiteDeviceModel) =>
  `${capitalize(d.device_type)}${d.meter_role ? ` · ${capitalize(d.meter_role)}` : ""}`

/** Weekly and monthly views use fixed spans long enough to show a trend. */
function groupRange(
  group: Exclude<DeviceProductionGroup, "day">,
  latest: string
): DateRange {
  if (group === "week")
    return { from: shiftDate(latest, -(12 * 7 - 1)), to: latest }
  const end = parseDateString(latest)
  return {
    from: localDateToDateString(
      new Date(end.getFullYear(), end.getMonth() - 11, 1)
    ),
    to: latest,
  }
}

function periodColumn(
  p: DeviceProductionPeriod,
  group: "week" | "month"
): Column {
  const title =
    group === "week"
      ? `Week of ${formatDay(p.period_start)}`
      : formatMonth(p.period_start.slice(0, 7), true)
  const clipped = p.from_date !== p.period_start || p.to_date !== p.period_end
  const tone: Column["tone"] =
    p.production_kwh === null
      ? ISSUE_STATUSES.has(p.status as ProductionStatus)
        ? "issue"
        : "empty"
      : p.covered_days < p.requested_days
        ? "partial"
        : "complete"
  return {
    key: p.period_start,
    label:
      group === "week"
        ? formatDay(p.period_start, false)
        : formatMonth(p.period_start.slice(0, 7)),
    value: p.production_kwh,
    tone,
    ariaLabel: `${title}: ${p.production_kwh === null ? "no data" : formatKwh(p.production_kwh)}, ${p.covered_days} of ${p.requested_days} days`,
    tooltip: (
      <>
        <div className="font-semibold text-[#1D1D1D]">{title}</div>
        {clipped && (
          <div className="text-muted-foreground">
            {formatDay(p.from_date, false)} – {formatDay(p.to_date, false)} in
            this range
          </div>
        )}
        <div className="mt-1 text-base font-semibold text-[#1D1D1D]">
          {p.production_kwh === null ? "No data" : formatKwh(p.production_kwh)}
        </div>
        <div
          className={
            p.covered_days < p.requested_days
              ? "text-[#B8380D]"
              : "text-muted-foreground"
          }
        >
          Data for {p.covered_days} of {p.requested_days} days
        </div>
        {p.status !== "complete" && (
          <div className="text-muted-foreground">{formatReason(p.status)}</div>
        )}
      </>
    ),
  }
}

export function DeviceProductionDrawer({
  siteId,
  device,
  onClose,
}: {
  siteId: string
  device: SiteDeviceModel | null
  onClose: () => void
}) {
  // Esc closes, like the other drawers.
  useEffect(() => {
    if (!device) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [device, onClose])

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${device ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Device production"
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-[640px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${device ? "translate-x-0" : "translate-x-full"}`}
      >
        {device && (
          // Keyed so switching device resets grouping and range.
          <DrawerBody
            key={device.uid}
            siteId={siteId}
            device={device}
            onClose={onClose}
          />
        )}
      </div>
    </>
  )
}

function DrawerBody({
  siteId,
  device,
  onClose,
}: {
  siteId: string
  device: SiteDeviceModel
  onClose: () => void
}) {
  const latest = latestCompleteDay(useSiteTimezone(siteId))
  const [group, setGroup] = useState<DeviceProductionGroup>("day")
  const [preset, setPreset] = useState<RangePreset>("30d")
  const [custom, setCustom] = useState<DateRange | null>(null)

  const range: DateRange =
    group !== "day"
      ? groupRange(group, latest)
      : preset === "custom" && custom
        ? { from: custom.from, to: custom.to > latest ? latest : custom.to }
        : presetRange(preset === "custom" ? "30d" : preset, latest)

  const daily = useQuery({
    queryKey: [
      "device-production",
      siteId,
      device.uid,
      "day",
      range.from,
      range.to,
    ],
    queryFn: () =>
      getDeviceProductionDaily(siteId, device.uid, {
        from_date: range.from,
        to_date: range.to,
      }),
    enabled: group === "day",
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
  const totals = useQuery({
    queryKey: [
      "device-production",
      siteId,
      device.uid,
      group,
      range.from,
      range.to,
    ],
    queryFn: () =>
      getDeviceProductionTotals(siteId, device.uid, {
        from_date: range.from,
        to_date: range.to,
        group_by: group as "week" | "month",
      }),
    enabled: group !== "day",
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
  const query = group === "day" ? daily : totals

  // Figures + chart columns for whichever grouping is showing.
  let view: {
    total: number | null
    covered: number
    expected: number
    gaps: number
    columns: Column[]
    unsupported: boolean
  } | null = null

  const dailyData = daily.data?.data
  const totalsData = totals.data?.data
  if (group === "day" && dailyData?.device_uid === device.uid) {
    const s = summarizeRange(dailyData.items, range)
    view = {
      total: s.completeDays ? s.totalKwh : null,
      covered: s.completeDays,
      expected: s.expectedDays,
      gaps: s.issueDays,
      columns: s.strip.map((p, i) => dayColumn(p, i, s.strip.length)),
      unsupported: s.unsupported,
    }
  } else if (
    group !== "day" &&
    totalsData?.device_uid === device.uid &&
    totalsData.group_by === group
  ) {
    const items = totalsData.items
    const known = items.filter((p) => p.production_kwh !== null)
    view = {
      total: known.length
        ? known.reduce((s, p) => s + (p.production_kwh ?? 0), 0)
        : null,
      covered: items.reduce((s, p) => s + p.covered_days, 0),
      expected: items.reduce((s, p) => s + p.requested_days, 0),
      gaps: items.filter((p) => p.covered_days < p.requested_days).length,
      columns: items.map((p) => periodColumn(p, group)),
      unsupported:
        items.length > 0 && items.every((p) => p.status === "unsupported"),
    }
  }

  const days = rangeLength(range)
  const timezone = (group === "day" ? dailyData : totalsData)?.timezone

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-border/60 flex items-start justify-between gap-4 border-b px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-[#1D1D1D]">
            {deviceLabel(device)}
          </h2>
          <p className="text-muted-foreground text-sm">
            Slave ID {device.slave_id} · Production
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
        >
          <X className="h-4 w-4" />
          Close
        </button>
      </div>

      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-3">
          <div className="flex w-fit gap-1 rounded-lg bg-neutral-100 p-0.5">
            {GROUPS.map((g) => (
              <button
                key={g.key}
                onClick={() => setGroup(g.key)}
                className={`rounded-md px-3 py-1 text-sm transition-colors ${
                  group === g.key
                    ? "bg-white font-semibold text-[#1D1D1D] shadow-sm"
                    : "text-muted-foreground hover:text-[#1D1D1D]"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          {group === "day" && (
            <RangeControl
              preset={preset}
              range={range}
              latestDay={latest}
              onPreset={setPreset}
              onCustom={(r) => {
                setPreset("custom")
                setCustom(r)
              }}
            />
          )}
          <p className="text-muted-foreground text-sm">
            <span className="font-semibold text-[#1D1D1D]">
              {group === "week"
                ? "Last 12 weeks"
                : group === "month"
                  ? "Last 12 months"
                  : formatRange(range)}
            </span>
            {group === "day"
              ? ` · ${days} ${days === 1 ? "day" : "days"}`
              : ` · ${formatRange(range)}`}
            {timezone ? `, ${timezone} time` : ""}
            {query.isFetching && !query.isLoading ? " · Updating…" : ""}
          </p>
        </div>

        {query.isLoading ? (
          <div className="bg-muted h-72 animate-pulse rounded-lg" />
        ) : query.isError && !view ? (
          /solar meters only/i.test(query.error.message) ? (
            <p className="text-muted-foreground rounded-lg border border-dashed px-6 py-10 text-center text-sm">
              Production history is only available for solar meters, and the
              backend doesn&apos;t treat this one as a solar meter.
            </p>
          ) : (
            <p className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-red-600">
              Couldn&apos;t load production for this device.{" "}
              {query.error.message}
            </p>
          )
        ) : !view ? null : view.unsupported ? (
          <p className="text-muted-foreground rounded-lg border border-dashed px-6 py-10 text-center text-sm">
            Production isn&apos;t tracked for this device.
          </p>
        ) : (
          <div
            className={`flex flex-col gap-5 transition-opacity ${query.isFetching ? "opacity-70" : ""}`}
          >
            <div className="flex flex-wrap gap-x-10 gap-y-3">
              <Figure
                label="Total"
                value={view.total === null ? "—" : formatKwh(view.total)}
              />
              <Figure
                label="Average per day"
                value={
                  view.total !== null && view.covered > 0
                    ? formatKwh(view.total / view.covered)
                    : "—"
                }
              />
              <Figure
                label="Days with data"
                value={`${view.covered} / ${view.expected}`}
                extra={
                  view.gaps > 0 && (
                    <span className="text-xs text-[#B8380D]">
                      {group === "day"
                        ? `${view.gaps} ${view.gaps === 1 ? "gap" : "gaps"}`
                        : `${view.gaps} ${group === "week" ? (view.gaps === 1 ? "week" : "weeks") : view.gaps === 1 ? "month" : "months"} incomplete`}
                    </span>
                  )
                }
              />
            </div>
            <ColumnChart columns={view.columns} />
            {group !== "day" && (
              <p className="text-muted-foreground text-xs">
                Faded bars are periods with some days missing, so their totals
                are partial.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
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
