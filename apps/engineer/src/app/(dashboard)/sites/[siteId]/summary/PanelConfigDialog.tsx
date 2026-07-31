"use client"

import { useEffect, useState } from "react"
import { CircleCheck, Info, Plus, Trash2, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Input,
} from "@workspace/ui"
import { useCreateSitePanels, useEditSitePanels } from "@/hooks/useSitePanels"
import type { SitePanelRef } from "@/types/engineer"

type PanelRow = {
  uid?: string
  panel_type: string
  watt: string
  vmp: string
  voc: string
  imp: string
}

const EMPTY_ROW: PanelRow = {
  panel_type: "",
  watt: "",
  vmp: "",
  voc: "",
  imp: "",
}

function rowsFromExisting(panels: SitePanelRef[]): PanelRow[] {
  if (panels.length === 0) return [{ ...EMPTY_ROW }]
  return panels.map((p) => ({
    uid: p.uid,
    panel_type: p.panel_type,
    watt: String(p.watt),
    vmp: String(p.vmp),
    voc: String(p.voc),
    imp: String(p.imp),
  }))
}

type PanelConfigDialogProps = {
  siteId: string
  isOpen: boolean
  onClose: () => void
  existing: SitePanelRef[]
}

export function PanelConfigDialog({
  siteId,
  isOpen,
  onClose,
  existing,
}: PanelConfigDialogProps) {
  const [rows, setRows] = useState<PanelRow[]>([{ ...EMPTY_ROW }])
  const isEdit = existing.length > 0

  const { mutate: create, isPending: isCreating } = useCreateSitePanels(siteId)
  const { mutate: edit, isPending: isEditing } = useEditSitePanels(siteId)
  const isPending = isCreating || isEditing

  useEffect(() => {
    if (isOpen) setRows(rowsFromExisting(existing))
  }, [isOpen, existing])

  const updateRow = (i: number, field: keyof PanelRow, value: string) => {
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
    if (isEdit) {
      edit(
        rows.map((r) => ({
          uid: r.uid!,
          panel_type: r.panel_type,
          watt: Number(r.watt),
          vmp: Number(r.vmp),
          voc: Number(r.voc),
          imp: Number(r.imp),
        })),
        { onSuccess: onClose }
      )
    } else {
      create(
        rows.map((r) => ({
          panel_type: r.panel_type,
          watt: Number(r.watt),
          vmp: Number(r.vmp),
          voc: Number(r.voc),
          imp: Number(r.imp),
        })),
        { onSuccess: onClose }
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl rounded-2xl p-8 md:max-w-3xl">
        <DialogDescription className="sr-only">
          Configure the solar panel types used at this site.
        </DialogDescription>
        <div className="flex items-center justify-between">
          <DialogTitle className="text-left text-2xl font-bold text-[#1D1D1D]">
            {isEdit ? "Edit Panel Config" : "Solar Panel KWH"}
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
          <div className="grid min-w-[560px] grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-x-3 gap-y-1 text-sm font-semibold text-[#1D1D1D]">
            <span>Panel Type</span>
            <span>Watt</span>
            <span>Vmp</span>
            <span>Voc</span>
            <span>Imp</span>
            <span />
            {rows.map((row, i) => (
              <div key={i} className="contents">
                <Input
                  value={row.panel_type}
                  onChange={(e) => updateRow(i, "panel_type", e.target.value)}
                  placeholder="Enter value"
                  className="border-border/60 mt-2 border bg-white"
                />
                <Input
                  type="number"
                  value={row.watt}
                  onChange={(e) => updateRow(i, "watt", e.target.value)}
                  placeholder="Enter value"
                  className="border-border/60 mt-2 border bg-white"
                />
                <Input
                  type="number"
                  value={row.vmp}
                  onChange={(e) => updateRow(i, "vmp", e.target.value)}
                  placeholder="Enter value"
                  className="border-border/60 mt-2 border bg-white"
                />
                <Input
                  type="number"
                  value={row.voc}
                  onChange={(e) => updateRow(i, "voc", e.target.value)}
                  placeholder="Enter value"
                  className="border-border/60 mt-2 border bg-white"
                />
                <Input
                  type="number"
                  value={row.imp}
                  onChange={(e) => updateRow(i, "imp", e.target.value)}
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
            ))}
          </div>
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
