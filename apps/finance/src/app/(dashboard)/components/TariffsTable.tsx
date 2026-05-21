"use client"

import { useMemo } from "react"
import { Controller, useWatch } from "react-hook-form"
import type {
  Control,
  UseFormRegister,
  UseFormSetValue,
  FieldArrayWithId,
} from "react-hook-form"
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui"
import { VIS, TARIFF_SLOT_TYPE_OPTIONS } from "@/constants/contract"
import type { ContractDetailsValues } from "@/constants/contractDetails"

type Props = {
  show: (field: keyof typeof VIS) => boolean
  fields: FieldArrayWithId<ContractDetailsValues, "tariffs", "id">[]
  control: Control<ContractDetailsValues>
  register: UseFormRegister<ContractDetailsValues>
  setValue: UseFormSetValue<ContractDetailsValues>
  termYears: string
}

function tariffLabel(slot: string, slotType?: string): string {
  const nameMap: Record<string, string> = {
    A: "Solar Hours",
    B: "Non-Solar Hours",
    Solar: "Solar Hours",
    Utility: "Utility Hours",
  }
  const name = nameMap[slot] ?? slot
  const type = slotType === "Variable" ? "Indexed" : slotType
  return type ? `${name} (${type})` : name
}

const COLS = "grid-cols-[200px_200px_160px_140px_140px]"

export default function TariffsTable({
  show,
  fields,
  control,
  register,
  setValue,
  termYears,
}: Props) {
  const tariffValues = useWatch({ control, name: "tariffs" })
  const tariffPeriods = useWatch({ control, name: "tariff_periods" })
  const showDuration = parseInt(tariffPeriods ?? "0", 10) > 1
  const termYearsNum = parseInt(termYears || "0", 10)

  const periodGroups = useMemo(() => {
    const map = new Map<
      string,
      { index: number; field: (typeof fields)[number] }[]
    >()
    fields.forEach((field, index) => {
      const p = String(field.period_number)
      if (!map.has(p)) map.set(p, [])
      map.get(p)!.push({ field, index })
    })
    return Array.from(map.entries())
  }, [fields])

  const totalDuration = showDuration
    ? periodGroups.reduce((sum, [, s]) => {
        return (
          sum +
          (parseInt(tariffValues?.[s[0].index]?.duration_years ?? "0", 10) || 0)
        )
      }, 0)
    : 0

  const durationError =
    showDuration && termYearsNum > 0 && totalDuration !== termYearsNum
      ? `Durations sum to ${totalDuration} yr${totalDuration !== 1 ? "s" : ""} — must equal term of ${termYearsNum} yr${termYearsNum !== 1 ? "s" : ""}`
      : null

  if (!show("tariffs_table")) return null

  return (
    <div className="border-border mt-5 overflow-hidden rounded-lg border">
      <div
        className={`bg-blue/40 grid ${COLS} gap-5 px-4 py-2.5 text-xs font-semibold text-[#2C6B6B]`}
      >
        <span>Tariffs</span>
        <span>Type</span>
        <span>Rate/%</span>
        <span>Start Time</span>
        <span>End Time</span>
      </div>

      {fields.length === 0 ? (
        <div className="text-muted-foreground bg-white px-4 py-6 text-center text-sm">
          Select tariff periods above to generate rows.
        </div>
      ) : (
        periodGroups.map(([periodNum, slots], groupIdx) => {
          const firstIndex = slots[0].index
          const isLastPeriod = groupIdx === periodGroups.length - 1
          const registered = register(`tariffs.${firstIndex}.duration_years`)

          const handleDurationChange = (
            e: React.ChangeEvent<HTMLInputElement>
          ) => {
            registered.onChange(e)
            if (isLastPeriod || !termYearsNum) return
            const rawVal = parseInt(e.target.value || "0", 10) || 0
            // Reserve at least 1 year per remaining period so last period is always ≥ 1
            const maxForPeriod = Math.max(
              1,
              termYearsNum - (periodGroups.length - 1)
            )
            const effectiveVal = Math.min(rawVal, maxForPeriod)
            if (effectiveVal !== rawVal) {
              setValue(
                `tariffs.${firstIndex}.duration_years`,
                String(effectiveVal)
              )
            }
            const sumAllButLast = periodGroups
              .slice(0, -1)
              .reduce((sum, [, s], gi) => {
                const val =
                  gi === groupIdx
                    ? effectiveVal
                    : parseInt(
                        tariffValues?.[s[0].index]?.duration_years ?? "0",
                        10
                      ) || 0
                return sum + val
              }, 0)
            const lastSlotIdx =
              periodGroups[periodGroups.length - 1][1][0].index
            setValue(
              `tariffs.${lastSlotIdx}.duration_years`,
              String(Math.max(0, termYearsNum - sumAllButLast))
            )
          }

          return (
            <div key={periodNum}>
              {showDuration && (
                <div className="border-border flex items-center justify-between border-t bg-neutral-50 px-4 py-2">
                  <span className="text-text-1 text-xs font-semibold">
                    Period {periodNum}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      Duration (Yrs)
                    </span>
                    <Input
                      type="number"
                      min={1}
                      max={
                        !isLastPeriod && termYearsNum > 0
                          ? Math.max(
                              1,
                              termYearsNum - (periodGroups.length - 1)
                            )
                          : undefined
                      }
                      className="border-input h-7 w-24 border bg-white text-sm"
                      placeholder="Years"
                      {...registered}
                      onChange={handleDurationChange}
                    />
                  </div>
                </div>
              )}

              {slots.map(({ field, index }) => {
                const isVariable =
                  tariffValues?.[index]?.slot_type === "Variable"
                return (
                  <div
                    key={field.id}
                    className={`border-border grid ${COLS} items-center gap-3 border-t bg-white px-4 py-2.5`}
                  >
                    <span className="text-foreground text-sm font-medium">
                      {tariffLabel(
                        field.slot,
                        tariffValues?.[index]?.slot_type
                      )}
                    </span>

                    <Controller
                      name={`tariffs.${index}.slot_type`}
                      control={control}
                      render={({ field: f }) => (
                        <Select value={f.value} onValueChange={f.onChange}>
                          <SelectTrigger className="h-9 bg-white text-xs font-normal">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {TARIFF_SLOT_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />

                    <div className="relative flex items-center">
                      <Input
                        type="number"
                        step="0.01"
                        className="border-input h-9 border bg-white pr-14 text-sm"
                        placeholder="0.00"
                        {...register(`tariffs.${index}.rate`)}
                      />
                      <span className="text-muted-foreground pointer-events-none absolute right-2.5 text-xs">
                        {isVariable ? "%" : "$/kWh"}
                      </span>
                    </div>

                    <Input
                      type="time"
                      className="border-input h-9 border bg-white text-sm"
                      {...register(`tariffs.${index}.time_start`)}
                    />

                    <Input
                      type="time"
                      className="border-input h-9 border bg-white text-sm"
                      {...register(`tariffs.${index}.time_end`)}
                    />
                  </div>
                )
              })}
            </div>
          )
        })
      )}

      {durationError && (
        <p className="text-destructive border-border border-t px-4 py-2 text-xs">
          {durationError}
        </p>
      )}
    </div>
  )
}
