"use client"

import { useEffect, useState } from "react"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { DatePickerInput } from "@workspace/ui"
import { useMaintenanceLogs } from "@/hooks/useMaintenanceLogs"
import {
  formatIsoDateOnly,
  localDateToDateString,
  toLocalDateTime,
} from "@/utils/date"
import type {
  MaintenanceLog,
  MaintenanceLogQuery,
  MaintenanceType,
} from "@/types/engineer"
import { MaintenanceLogDialog } from "./MaintenanceLogDialog"
import { DeleteMaintenanceLogDialog } from "./DeleteMaintenanceLogDialog"
import {
  MAINTENANCE_TYPE_LABEL,
  MAINTENANCE_TYPE_OPTIONS,
  MAINTENANCE_TYPE_TONE,
} from "./maintenanceTypes"

const PAGE_SIZE = 10
// Descriptions longer than this get clamped with a "Show more" toggle.
const CLAMP_CHARS = 140

export function MaintenanceLogSection({ siteId }: { siteId: string }) {
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<MaintenanceType | "">("")
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<MaintenanceLog | null>(null)
  const [deleting, setDeleting] = useState<MaintenanceLog | null>(null)

  const query: MaintenanceLogQuery = {
    page,
    limit: PAGE_SIZE,
    ...(typeFilter ? { maintenance_type: typeFilter } : {}),
    ...(fromDate ? { from_date: localDateToDateString(fromDate) } : {}),
    ...(toDate ? { to_date: localDateToDateString(toDate) } : {}),
  }

  const { data, isLoading, isError, isFetching, isPlaceholderData } =
    useMaintenanceLogs(siteId, query)
  const logs = data?.data.items ?? []
  const pagination = data?.data.pagination
  const isFiltered = !!typeFilter || !!fromDate || !!toDate

  // Deleting the last entry on a page would otherwise strand the user on an
  // empty page — step back to the last page that still has rows.
  useEffect(() => {
    if (!pagination || isPlaceholderData) return
    const lastPage = Math.max(1, pagination.total_pages)
    if (page > lastPage) setPage(lastPage)
  }, [pagination, page, isPlaceholderData])

  const updateFilter = (fn: () => void) => {
    fn()
    setPage(1)
  }

  const clearFilters = () =>
    updateFilter(() => {
      setTypeFilter("")
      setFromDate(undefined)
      setToDate(undefined)
    })

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (log: MaintenanceLog) => {
    setEditing(log)
    setDialogOpen(true)
  }

  const today = new Date()
  const showFilterBar = isFiltered || (pagination?.total ?? 0) > 0

  return (
    <div className="border-border/60 rounded-xl border">
      <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div className="flex items-baseline gap-2">
          <h3 className="text-base font-semibold text-[#1D1D1D]">
            Maintenance log
          </h3>
          {pagination && pagination.total > 0 && (
            <span className="text-muted-foreground text-sm">
              {pagination.total} {pagination.total === 1 ? "entry" : "entries"}
              {isFiltered ? " matching" : ""}
            </span>
          )}
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-[#024159] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Log maintenance
        </button>
      </div>

      {showFilterBar && (
        <div className="border-border/60 flex flex-wrap items-center gap-3 border-b bg-neutral-50/60 px-5 py-3">
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) =>
                updateFilter(() =>
                  setTypeFilter(e.target.value as MaintenanceType | "")
                )
              }
              className="border-border/60 text-foreground focus:ring-primary h-9 appearance-none rounded-lg border bg-white py-1.5 pr-8 pl-3 text-sm font-medium outline-none focus:ring-1"
              aria-label="Filter by type"
            >
              <option value="">All types</option>
              {MAINTENANCE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2">
            <DatePickerInput
              value={fromDate}
              onChange={(d) => updateFilter(() => setFromDate(d))}
              disabledDates={
                toDate
                  ? [{ after: toDate }, { after: today }]
                  : { after: today }
              }
              dateFormat="d MMM yyyy"
              placeholder="From"
              className="border-border/60 h-9 w-36"
            />
            <span className="text-muted-foreground text-sm">–</span>
            <DatePickerInput
              value={toDate}
              onChange={(d) => updateFilter(() => setToDate(d))}
              disabledDates={
                fromDate
                  ? [{ before: fromDate }, { after: today }]
                  : { after: today }
              }
              dateFormat="d MMM yyyy"
              placeholder="To"
              className="border-border/60 h-9 w-36"
            />
          </div>

          {isFiltered && (
            <button
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground text-sm underline-offset-2 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2 p-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-muted h-12 w-full animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : isError ? (
        <p className="px-5 py-8 text-center text-sm text-red-600">
          Couldn&apos;t load the maintenance log. Try refreshing the page.
        </p>
      ) : logs.length === 0 ? (
        isFiltered ? (
          <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
            <p className="text-muted-foreground text-sm">
              No maintenance matches these filters.
            </p>
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-[#024159] underline-offset-2 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="p-5">
            <div className="border-border/60 flex flex-col items-center gap-3 rounded-lg border border-dashed py-8 text-center">
              <p className="text-muted-foreground text-sm">
                No maintenance has been logged for this site yet.
              </p>
              <button
                onClick={openCreate}
                className="flex items-center gap-1.5 rounded-lg bg-[#024159] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" />
                Log first entry
              </button>
            </div>
          </div>
        )
      ) : (
        <div
          className={`overflow-x-auto p-5 transition-opacity ${isFetching && isPlaceholderData ? "opacity-60" : ""}`}
        >
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-sky-100">
                <th className="rounded-l-md px-3 py-2 text-left font-semibold whitespace-nowrap text-[#1D1D1D]">
                  Date
                </th>
                <th className="px-3 py-2 text-left font-semibold text-[#1D1D1D]">
                  Type
                </th>
                <th className="px-3 py-2 text-left font-semibold text-[#1D1D1D]">
                  Personnel
                </th>
                <th className="px-3 py-2 text-left font-semibold text-[#1D1D1D]">
                  Work performed
                </th>
                <th className="rounded-r-md px-3 py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <MaintenanceLogRow
                  key={log.uid}
                  log={log}
                  striped={i % 2 === 1}
                  onEdit={() => openEdit(log)}
                  onDelete={() => setDeleting(log)}
                />
              ))}
            </tbody>
          </table>

          {pagination && pagination.total_pages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-muted-foreground text-sm">
                {(pagination.current_page - 1) * pagination.limit + 1}–
                {Math.min(
                  pagination.current_page * pagination.limit,
                  pagination.total
                )}{" "}
                of {pagination.total}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isFetching}
                  className="border-border/60 flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-[#1D1D1D] hover:bg-neutral-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.total_pages, p + 1))
                  }
                  disabled={page >= pagination.total_pages || isFetching}
                  className="border-border/60 flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-[#1D1D1D] hover:bg-neutral-50 disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <MaintenanceLogDialog
        siteId={siteId}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        existing={editing}
      />
      <DeleteMaintenanceLogDialog
        siteId={siteId}
        log={deleting}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}

function MaintenanceLogRow({
  log,
  striped,
  onEdit,
  onDelete,
}: {
  log: MaintenanceLog
  striped: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isLong = log.work_performed.length > CLAMP_CHARS
  const cell = "border-border/60 border-b px-3 py-3 align-top"

  return (
    <tr className={striped ? "bg-sky-50" : "bg-white"}>
      <td className={`${cell} whitespace-nowrap`}>
        <span className="font-medium text-[#1D1D1D]">
          {formatIsoDateOnly(log.performed_on)}
        </span>
        {log.last_edited_by_uid && (
          <span
            className="text-muted-foreground block text-xs"
            title={`Last edited ${toLocalDateTime(log.updated_at)}`}
          >
            Edited
          </span>
        )}
      </td>
      <td className={cell}>
        <span
          className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${MAINTENANCE_TYPE_TONE[log.maintenance_type]}`}
        >
          {MAINTENANCE_TYPE_LABEL[log.maintenance_type]}
        </span>
      </td>
      <td className={`${cell} text-[#1D1D1D]`}>{log.personnel}</td>
      <td className={`${cell} max-w-[520px] text-[#1D1D1D]`}>
        <p
          className={`whitespace-pre-line ${isLong && !expanded ? "line-clamp-2" : ""}`}
        >
          {log.work_performed}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-xs font-medium text-[#024159] hover:underline"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </td>
      <td className={`${cell} text-right`}>
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onEdit}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1 transition-colors"
            title="Edit entry"
            aria-label="Edit entry"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="text-muted-foreground rounded p-1 transition-colors hover:bg-[#FA4F19]/10 hover:text-[#FA4F19]"
            title="Delete entry"
            aria-label="Delete entry"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}
