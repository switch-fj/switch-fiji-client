"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { getJobRuns } from "@/requests/jobrun"
import type { JobRunStatus } from "@/types/jobrun"

export const JOB_KEYS = {
  list: (status?: JobRunStatus) => ["jobruns", status ?? "all"] as const,
}

export const useGetJobRuns = (status?: JobRunStatus) =>
  useInfiniteQuery({
    queryKey: JOB_KEYS.list(status),
    queryFn: ({ pageParam }) =>
      getJobRuns({ status, next_cursor: pageParam, limit: 30 }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.data?.pagination?.next_cursor ?? undefined,
  })
