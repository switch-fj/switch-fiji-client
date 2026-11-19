import api from "@/lib/axios"
import { ALERTS } from "@/constants/api"
import type {
  Alert,
  AlertConfiguration,
  AlertEvent,
  AlertQuery,
  AlertScope,
  AlertSummary,
  Monitor,
  MonitorExecution,
  MonitoringQuery,
  OffsetPage,
  RuleConfigPatch,
  RuleKey,
} from "@/types/alerts"
import type { ServerResponse } from "@workspace/api"

const get = async <T>(url: string, params?: object) =>
  (await api.get<ServerResponse<T>>(url, { params })).data

export const getAlerts = (query: AlertQuery) =>
  get<OffsetPage<Alert>>(ALERTS.LIST, query)

/** Every page of `query` (100 per request) — for the dashboard, which needs
 * all active alerts at once. Capped so a runaway count can't loop forever. */
export const getAllAlerts = async (query: AlertQuery, maxPages = 10) => {
  const first = await getAlerts({ ...query, page: 1, limit: 100 })
  const pages = Math.min(first.data.pagination.total_pages, maxPages)
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, i) =>
      getAlerts({ ...query, page: i + 2, limit: 100 })
    )
  )
  return [first, ...rest].flatMap((r) => r.data.items)
}

export const getAlertSummary = (scope: AlertScope) =>
  get<AlertSummary>(ALERTS.SUMMARY, scope)

export const getAlert = (alertUid: string) =>
  get<Alert>(ALERTS.DETAIL(alertUid))

export const getAlertEvents = (
  alertUid: string,
  query: { page?: number; limit?: number }
) => get<OffsetPage<AlertEvent>>(ALERTS.EVENTS(alertUid), query)

export const acknowledgeAlert = async (alertUid: string) =>
  (await api.post<ServerResponse<Alert>>(ALERTS.ACKNOWLEDGE(alertUid))).data

export const getMonitoringStatus = (siteUid: string, query: MonitoringQuery) =>
  get<OffsetPage<Monitor>>(ALERTS.MONITORING_STATUS(siteUid), query)

export const getMonitoringExecutions = (
  siteUid: string,
  query: MonitoringQuery & { status?: string }
) =>
  get<OffsetPage<MonitorExecution>>(
    ALERTS.MONITORING_EXECUTIONS(siteUid),
    query
  )

/** Global rules when `siteUid` is null, otherwise that site's overrides. */
export const getAlertConfiguration = (siteUid: string | null) =>
  get<AlertConfiguration>(
    siteUid ? ALERTS.SITE_CONFIG(siteUid) : ALERTS.GLOBAL_CONFIG
  )

export const updateRuleConfig = async (
  siteUid: string | null,
  ruleKey: RuleKey,
  patch: RuleConfigPatch
) =>
  (
    await api.patch<ServerResponse<AlertConfiguration>>(
      siteUid
        ? ALERTS.SITE_RULE(siteUid, ruleKey)
        : ALERTS.GLOBAL_RULE(ruleKey),
      patch
    )
  ).data

export const resetRuleConfig = async (
  siteUid: string | null,
  ruleKey: RuleKey
) =>
  (
    await api.delete<ServerResponse<AlertConfiguration>>(
      siteUid ? ALERTS.SITE_RULE(siteUid, ruleKey) : ALERTS.GLOBAL_RULE(ruleKey)
    )
  ).data
