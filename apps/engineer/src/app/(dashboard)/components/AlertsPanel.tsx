import { AlertCircle } from "lucide-react"

type Alert = {
  type: string
  description: string
}

const MOCK_ALERTS: Alert[] = [
  {
    type: "Device warning",
    description: "Pacific Cold Storage - Backup Meter is currently offline",
  },
  {
    type: "MPPT Health",
    description: "Pacific Cold Storage - 1.1 and 2.2 below functional",
  },
  {
    type: "Grid",
    description: "Pacific Cold Storage - energy low",
  },
]

export function AlertsPanel() {
  return (
    <div className="border-border/60 rounded-xl border bg-white shadow-sm">
      <div className="px-5 py-4">
        <span className="text-base font-semibold">Alerts</span>
      </div>
      <div className="divide-border/40 divide-y">
        {MOCK_ALERTS.map((alert, i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-3.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="text-sm">
              <span className="font-semibold">{alert.type}</span>{" "}
              <span className="text-muted-foreground">{alert.description}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
