"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createMaintenanceLog,
  deleteMaintenanceLog,
  getMaintenanceLogs,
  updateMaintenanceLog,
} from "@/requests/maintenanceLogs"
import type {
  CreateMaintenanceLogInput,
  MaintenanceLogQuery,
  UpdateMaintenanceLogInput,
} from "@/types/engineer"

export const MAINTENANCE_LOG_KEYS = {
  all: (siteUid: string) => ["site", siteUid, "maintenance-logs"] as const,
  list: (siteUid: string, query: MaintenanceLogQuery) =>
    ["site", siteUid, "maintenance-logs", query] as const,
}

export const useMaintenanceLogs = (
  siteUid: string | null,
  query: MaintenanceLogQuery
) => {
  return useQuery({
    queryKey: MAINTENANCE_LOG_KEYS.list(siteUid ?? "", query),
    queryFn: () => getMaintenanceLogs(siteUid!, query),
    enabled: !!siteUid,
    // Keep the current page on screen while the next page / filter loads,
    // so the table doesn't flash back to skeletons on every click.
    placeholderData: keepPreviousData,
  })
}

export const useCreateMaintenanceLog = (siteUid: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateMaintenanceLogInput) =>
      createMaintenanceLog(siteUid, payload),
    onSuccess: (res) => {
      toast.success(res.message || "Maintenance logged.")
      queryClient.invalidateQueries({
        queryKey: MAINTENANCE_LOG_KEYS.all(siteUid),
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to log maintenance.")
    },
  })
}

export const useUpdateMaintenanceLog = (siteUid: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      logUid,
      payload,
    }: {
      logUid: string
      payload: UpdateMaintenanceLogInput
    }) => updateMaintenanceLog(siteUid, logUid, payload),
    onSuccess: (res) => {
      toast.success(res.message || "Maintenance log updated.")
      queryClient.invalidateQueries({
        queryKey: MAINTENANCE_LOG_KEYS.all(siteUid),
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update maintenance log.")
    },
  })
}

export const useDeleteMaintenanceLog = (siteUid: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (logUid: string) => deleteMaintenanceLog(siteUid, logUid),
    onSuccess: (res) => {
      toast.success(res.message || "Maintenance log deleted.")
      queryClient.invalidateQueries({
        queryKey: MAINTENANCE_LOG_KEYS.all(siteUid),
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete maintenance log.")
    },
  })
}
