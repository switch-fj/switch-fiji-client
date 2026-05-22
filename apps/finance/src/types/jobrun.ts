import type { CursorPagination } from "./invoice"

export type JobRunStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "invalid"
export type JobType = "compute_invoice"
export type JobReferenceType = "contract"

export type JobRunRespModel = {
  uid: string
  created_at: string
  updated_at: string
  task_id: string
  job_type: JobType
  reference_type: JobReferenceType
  status: JobRunStatus
  reference_uid: string
  triggered_by_uid: string | null
  result_uid: string | null
  meta: string | null
  error: string | null
  started_at: string | null
  completed_at: string | null
}

export type JobRunPage = {
  items: JobRunRespModel[]
  pagination: CursorPagination
}
