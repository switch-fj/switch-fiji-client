import api from "@/lib/axios"
import { JOBRUN } from "@/constants/api"
import type { ServerResponse } from "@/types/client"
import type { JobRunPage, JobRunStatus } from "@/types/jobrun"

export const getJobRuns = async (params: {
  status?: JobRunStatus
  next_cursor?: string | null
  limit?: number
}): Promise<ServerResponse<JobRunPage>> => {
  const query: Record<string, string | number> = { limit: params.limit ?? 30 }
  if (params.status) query.status = params.status
  if (params.next_cursor) query.next_cursor = params.next_cursor
  const { data } = await api.get<ServerResponse<JobRunPage>>(JOBRUN.LIST, {
    params: query,
  })
  return data
}
