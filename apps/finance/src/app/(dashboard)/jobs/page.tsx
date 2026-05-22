"use client"

import { Suspense, useState } from "react"
import { format } from "date-fns"
import { RefreshCw } from "lucide-react"
import { Button } from "@workspace/ui"
import { useGetJobRuns } from "@/hooks/useJobRun"
import type { JobRunRespModel, JobRunStatus } from "@/types/jobrun"

const STATUS_OPTIONS: { label: string; value: JobRunStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Running", value: "running" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
  { label: "Invalid", value: "invalid" },
]

const STATUS_STYLES: Record<JobRunStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  running: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  invalid: "bg-gray-100 text-gray-500",
}

const JOB_TYPE_LABEL: Record<string, string> = {
  compute_invoice: "Compute Invoice",
}

function fmtDt(val: string | null | undefined) {
  if (!val) return "—"
  try {
    return format(new Date(val), "d MMM yyyy, HH:mm:ss")
  } catch {
    return val
  }
}

function StatusBadge({ status }: { status: JobRunStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  )
}

function JobRow({ job }: { job: JobRunRespModel }) {
  return (
    <div className="border-border grid grid-cols-[180px_150px_120px_1fr_1fr_1fr] items-start gap-4 border-t bg-white px-5 py-3 text-sm">
      <span className="text-text-1 font-medium">
        {JOB_TYPE_LABEL[job.job_type] ?? job.job_type}
      </span>
      <StatusBadge status={job.status} />
      <span className="text-muted-foreground font-mono text-xs">
        {job.task_id.slice(0, 8)}…
      </span>
      <span className="text-text-1">{fmtDt(job.created_at)}</span>
      <span className="text-text-1">{fmtDt(job.started_at)}</span>
      <span className={job.error ? "text-destructive text-xs" : "text-text-1"}>
        {job.error ?? fmtDt(job.completed_at)}
      </span>
    </div>
  )
}

function JobsPageInner() {
  const [statusFilter, setStatusFilter] = useState<JobRunStatus | "">("")

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isFetching,
  } = useGetJobRuns(statusFilter || undefined)

  const jobs = data?.pages.flatMap((p) => p.data?.items ?? []) ?? []

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-1 text-xl font-semibold">Job Runs</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Background jobs triggered for this account
          </p>
        </div>
        <Button
          variant="outlined"
          size="md"
          className="max-w-fit gap-2 rounded-sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value as JobRunStatus | "")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === opt.value
                ? "bg-[#2C6B6B] text-white"
                : "border border-[#2C6B6B]/30 bg-white text-[#2C6B6B] hover:bg-[#2C6B6B]/10"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border-border overflow-hidden rounded-xl border">
        {/* Header row */}
        <div className="bg-blue/40 grid grid-cols-[180px_150px_120px_1fr_1fr_1fr] gap-4 px-5 py-2.5 text-xs font-semibold text-[#2C6B6B]">
          <span>Job Type</span>
          <span>Status</span>
          <span>Task ID</span>
          <span>Created</span>
          <span>Started</span>
          <span>Completed / Error</span>
        </div>

        {isLoading && (
          <div className="text-muted-foreground py-10 text-center text-sm">
            Loading jobs…
          </div>
        )}

        {isError && (
          <div className="text-destructive py-10 text-center text-sm">
            Failed to load jobs. Please refresh.
          </div>
        )}

        {!isLoading && !isError && jobs.length === 0 && (
          <div className="text-muted-foreground py-10 text-center text-sm">
            No jobs found.
          </div>
        )}

        {jobs.map((job) => (
          <JobRow key={job.uid} job={job} />
        ))}

        {hasNextPage && (
          <div className="border-border flex justify-center border-t bg-white px-5 py-3">
            <Button
              variant="outlined"
              size="md"
              className="rounded-sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading…" : "Load more"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function JobsPage() {
  return (
    <Suspense>
      <JobsPageInner />
    </Suspense>
  )
}
