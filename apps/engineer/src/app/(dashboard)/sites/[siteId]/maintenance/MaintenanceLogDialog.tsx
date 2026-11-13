"use client"

import { useEffect, useState } from "react"
import { CircleCheck, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Input,
  Label,
  Textarea,
  DatePickerInput,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui"
import {
  useCreateMaintenanceLog,
  useUpdateMaintenanceLog,
} from "@/hooks/useMaintenanceLogs"
import { isoDateOnlyToLocalDate, localDateToDateString } from "@/utils/date"
import type {
  CreateMaintenanceLogInput,
  MaintenanceLog,
  MaintenanceType,
  UpdateMaintenanceLogInput,
} from "@/types/engineer"
import { MAINTENANCE_TYPE_OPTIONS } from "./maintenanceTypes"

type FormState = {
  maintenance_type: MaintenanceType | ""
  performed_on: Date | undefined
  personnel: string
  work_performed: string
}

function initialState(existing: MaintenanceLog | null): FormState {
  return {
    maintenance_type: existing?.maintenance_type ?? "",
    performed_on: existing
      ? isoDateOnlyToLocalDate(existing.performed_on)
      : new Date(),
    personnel: existing?.personnel ?? "",
    work_performed: existing?.work_performed ?? "",
  }
}

type MaintenanceLogDialogProps = {
  siteId: string
  isOpen: boolean
  onClose: () => void
  /** Pass a log to edit it; null to log new maintenance. */
  existing: MaintenanceLog | null
}

export function MaintenanceLogDialog({
  siteId,
  isOpen,
  onClose,
  existing,
}: MaintenanceLogDialogProps) {
  const [form, setForm] = useState<FormState>(() => initialState(existing))
  const [showErrors, setShowErrors] = useState(false)

  const { mutate: create, isPending: isCreating } =
    useCreateMaintenanceLog(siteId)
  const { mutate: update, isPending: isUpdating } =
    useUpdateMaintenanceLog(siteId)
  const isPending = isCreating || isUpdating

  useEffect(() => {
    if (!isOpen) return
    setForm(initialState(existing))
    setShowErrors(false)
  }, [isOpen, existing])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const errors = {
    maintenance_type: !form.maintenance_type ? "Choose a type" : null,
    performed_on: !form.performed_on ? "Pick the date it was done" : null,
    personnel: !form.personnel.trim() ? "Who carried out the work?" : null,
    work_performed: !form.work_performed.trim()
      ? "Describe the work performed"
      : null,
  }
  const hasErrors = Object.values(errors).some(Boolean)
  const fieldError = (key: keyof typeof errors) =>
    showErrors ? errors[key] : null
  const borderFor = (key: keyof typeof errors) =>
    fieldError(key) ? "border-red-500" : "border-border/60"

  const handleSave = () => {
    if (hasErrors) {
      setShowErrors(true)
      return
    }

    const payload: CreateMaintenanceLogInput = {
      maintenance_type: form.maintenance_type as MaintenanceType,
      performed_on: localDateToDateString(form.performed_on!),
      personnel: form.personnel.trim(),
      work_performed: form.work_performed.trim(),
    }

    if (!existing) {
      create(payload, { onSuccess: onClose })
      return
    }

    // PATCH only what actually changed.
    const changes: UpdateMaintenanceLogInput = {}
    if (payload.maintenance_type !== existing.maintenance_type)
      changes.maintenance_type = payload.maintenance_type
    if (payload.performed_on !== existing.performed_on.slice(0, 10))
      changes.performed_on = payload.performed_on
    if (payload.personnel !== existing.personnel)
      changes.personnel = payload.personnel
    if (payload.work_performed !== existing.work_performed)
      changes.work_performed = payload.work_performed

    if (Object.keys(changes).length === 0) {
      onClose()
      return
    }
    update({ logUid: existing.uid, payload: changes }, { onSuccess: onClose })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl rounded-2xl p-8 md:max-w-xl">
        <DialogDescription className="sr-only">
          Record maintenance carried out at this site.
        </DialogDescription>
        <div className="flex items-center justify-between">
          <DialogTitle className="text-left text-2xl font-bold text-[#1D1D1D]">
            {existing ? "Edit Maintenance" : "Log Maintenance"}
          </DialogTitle>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-semibold text-[#1D1D1D]">Type</Label>
            <Select
              value={form.maintenance_type}
              onValueChange={(v) =>
                set("maintenance_type", v as MaintenanceType)
              }
            >
              <SelectTrigger
                className={`${borderFor("maintenance_type")} h-11 w-full border bg-white`}
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {MAINTENANCE_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={fieldError("maintenance_type")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-semibold text-[#1D1D1D]">
              Date performed
            </Label>
            <DatePickerInput
              value={form.performed_on}
              onChange={(d) => set("performed_on", d)}
              disabledDates={{ after: new Date() }}
              dateFormat="d MMM yyyy"
              placeholder="Select date"
              className={`${borderFor("performed_on")} w-full`}
            />
            <FieldError message={fieldError("performed_on")} />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label
              htmlFor="maintenance_personnel"
              className="text-sm font-semibold text-[#1D1D1D]"
            >
              Personnel
            </Label>
            <Input
              id="maintenance_personnel"
              value={form.personnel}
              onChange={(e) => set("personnel", e.target.value)}
              placeholder="e.g. J. Naidu, R. Kumar"
              className={`${borderFor("personnel")} border bg-white`}
            />
            <FieldError message={fieldError("personnel")} />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label
              htmlFor="maintenance_work"
              className="text-sm font-semibold text-[#1D1D1D]"
            >
              Work performed
            </Label>
            <Textarea
              id="maintenance_work"
              value={form.work_performed}
              onChange={(e) => set("work_performed", e.target.value)}
              placeholder="What was done, parts replaced, anything to follow up on"
              className={`${borderFor("work_performed")} min-h-28 border bg-white`}
            />
            <FieldError message={fieldError("work_performed")} />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex w-fit items-center gap-2 rounded-lg bg-[#024159] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <CircleCheck className="h-4 w-4" />
          {isPending ? "Saving…" : existing ? "Save changes" : "Save"}
        </button>
      </DialogContent>
    </Dialog>
  )
}

function FieldError({ message }: { message: string | null }) {
  if (!message) return null
  return <p className="text-xs text-red-600">{message}</p>
}
