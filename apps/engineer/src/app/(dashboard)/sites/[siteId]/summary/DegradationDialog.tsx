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
} from "@workspace/ui"
import {
  useCreateSiteDegradation,
  useEditSiteDegradation,
} from "@/hooks/useSitePv"
import { isoDateOnlyToLocalDate } from "@/utils/date"

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function monthLabels(commissionedAt: string | null) {
  if (!commissionedAt) {
    return Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`)
  }
  const start = isoDateOnlyToLocalDate(commissionedAt).getMonth()
  return Array.from({ length: 12 }, (_, i) => MONTH_NAMES[(start + i) % 12])
}

/**
 * `existingRaw` is the site's raw `degradation` JSON string: an array of
 * year-objects, one per year. The first entry is the original, undegraded
 * Year 1 monthly kWh values — exactly what this form edits.
 */
function parseYear1Values(
  existingRaw: string | null,
  labels: string[]
): string[] {
  if (!existingRaw) return Array(12).fill("")
  try {
    const parsed: unknown = JSON.parse(existingRaw)
    if (!Array.isArray(parsed) || parsed.length === 0) return Array(12).fill("")
    const year1 = parsed[0] as Record<string, number>
    return labels.map((label) => (label in year1 ? String(year1[label]) : ""))
  } catch {
    return Array(12).fill("")
  }
}

type DegradationDialogProps = {
  siteId: string
  isOpen: boolean
  onClose: () => void
  commissionedAt: string | null
  existingRaw: string | null
  isEdit: boolean
}

export function DegradationDialog({
  siteId,
  isOpen,
  onClose,
  commissionedAt,
  existingRaw,
  isEdit,
}: DegradationDialogProps) {
  const [values, setValues] = useState<string[]>(Array(12).fill(""))

  const { mutate: create, isPending: isCreating } =
    useCreateSiteDegradation(siteId)
  const { mutate: edit, isPending: isEditing } = useEditSiteDegradation(siteId)
  const isPending = isCreating || isEditing

  useEffect(() => {
    if (!isOpen) return
    setValues(parseYear1Values(existingRaw, monthLabels(commissionedAt)))
  }, [isOpen, existingRaw, commissionedAt])

  const labels = monthLabels(commissionedAt)

  const handleSave = () => {
    const monthly_kwh_values = values.map((v) => Number(v) || 0)
    const mutate = isEdit ? edit : create
    mutate({ monthly_kwh_values }, { onSuccess: onClose })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl rounded-2xl p-8 md:max-w-3xl">
        <DialogDescription className="sr-only">
          Enter the first year&apos;s monthly kWh values for this site.
        </DialogDescription>
        <div className="flex items-center justify-between">
          <DialogTitle className="text-left text-2xl font-bold text-[#1D1D1D]">
            {isEdit ? "Edit Year 1 Degradation" : "Add Year 1 Degradation"}
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
          Enter each month&apos;s expected kWh, starting from the commissioning
          month
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
          {labels.map((label, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Label className="text-sm font-semibold text-[#1D1D1D]">
                {label}
              </Label>
              <Input
                type="number"
                value={values[i]}
                onChange={(e) =>
                  setValues((prev) => {
                    const next = [...prev]
                    next[i] = e.target.value
                    return next
                  })
                }
                placeholder="Enter value"
                className="border-border/60 border bg-white"
              />
            </div>
          ))}
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
