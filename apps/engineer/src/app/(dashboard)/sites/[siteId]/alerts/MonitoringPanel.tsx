"use client"

import { useMemo } from "react"
import { CircleAlert } from "lucide-react"
import {
  useAlertSummary,
  useMonitoringExecutions,
  useMonitoringStatus,
} from "@/hooks/useAlerts"
import { useSiteDevices } from "@/hooks/useSitePanels"
import type { Monitor, MonitorExecution } from "@/types/alerts"
import {
  EXECUTION_LABEL,
  OUTCOME_META,
  SEVERITY_META,
  humanizeKey,
  ruleLabel,
  timeAgo,
  timeUntil,
} from "@/utils/alerts"
import { toLocalDateTime } from "@/utils/date"

const keyOf = (x: {
  rule_key: string
  device_uid: string | null
  component_key: string | null
}) => `${x.rule_key}|${x.device_uid ?? ""}|${x.component_key ?? ""}`

const OUTCOME_ORDER = { breach: 0, unknown: 1, healthy: 2 } as const

/**
 * What's being watched at this site: one row per monitored condition with
 * its latest result (monitoring-status) and when it runs next
 * (monitoring-executions), joined on rule + device + component.
 */
export function MonitoringPanel({ siteId }: { siteId: string }) {
  const status = useMonitoringStatus(siteId, { limit: 100 })
  const execs = useMonitoringExecutions(siteId, { limit: 100 })
  const summary = useAlertSummary({ site_uid: siteId }).data?.data
  const { data: devicesRes } = useSiteDevices(siteId)

  const deviceLabel = useMemo(() => {
    const map = new Map(
      (devicesRes?.data ?? []).map((d) => [
        d.uid,
        `${d.device_type.charAt(0).toUpperCase()}${d.device_type.slice(1)}${d.meter_role ? ` · ${d.meter_role}` : ""} (slave ${d.slave_id})`,
      ])
    )
    return (uid: string | null) => (uid ? (map.get(uid) ?? "Device") : null)
  }, [devicesRes])

  const rows = useMemo(() => {
    const monitors = status.data?.data.items ?? []
    const executions = execs.data?.data.items ?? []
    const byKey = new Map<
      string,
      { monitor?: Monitor; exec?: MonitorExecution }
    >()
    for (const m of monitors) byKey.set(keyOf(m), { monitor: m })
    for (const e of executions) {
      const k = keyOf(e)
      byKey.set(k, { ...byKey.get(k), exec: e })
    }
    return [...byKey.entries()].sort(([, a], [, b]) => {
      const oa = a.monitor ? OUTCOME_ORDER[a.monitor.outcome] : 1.5
      const ob = b.monitor ? OUTCOME_ORDER[b.monitor.outcome] : 1.5
      return oa - ob
    })
  }, [status.data, execs.data])

  const isLoading = status.isLoading || execs.isLoading

  return (
    <div className="border-border/60 rounded-xl border bg-white">
      <div className="border-border/60 flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-[#1D1D1D]">Monitoring</h3>
          <p className="text-muted-foreground text-sm">
            Conditions checked automatically at this site
            {summary?.latest_evaluated_at
              ? ` · last checked ${timeAgo(summary.latest_evaluated_at)}`
              : ""}
          </p>
        </div>
        {summary && summary.monitored_conditions > 0 && (
          <div className="flex flex-wrap gap-3 text-xs">
            <Count
              dot="bg-green-500"
              n={summary.healthy_conditions}
              label="healthy"
            />
            <Count
              dot="bg-[#FA4F19]"
              n={summary.breach_conditions}
              label="breached"
            />
            <Count
              dot="bg-neutral-400"
              n={summary.unknown_conditions}
              label="unknown"
            />
          </div>
        )}
      </div>

      <div className="overflow-x-auto p-5">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1].map((i) => (
              <div key={i} className="bg-muted h-12 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : status.isError && execs.isError ? (
          <p className="text-sm text-red-600">
            Couldn&apos;t load monitoring. {status.error.message}
          </p>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed px-6 py-8 text-center text-sm">
            Nothing is being monitored at this site yet.
          </p>
        ) : (
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-sky-100">
                {[
                  "Check",
                  "Result",
                  "Details",
                  "Last checked",
                  "Next check",
                ].map((h, i, arr) => (
                  <th
                    key={h}
                    className={`px-3 py-2 text-left font-semibold whitespace-nowrap text-[#1D1D1D] ${i === 0 ? "rounded-l-md" : ""} ${i === arr.length - 1 ? "rounded-r-md" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([k, { monitor: m, exec: e }], i) => {
                const source = m ?? e!
                const target =
                  deviceLabel(source.device_uid) ??
                  (source.component_key
                    ? humanizeKey(source.component_key)
                    : "Whole site")
                const cell = "border-border/60 border-b px-3 py-3 align-top"
                const outcome = m ? OUTCOME_META[m.outcome] : null
                const lastChecked = m?.evaluated_at ?? e?.last_evaluated_at
                return (
                  <tr key={k} className={i % 2 ? "bg-sky-50" : "bg-white"}>
                    <td className={cell}>
                      <span className="block font-semibold text-[#1D1D1D]">
                        {ruleLabel(source.rule_key)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {target}
                      </span>
                    </td>
                    <td className={`${cell} whitespace-nowrap`}>
                      {outcome ? (
                        <span className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${outcome.badge}`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${outcome.dot}`}
                            />
                            {outcome.label}
                          </span>
                          {m?.outcome === "breach" && m.severity && (
                            <span className="text-muted-foreground text-xs">
                              {SEVERITY_META[m.severity].label}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          Not checked yet
                        </span>
                      )}
                    </td>
                    <td className={`${cell} max-w-[360px]`}>
                      {m ? (
                        <>
                          <span className="block text-[#1D1D1D]">
                            {m.title}
                          </span>
                          <span className="text-muted-foreground line-clamp-2 text-xs">
                            {m.explanation}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td
                      className={`${cell} text-muted-foreground whitespace-nowrap`}
                      title={
                        lastChecked ? toLocalDateTime(lastChecked) : undefined
                      }
                    >
                      {lastChecked ? timeAgo(lastChecked) : "—"}
                    </td>
                    <td className={`${cell} whitespace-nowrap`}>
                      {e ? (
                        <Schedule exec={e} />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Schedule({ exec: e }: { exec: MonitorExecution }) {
  const problem =
    e.status === "failed" || e.is_overdue || e.evaluation_is_stale === true
  return (
    <span className="flex flex-col gap-0.5" title={e.last_error ?? undefined}>
      <span className="text-[#1D1D1D]">
        {!e.enabled || e.status === "disabled"
          ? "Disabled"
          : e.status === "processing"
            ? "Running now"
            : timeUntil(e.next_run_at)}
      </span>
      {problem && (
        <span className="flex items-center gap-1 text-xs text-[#B8380D]">
          <CircleAlert className="h-3 w-3" />
          {e.status === "failed"
            ? "Last run failed"
            : e.is_overdue
              ? "Overdue"
              : "Result is out of date"}
        </span>
      )}
      {!problem && e.status !== "waiting" && e.enabled && (
        <span className="text-muted-foreground text-xs">
          {EXECUTION_LABEL[e.status]}
        </span>
      )}
    </span>
  )
}

function Count({ dot, n, label }: { dot: string; n: number; label: string }) {
  return (
    <span className="text-muted-foreground flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="font-semibold text-[#1D1D1D]">{n}</span> {label}
    </span>
  )
}
