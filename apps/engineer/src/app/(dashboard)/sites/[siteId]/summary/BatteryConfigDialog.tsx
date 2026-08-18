"use client"

import { useEffect, useState } from "react"
import { CircleCheck, Info, Plus, Trash2, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui"
import { useCreateSiteBatteryConfig } from "@/hooks/useBatterySoc"
import type { SiteDeviceModel } from "@/types/engineer"

type ConfigRow = {
  inverter_slave_id: string
  battery_keys: string
  capacity_kwh: string
  low_soc_threshold: string
  high_soc_threshold: string
}

const EMPTY_ROW: ConfigRow = {
  inverter_slave_id: "",
  battery_keys: "",
  capacity_kwh: "",
  low_soc_threshold: "",
  high_soc_threshold: "",
}

function isRowComplete(row: ConfigRow): boolean {
  return (
    row.inverter_slave_id !== "" &&
    row.battery_keys.trim() !== "" &&
    row.capacity_kwh !== "" &&
    row.low_soc_threshold !== "" &&
    row.high_soc_threshold !== ""
  )
}

/** SOC thresholds are percentages — no negatives, nothing above 100. */
function clampPercent(value: string): string {
  if (value === "") return value
  const num = Number(value)
  if (Number.isNaN(num)) return value
  return String(Math.min(100, Math.max(0, num)))
}

function clampPositive(value: string): string {
  if (value === "") return value
  const num = Number(value)
  if (Number.isNaN(num)) return value
  return String(Math.max(0, num))
}

type BatteryConfigDialogProps = {
  siteId: string
  isOpen: boolean
  onClose: () => void
  devices: SiteDeviceModel[]
}

export function BatteryConfigDialog({
  siteId,
  isOpen,
  onClose,
  devices,
}: BatteryConfigDialogProps) {
  const [rows, setRows] = useState<ConfigRow[]>([{ ...EMPTY_ROW }])
  const [showErrors, setShowErrors] = useState(false)
  const inverters = devices.filter(
    (d) => d.device_type.toLowerCase() === "inverter"
  )
  const hasIncompleteRow = rows.some((r) => !isRowComplete(r))

  const { mutate: create, isPending } = useCreateSiteBatteryConfig(siteId)

  useEffect(() => {
    if (isOpen) {
      setRows([{ ...EMPTY_ROW }])
      setShowErrors(false)
    }
  }, [isOpen])

  const updateRow = (i: number, field: keyof ConfigRow, value: string) => {
    setRows((prev) => {
      const next = [...prev]
      next[i] = { ...next[i], [field]: value }
      return next
    })
  }

  const addRow = () => setRows((prev) => [...prev, { ...EMPTY_ROW }])
  const removeRow = (i: number) =>
    setRows((prev) => prev.filter((_, j) => j !== i))

  const handleSave = () => {
    if (hasIncompleteRow) {
      setShowErrors(true)
      return
    }

    create(
      rows.map((r) => ({
        inverter_slave_id: Number(r.inverter_slave_id),
        battery_data: {
          battery_keys: r.battery_keys
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
          capacity_kwh: Number(r.capacity_kwh),
          low_soc_threshold: Number(r.low_soc_threshold),
          high_soc_threshold: Number(r.high_soc_threshold),
        },
      })),
      { onSuccess: onClose }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl rounded-2xl p-8 md:max-w-4xl">
        <DialogDescription className="sr-only">
          Configure battery SOC monitoring per inverter for this site.
        </DialogDescription>
        <div className="flex items-center justify-between">
          <DialogTitle className="text-left text-2xl font-bold text-[#1D1D1D]">
            Configure Battery SOC
          </DialogTitle>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-sm text-green-800">
          <Info className="h-4 w-4 shrink-0" />
          Add values - you can view generated table in dashboard
        </div>

        <div className="overflow-x-auto">
          <div className="grid min-w-[720px] grid-cols-[1.2fr_1.2fr_1fr_1fr_1fr_auto] gap-x-3 gap-y-1 text-sm font-semibold text-[#1D1D1D]">
            <span>Inverter</span>
            <span>Battery Keys</span>
            <span>Capacity (kWh)</span>
            <span>Low SOC %</span>
            <span>High SOC %</span>
            <span />
            {rows.map((row, i) => {
              const errorBorder = (empty: boolean) =>
                showErrors && empty ? "border-red-500" : "border-border/60"

              return (
                <div key={i} className="contents">
                  <Select
                    value={row.inverter_slave_id}
                    onValueChange={(v) => updateRow(i, "inverter_slave_id", v)}
                  >
                    <SelectTrigger
                      className={`${errorBorder(row.inverter_slave_id === "")} mt-2 w-full border bg-white`}
                    >
                      <SelectValue placeholder="Select inverter" />
                    </SelectTrigger>
                    <SelectContent>
                      {inverters.map((d) => (
                        <SelectItem key={d.uid} value={String(d.slave_id)}>
                          {d.device_type} · Slave {d.slave_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    value={row.battery_keys}
                    onChange={(e) =>
                      updateRow(i, "battery_keys", e.target.value)
                    }
                    placeholder="e.g. battery_soc, battery_soc2"
                    className={`${errorBorder(row.battery_keys.trim() === "")} mt-2 border bg-white`}
                  />
                  <Input
                    type="number"
                    min={0}
                    value={row.capacity_kwh}
                    onChange={(e) =>
                      updateRow(
                        i,
                        "capacity_kwh",
                        clampPositive(e.target.value)
                      )
                    }
                    placeholder="Enter value"
                    className={`${errorBorder(row.capacity_kwh === "")} mt-2 border bg-white`}
                  />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={row.low_soc_threshold}
                    onChange={(e) =>
                      updateRow(
                        i,
                        "low_soc_threshold",
                        clampPercent(e.target.value)
                      )
                    }
                    placeholder="Enter value"
                    className={`${errorBorder(row.low_soc_threshold === "")} mt-2 border bg-white`}
                  />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={row.high_soc_threshold}
                    onChange={(e) =>
                      updateRow(
                        i,
                        "high_soc_threshold",
                        clampPercent(e.target.value)
                      )
                    }
                    placeholder="Enter value"
                    className={`${errorBorder(row.high_soc_threshold === "")} mt-2 border bg-white`}
                  />

                  <button
                    onClick={() => removeRow(i)}
                    disabled={rows.length === 1}
                    className="text-muted-foreground hover:text-destructive mt-2 flex items-center justify-center disabled:opacity-30"
                    title="Remove row"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
          {inverters.length === 0 && (
            <p className="text-muted-foreground mt-2 text-xs">
              No inverter devices found for this site — an inverter must be
              added before battery SOC can be configured.
            </p>
          )}
          {showErrors && hasIncompleteRow && (
            <p className="mt-2 text-xs text-red-600">
              Fill in every field on each row before saving.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={addRow}
            className="border-border/60 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium text-[#1D1D1D]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add row
          </button>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-[#024159] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <CircleCheck className="h-4 w-4" />
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
