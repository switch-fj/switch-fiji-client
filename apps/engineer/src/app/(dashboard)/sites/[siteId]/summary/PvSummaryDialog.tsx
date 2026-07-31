"use client"

import { useEffect, useState } from "react"
import { CircleCheck, Info, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Input,
  Label,
  DatePickerInput,
} from "@workspace/ui"
import { useCreateSitePvs, useEditSitePvs } from "@/hooks/useSitePv"
import { isoDateOnlyToLocalDate, localDateToIsoDateOnly } from "@/utils/date"
import type { SitePvSummary } from "@/types/engineer"

type PvSummaryDialogProps = {
  siteId: string
  isOpen: boolean
  onClose: () => void
  existing: SitePvSummary | null
}

export function PvSummaryDialog({
  siteId,
  isOpen,
  onClose,
  existing,
}: PvSummaryDialogProps) {
  const [expectedProduction, setExpectedProduction] = useState("")
  const [year1Degradation, setYear1Degradation] = useState("")
  const [commissionedAt, setCommissionedAt] = useState<Date | undefined>()
  const [year2Degradation, setYear2Degradation] = useState("")
  const [systemSize, setSystemSize] = useState("")

  const { mutate: create, isPending: isCreating } = useCreateSitePvs(siteId)
  const { mutate: edit, isPending: isEditing } = useEditSitePvs(siteId)
  const isPending = isCreating || isEditing

  useEffect(() => {
    if (!isOpen) return
    setExpectedProduction(existing?.expected_production_kwh ?? "")
    setYear1Degradation(existing ? String(existing.year1_degradation) : "")
    setCommissionedAt(
      existing?.commissioned_at
        ? isoDateOnlyToLocalDate(existing.commissioned_at)
        : undefined
    )
    setYear2Degradation(existing ? String(existing.year2plus_degradation) : "")
    setSystemSize(existing?.system_size_kwp ?? "")
  }, [isOpen, existing])

  const handleSave = () => {
    if (!commissionedAt) return

    const payload = {
      commissioned_at: localDateToIsoDateOnly(commissionedAt),
      expected_production_kwh: expectedProduction,
      system_size_kwp: systemSize,
      year1_degradation: Number(year1Degradation),
      year2plus_degradation: Number(year2Degradation),
    }

    if (existing) {
      edit({ ...payload, uid: existing.uid }, { onSuccess: onClose })
    } else {
      create(payload, { onSuccess: onClose })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl rounded-2xl p-8 md:max-w-2xl">
        <DialogDescription className="sr-only">
          Fill in the PV summary details for this site.
        </DialogDescription>
        <div className="flex items-center justify-between">
          <DialogTitle className="text-left text-2xl font-bold text-[#1D1D1D]">
            {existing ? "Edit PV Summary" : "Generate PV Summary"}
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

        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="expected_production"
              className="text-sm font-semibold text-[#1D1D1D]"
            >
              Expected Production
            </Label>
            <Input
              id="expected_production"
              type="number"
              value={expectedProduction}
              onChange={(e) => setExpectedProduction(e.target.value)}
              placeholder="Enter value"
              className="border-border/60 border bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="year1_degradation"
              className="text-sm font-semibold text-[#1D1D1D]"
            >
              Year 1 Degradation
            </Label>
            <Input
              id="year1_degradation"
              type="number"
              value={year1Degradation}
              onChange={(e) => setYear1Degradation(e.target.value)}
              placeholder="Enter value"
              className="border-border/60 border bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-semibold text-[#1D1D1D]">
              Commisioning Date
            </Label>
            <DatePickerInput
              value={commissionedAt}
              onChange={setCommissionedAt}
              placeholder="Enter value"
              className="border-border/60 w-full border bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="year2_degradation"
              className="text-sm font-semibold text-[#1D1D1D]"
            >
              Year2+ Degradation
            </Label>
            <Input
              id="year2_degradation"
              type="number"
              value={year2Degradation}
              onChange={(e) => setYear2Degradation(e.target.value)}
              placeholder="Enter value"
              className="border-border/60 border bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="system_size"
              className="text-sm font-semibold text-[#1D1D1D]"
            >
              System Size kWp
            </Label>
            <Input
              id="system_size"
              type="number"
              value={systemSize}
              onChange={(e) => setSystemSize(e.target.value)}
              placeholder="Enter value"
              className="border-border/60 border bg-white"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex w-fit items-center gap-2 rounded-lg bg-[#024159] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <CircleCheck className="h-4 w-4" />
          {isPending ? "Saving…" : "Save"}
        </button>
      </DialogContent>
    </Dialog>
  )
}
