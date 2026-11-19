export type AlertStatus = "open" | "acknowledged" | "resolved"
export type AlertSeverity = "warning" | "critical"
export type MonitorOutcome = "breach" | "healthy" | "unknown"
export type ExecutionStatus =
  | "pending"
  | "queued"
  | "processing"
  | "waiting"
  | "failed"
  | "disabled"
  | "cancelled"
export type AlertEventType =
  | "opened"
  | "severity_changed"
  | "acknowledged"
  | "resolved"

export type RuleKey =
  | "connectivity.site_telemetry"
  | "connectivity.inverter_reporting"

export type ConfigSource = "builtin" | "global" | "site"

export type OffsetPage<T> = {
  items: T[]
  pagination: {
    total: number
    current_page: number
    limit: number
    total_pages: number
  }
}

export type Alert = {
  uid: string
  created_at: string
  updated_at: string
  monitor_uid: string
  site_uid: string
  device_uid: string | null
  component_key: string | null
  rule_key: string
  rule_version: number
  status: AlertStatus
  severity: AlertSeverity
  title: string
  explanation: string
  evidence: Record<string, unknown>
  first_detected_at: string
  last_detected_at: string
  acknowledged_at: string | null
  acknowledged_by_uid: string | null
  resolved_at: string | null
  resolution_explanation: string | null
}

export type AlertQuery = {
  site_uid?: string
  device_uid?: string
  rule_key?: string
  component_key?: string
  page?: number
  limit?: number
  status?: AlertStatus
  severity?: AlertSeverity
  /** open + acknowledged */
  active_only?: boolean
  from_at?: string
  to_at?: string
}

export type AlertScope = Pick<
  AlertQuery,
  "site_uid" | "device_uid" | "rule_key" | "component_key"
>

export type AlertSummary = {
  active: number
  open: number
  acknowledged: number
  resolved: number
  highest_active_severity: AlertSeverity | null
  monitored_conditions: number
  breach_conditions: number
  healthy_conditions: number
  unknown_conditions: number
  latest_evaluated_at: string | null
  oldest_evaluated_at: string | null
}

export type AlertEvent = {
  uid: string
  alert_uid: string
  event_type: AlertEventType
  created_at: string
  evaluated_at: string | null
  actor_uid: string | null
  details: Record<string, unknown>
}

/** Latest result of one monitored condition. */
export type Monitor = {
  uid: string
  created_at: string
  updated_at: string
  site_uid: string
  device_uid: string | null
  component_key: string | null
  rule_key: string
  rule_version: number
  evaluated_at: string
  observed_at: string | null
  period_start: string | null
  period_end: string | null
  outcome: MonitorOutcome
  severity: AlertSeverity | null
  title: string
  explanation: string
  evidence: Record<string, unknown>
}

/** Scheduling state of one monitored condition. */
export type MonitorExecution = {
  uid: string
  created_at: string
  updated_at: string
  site_uid: string
  device_uid: string | null
  component_key: string | null
  rule_key: string
  rule_version: number
  enabled: boolean
  policy_mode: string
  status: ExecutionStatus
  interval_seconds: number
  stale_after_seconds: number
  next_run_at: string
  evaluated_at: string | null
  attempts: number
  lease_until: string | null
  last_started_at: string | null
  last_completed_at: string | null
  last_evaluated_at: string | null
  last_outcome: MonitorOutcome | null
  last_error: string | null
  lease_expired: boolean
  is_overdue: boolean
  evaluation_is_stale: boolean | null
}

export type MonitoringQuery = {
  page?: number
  limit?: number
  rule_key?: string
  device_uid?: string
  component_key?: string
}

/** Omitted fields are unchanged; explicit null clears that override. */
export type RuleConfigPatch = {
  enabled?: boolean | null
  silence_minutes?: number | null
}

export type RuleConfig = {
  rule_key: RuleKey
  saved: RuleConfigPatch
  effective: {
    rule_key: RuleKey
    enabled: boolean
    silence_minutes: number
    enabled_source: ConfigSource
    silence_minutes_source: ConfigSource
  }
}

export type AlertConfiguration = {
  site_uid: string | null
  rules: RuleConfig[]
}
