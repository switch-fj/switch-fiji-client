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
import {
  useCreateSiteStringWiring,
  useEditSiteStringWiring,
} from "@/hooks/useSitePanels"
import type {
  SiteDeviceModel,
  SitePanelRef,
  StringWiringItemInput,
} from "@/types/engineer"

type StringRow = {
  inverter: string
  mppt: string
  string_id: string
  panel_ref_uid: string
  panel_qty: string
}

const EMPTY_ROW: StringRow = {
  inverter: "",
  mppt: "",
  string_id: "",
  panel_ref_uid: "",
  panel_qty: "",
}

function rowsFromExisting(rows: StringWiringItemInput[]): StringRow[] {
  if (rows.length === 0) return [{ ...EMPTY_ROW }]
  return rows.map((r) => ({
    inverter: String(r.inverter),
    mppt: String(r.mppt),
    string_id: String(r.string_id),
    panel_ref_uid: r.panel_ref_uid,
    panel_qty: String(r.panel_qty),
  }))
}

/** The highest `pvN_*` index present in the device's latest telemetry is how
 * many MPPT inputs the inverter has, e.g. a reading with `pv4_i` means MPPT
 * values for that device are only valid in the 0–4 range. */
function getMaxMppt(device: SiteDeviceModel | undefined): number | null {
  if (!device?.recent_telemetry_reading) return null
  try {
    const reading = JSON.parse(device.recent_telemetry_reading) as Record<
      string,
      unknown
    >
    let max = 0
    for (const key of Object.keys(reading)) {
      const match = /^pv(\d+)_/i.exec(key)
      if (match) max = Math.max(max, Number(match[1]))
    }
    return max > 0 ? max : null
  } catch {
    return null
  }
}

function clampMppt(value: string, maxMppt: number | null): string {
  if (value === "") return value
  const num = Number(value)
  if (Number.isNaN(num)) return value
  const clamped = Math.max(1, maxMppt !== null ? Math.min(num, maxMppt) : num)
  return String(clamped)
}

/** String ID and panel quantity have no upper bound, but zero/negative
 * values don't make sense for either. */
function clampPositive(value: string): string {
  if (value === "") return value
  const num = Number(value)
  if (Number.isNaN(num)) return value
  return String(Math.max(1, num))
}

type StringWiringDialogProps = {
  siteId: string
  isOpen: boolean
  onClose: () => void
  existingUid: string | null
  existingRows: StringWiringItemInput[]
  devices: SiteDeviceModel[]
  panels: SitePanelRef[]
}

export function StringWiringDialog({
  siteId,
  isOpen,
  onClose,
  existingUid,
  existingRows,
  devices,
  panels,
}: StringWiringDialogProps) {
  const [rows, setRows] = useState<StringRow[]>([{ ...EMPTY_ROW }])
  const isEdit = !!existingUid
  const inverters = devices.filter(
    (d) => d.device_type.toLowerCase() === "inverter"
  )

  const { mutate: create, isPending: isCreating } =
    useCreateSiteStringWiring(siteId)
  const { mutate: edit, isPending: isEditing } = useEditSiteStringWiring(siteId)
  const isPending = isCreating || isEditing

  useEffect(() => {
    if (isOpen) setRows(rowsFromExisting(existingRows))
  }, [isOpen, existingRows])

  const updateRow = (i: number, field: keyof StringRow, value: string) => {
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
    const strings: StringWiringItemInput[] = rows.map((r) => ({
      inverter: Number(r.inverter),
      mppt: Number(r.mppt),
      string_id: Number(r.string_id),
      panel_ref_uid: r.panel_ref_uid,
      panel_qty: Number(r.panel_qty),
    }))

    if (isEdit) {
      edit(strings, { onSuccess: onClose })
    } else {
      create(strings, { onSuccess: onClose })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl rounded-2xl p-8 md:max-w-4xl">
        <DialogDescription className="sr-only">
          Configure how panel strings are wired to inverters and MPPTs.
        </DialogDescription>
        <div className="flex items-center justify-between">
          <DialogTitle className="text-left text-2xl font-bold text-[#1D1D1D]">
            {isEdit ? "Edit String Wiring" : "Configure String Wiring"}
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
          <div className="grid min-w-[680px] grid-cols-[1.4fr_0.8fr_0.8fr_1.4fr_0.8fr_auto] gap-x-3 gap-y-1 text-sm font-semibold text-[#1D1D1D]">
            <span>Inverter</span>
            <span>MPPT</span>
            <span>String ID</span>
            <span>Panel</span>
            <span>Qty</span>
            <span />
            {rows.map((row, i) => {
              const selectedInverter = inverters.find(
                (d) => String(d.slave_id) === row.inverter
              )
              const maxMppt = getMaxMppt(selectedInverter)

              return (
                <div key={i} className="contents">
                  <Select
                    value={row.inverter}
                    onValueChange={(v) => updateRow(i, "inverter", v)}
                  >
                    <SelectTrigger className="border-border/60 mt-2 w-full border bg-white">
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
                    type="number"
                    min={1}
                    max={maxMppt ?? undefined}
                    value={row.mppt}
                    onChange={(e) =>
                      updateRow(i, "mppt", clampMppt(e.target.value, maxMppt))
                    }
                    placeholder="Enter value"
                    className="border-border/60 mt-2 border bg-white"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={row.string_id}
                    onChange={(e) =>
                      updateRow(i, "string_id", clampPositive(e.target.value))
                    }
                    placeholder="Enter value"
                    className="border-border/60 mt-2 border bg-white"
                  />

                  <Select
                    value={row.panel_ref_uid}
                    onValueChange={(v) => updateRow(i, "panel_ref_uid", v)}
                  >
                    <SelectTrigger className="border-border/60 mt-2 w-full border bg-white">
                      <SelectValue placeholder="Select panel" />
                    </SelectTrigger>
                    <SelectContent>
                      {panels.map((p) => (
                        <SelectItem key={p.uid} value={p.uid}>
                          {p.panel_type} ({p.watt}W)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    min={1}
                    value={row.panel_qty}
                    onChange={(e) =>
                      updateRow(i, "panel_qty", clampPositive(e.target.value))
                    }
                    placeholder="Enter value"
                    className="border-border/60 mt-2 border bg-white"
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
              added before wiring can be configured.
            </p>
          )}
          {panels.length === 0 && (
            <p className="text-muted-foreground mt-2 text-xs">
              No panels configured yet — add a panel config first to select one
              here.
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
