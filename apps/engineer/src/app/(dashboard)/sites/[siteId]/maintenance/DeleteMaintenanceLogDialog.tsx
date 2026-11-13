"use client"

import { Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui"
import { useDeleteMaintenanceLog } from "@/hooks/useMaintenanceLogs"
import { formatIsoDateOnly } from "@/utils/date"
import type { MaintenanceLog } from "@/types/engineer"
import { MAINTENANCE_TYPE_LABEL } from "./maintenanceTypes"

type DeleteMaintenanceLogDialogProps = {
  siteId: string
  log: MaintenanceLog | null
  onClose: () => void
}

export function DeleteMaintenanceLogDialog({
  siteId,
  log,
  onClose,
}: DeleteMaintenanceLogDialogProps) {
  const { mutate, isPending } = useDeleteMaintenanceLog(siteId)

  const handleDelete = () => {
    if (!log) return
    mutate(log.uid, { onSuccess: onClose })
  }

  return (
    <Dialog
      open={!!log}
      onOpenChange={(open) => !open && !isPending && onClose()}
    >
      <DialogContent
        className="max-w-sm overflow-hidden rounded-2xl p-0"
        showCloseButton={false}
      >
        <div className="flex flex-col items-center gap-4 px-6 pt-8 pb-2 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#FA4F19]/10">
            <Trash2 className="h-6 w-6 text-[#FA4F19]" aria-hidden="true" />
          </span>
          <div className="space-y-1.5">
            <DialogTitle className="text-xl font-semibold">
              Delete this entry?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {log
                ? `${MAINTENANCE_TYPE_LABEL[log.maintenance_type]} on ${formatIsoDateOnly(log.performed_on)} will be removed from the site's maintenance log. This can't be undone.`
                : null}
            </DialogDescription>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-6">
          <button
            onClick={onClose}
            disabled={isPending}
            className="border-border/60 flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold text-[#1D1D1D] transition-colors hover:bg-neutral-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 rounded-lg bg-[#FA4F19] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
