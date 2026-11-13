"use client"

import { useState } from "react"
import { DatePickerInput } from "@workspace/ui"
import { localDateToDateString } from "@/utils/date"
import {
  MAX_RANGE_DAYS,
  RANGE_PRESETS,
  latestCompleteDay,
  parseDateString,
  shiftDate,
  type DateRange,
  type RangePreset,
} from "@/utils/production"

export function RangeControl({
  preset,
  range,
  onPreset,
  onCustom,
}: {
  preset: RangePreset
  range: DateRange
  onPreset: (preset: Exclude<RangePreset, "custom">) => void
  onCustom: (range: DateRange) => void
}) {
  // Opening "Custom" pre-fills both pickers with the range currently shown,
  // so changing either end applies straight away. The draft state only
  // matters if one end is ever cleared — then nothing is applied until both
  // ends are set again.
  const [draftFrom, setDraftFrom] = useState<Date | undefined>()
  const [draftTo, setDraftTo] = useState<Date | undefined>()
  const [customOpen, setCustomOpen] = useState(preset === "custom")

  // Production is only available for completed days, so yesterday is the
  // latest date either picker allows.
  const latest = parseDateString(latestCompleteDay())
  const from =
    draftFrom ?? (customOpen ? parseDateString(range.from) : undefined)
  const to = draftTo ?? (customOpen ? parseDateString(range.to) : undefined)

  const apply = (nextFrom?: Date, nextTo?: Date) => {
    if (!nextFrom || !nextTo) return
    onCustom({
      from: localDateToDateString(nextFrom),
      to: localDateToDateString(nextTo),
    })
    setDraftFrom(undefined)
    setDraftTo(undefined)
  }

  const isActive = (key: RangePreset) =>
    key === "custom" ? customOpen : !customOpen && preset === key

  const chip = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-sm transition-colors ${
      active
        ? "bg-[#024159] font-semibold text-white"
        : "border-border/60 border bg-white text-[#1D1D1D] hover:bg-neutral-50"
    }`

  // Keep custom ranges within MAX_RANGE_DAYS and no later than yesterday.
  const fromDisabled = to
    ? [
        { after: to },
        {
          before: parseDateString(
            shiftDate(localDateToDateString(to), -(MAX_RANGE_DAYS - 1))
          ),
        },
      ]
    : [{ after: latest }]
  const toDisabled = from
    ? [
        { before: from },
        { after: latest },
        {
          after: parseDateString(
            shiftDate(localDateToDateString(from), MAX_RANGE_DAYS - 1)
          ),
        },
      ]
    : [{ after: latest }]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {RANGE_PRESETS.map((p) => (
        <button
          key={p.key}
          onClick={() => {
            setCustomOpen(false)
            setDraftFrom(undefined)
            setDraftTo(undefined)
            onPreset(p.key)
          }}
          className={chip(isActive(p.key))}
        >
          {p.label}
        </button>
      ))}
      <button
        onClick={() => setCustomOpen(true)}
        className={chip(isActive("custom"))}
      >
        Custom
      </button>

      {customOpen && (
        <div className="flex items-center gap-2">
          <DatePickerInput
            value={from}
            onChange={(d) => {
              setDraftFrom(d)
              apply(d, to)
            }}
            disabledDates={fromDisabled}
            dateFormat="d MMM yyyy"
            placeholder="From"
            className="border-border/60 h-9 w-36"
          />
          <span className="text-muted-foreground text-sm">–</span>
          <DatePickerInput
            value={to}
            onChange={(d) => {
              setDraftTo(d)
              apply(from, d)
            }}
            disabledDates={toDisabled}
            dateFormat="d MMM yyyy"
            placeholder="To"
            className="border-border/60 h-9 w-36"
          />
        </div>
      )}
    </div>
  )
}
