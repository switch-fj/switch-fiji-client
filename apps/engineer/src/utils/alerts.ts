import type {
  AlertEventType,
  AlertSeverity,
  AlertStatus,
  ConfigSource,
  ExecutionStatus,
  MonitorOutcome,
} from "@/types/alerts"
import { toLocalDateTime } from "@/utils/date"

export const SEVERITY_META: Record<
  AlertSeverity,
  { label: string; badge: string; dot: string; rank: number }
> = {
  critical: {
    label: "Critical",
    badge: "bg-[#FA4F19]/15 text-[#B8380D]",
    dot: "bg-[#FA4F19]",
    rank: 0,
  },
  warning: {
    label: "Warning",
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
    rank: 1,
  },
}

export const STATUS_META: Record<
  AlertStatus,
  { label: string; badge: string }
> = {
  open: { label: "Open", badge: "bg-[#024159] text-white" },
  acknowledged: {
    label: "Acknowledged",
    badge: "bg-[#CCEFFC] text-[#024159]",
  },
  resolved: { label: "Resolved", badge: "bg-green-100 text-green-700" },
}

export const OUTCOME_META: Record<
  MonitorOutcome,
  { label: string; badge: string; dot: string }
> = {
  breach: {
    label: "Breach",
    badge: "bg-[#FA4F19]/15 text-[#B8380D]",
    dot: "bg-[#FA4F19]",
  },
  healthy: {
    label: "Healthy",
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
  unknown: {
    label: "Unknown",
    badge: "bg-neutral-100 text-neutral-600",
    dot: "bg-neutral-400",
  },
}

export const EXECUTION_LABEL: Record<ExecutionStatus, string> = {
  pending: "Pending",
  queued: "Queued",
  processing: "Running",
  waiting: "Scheduled",
  failed: "Failed",
  disabled: "Disabled",
  cancelled: "Cancelled",
}

export const EVENT_LABEL: Record<AlertEventType, string> = {
  opened: "Alert opened",
  severity_changed: "Severity changed",
  acknowledged: "Acknowledged",
  resolved: "Resolved",
}

export const SOURCE_LABEL: Record<ConfigSource, string> = {
  builtin: "Default",
  global: "All sites",
  site: "This site",
}

/** What each monitoring rule watches, in plain words. */
export const RULE_META: Record<string, { label: string; description: string }> =
  {
    "connectivity.site_telemetry": {
      label: "Site telemetry",
      description: "Alerts when a site's gateway stops sending data.",
    },
    "connectivity.inverter_reporting": {
      label: "Inverter reporting",
      description: "Alerts when an inverter stops reporting.",
    },
  }

/** "connectivity.site_telemetry" → "Site telemetry"; "last_seen_at" →
 * "Last seen at". Used for rule keys and evidence fields we don't know. */
export function humanizeKey(key: string): string {
  const last = key.split(".").pop() ?? key
  const text = last.replace(/[_-]+/g, " ").trim()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const ruleLabel = (ruleKey: string) =>
  RULE_META[ruleKey]?.label ?? humanizeKey(ruleKey)

const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/

/** Evidence values come straight from the backend: show timestamps as local
 * times, numbers with separators, anything nested as compact JSON. */
export function formatEvidenceValue(value: unknown): string {
  if (value === null || value === undefined) return "—"
  if (typeof value === "string")
    return ISO_DATETIME.test(value) ? toLocalDateTime(value) : value
  if (typeof value === "number") return value.toLocaleString()
  if (typeof value === "boolean") return value ? "Yes" : "No"
  return JSON.stringify(value)
}

/** "just now", "12 min ago", "3 h ago", "2 days ago". */
export function timeAgo(iso: string, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
  if (s < 60) return "just now"
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 48) return `${h} h ago`
  return `${Math.round(h / 24)} days ago`
}

/** "45 min", "2 h", "1 h 30 min". */
export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h} h ${m} min` : `${h} h`
}

/** "in 4 min", "in 2 h", or "overdue" for times already past. */
export function timeUntil(iso: string, now = Date.now()): string {
  const s = Math.round((new Date(iso).getTime() - now) / 1000)
  if (s <= 0) return "due now"
  const m = Math.round(s / 60)
  if (m < 60) return `in ${Math.max(1, m)} min`
  const h = Math.round(m / 60)
  if (h < 48) return `in ${h} h`
  return `in ${Math.round(h / 24)} days`
}
