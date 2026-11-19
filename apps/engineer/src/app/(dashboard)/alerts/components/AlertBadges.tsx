import type { AlertSeverity, AlertStatus } from "@/types/alerts"
import { SEVERITY_META, STATUS_META } from "@/utils/alerts"

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const m = SEVERITY_META[severity]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${m.badge}`}
    >
      <span className={`h-2 w-2 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  )
}

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  const m = STATUS_META[status]
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${m.badge}`}
    >
      {m.label}
    </span>
  )
}
