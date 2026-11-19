"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import {
  acknowledgeAlert,
  getAlert,
  getAlertConfiguration,
  getAlertEvents,
  getAlerts,
  getAlertSummary,
  getAllAlerts,
  getMonitoringExecutions,
  getMonitoringStatus,
  resetRuleConfig,
  updateRuleConfig,
} from "@/requests/alerts"
import type {
  AlertQuery,
  AlertScope,
  MonitoringQuery,
  RuleConfigPatch,
  RuleKey,
} from "@/types/alerts"

/** Everything alert-related lives under ["alerts"], so acknowledging or
 * changing a rule can refresh lists, counts and details in one go. */
export const ALERT_KEYS = {
  all: ["alerts"] as const,
  list: (q: AlertQuery) => ["alerts", "list", q] as const,
  active: ["alerts", "active"] as const,
  summary: (scope: AlertScope) => ["alerts", "summary", scope] as const,
  detail: (uid: string) => ["alerts", "detail", uid] as const,
  events: (uid: string, page: number) =>
    ["alerts", "events", uid, page] as const,
  monitoring: (siteUid: string, q: MonitoringQuery) =>
    ["alerts", "monitoring", siteUid, q] as const,
  executions: (siteUid: string, q: MonitoringQuery) =>
    ["alerts", "executions", siteUid, q] as const,
  config: (siteUid: string | null) =>
    ["alerts", "config", siteUid ?? "global"] as const,
}

/** Monitors run on a schedule; check back every minute while a view is open. */
const LIVE_MS = 60_000

export const useAlerts = (query: AlertQuery, enabled = true) =>
  useQuery({
    queryKey: ALERT_KEYS.list(query),
    queryFn: () => getAlerts(query),
    enabled,
    placeholderData: keepPreviousData,
    refetchInterval: LIVE_MS,
  })

/** All open + acknowledged alerts across the portfolio (dashboard). */
export const useActiveAlerts = () =>
  useQuery({
    queryKey: ALERT_KEYS.active,
    queryFn: () => getAllAlerts({ active_only: true }),
    refetchInterval: LIVE_MS,
  })

export const useAlertSummary = (scope: AlertScope = {}) =>
  useQuery({
    queryKey: ALERT_KEYS.summary(scope),
    queryFn: () => getAlertSummary(scope),
    refetchInterval: LIVE_MS,
  })

export const useAlert = (alertUid: string | null) =>
  useQuery({
    queryKey: ALERT_KEYS.detail(alertUid ?? ""),
    queryFn: () => getAlert(alertUid!),
    enabled: !!alertUid,
  })

export const useAlertEvents = (alertUid: string | null, page: number) =>
  useQuery({
    queryKey: ALERT_KEYS.events(alertUid ?? "", page),
    queryFn: () => getAlertEvents(alertUid!, { page, limit: 20 }),
    enabled: !!alertUid,
    placeholderData: keepPreviousData,
  })

export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (alertUid: string) => acknowledgeAlert(alertUid),
    onSuccess: (res) => {
      toast.success(res.message || "Alert acknowledged.")
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.all })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Couldn't acknowledge the alert.")
    },
  })
}

export const useMonitoringStatus = (siteUid: string, q: MonitoringQuery) =>
  useQuery({
    queryKey: ALERT_KEYS.monitoring(siteUid, q),
    queryFn: () => getMonitoringStatus(siteUid, q),
    placeholderData: keepPreviousData,
    refetchInterval: LIVE_MS,
  })

export const useMonitoringExecutions = (siteUid: string, q: MonitoringQuery) =>
  useQuery({
    queryKey: ALERT_KEYS.executions(siteUid, q),
    queryFn: () => getMonitoringExecutions(siteUid, q),
    placeholderData: keepPreviousData,
    refetchInterval: LIVE_MS,
  })

/** Global rules (siteUid null) or one site's overrides. */
export const useAlertConfiguration = (siteUid: string | null) =>
  useQuery({
    queryKey: ALERT_KEYS.config(siteUid),
    queryFn: () => getAlertConfiguration(siteUid),
  })

export const useUpdateRuleConfig = (siteUid: string | null) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      ruleKey,
      patch,
    }: {
      ruleKey: RuleKey
      patch: RuleConfigPatch
    }) => updateRuleConfig(siteUid, ruleKey, patch),
    onSuccess: (res) => {
      toast.success(res.message || "Alert rule updated.")
      queryClient.setQueryData(ALERT_KEYS.config(siteUid), res)
      // A global change shows through to every site that doesn't override it.
      queryClient.invalidateQueries({ queryKey: ["alerts", "config"] })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Couldn't update the rule.")
    },
  })
}

export const useResetRuleConfig = (siteUid: string | null) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ruleKey: RuleKey) => resetRuleConfig(siteUid, ruleKey),
    onSuccess: (res) => {
      toast.success(res.message || "Rule reset.")
      queryClient.setQueryData(ALERT_KEYS.config(siteUid), res)
      queryClient.invalidateQueries({ queryKey: ["alerts", "config"] })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Couldn't reset the rule.")
    },
  })
}
