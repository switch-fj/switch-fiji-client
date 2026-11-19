"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useAlertSummary } from "@/hooks/useAlerts"
import { SEVERITY_META, timeAgo } from "@/utils/alerts"
import { toLocalDateTime } from "@/utils/date"
import { AlertsTable } from "./components/AlertsTable"
import { RuleSettings } from "./components/RuleSettings"

const TABS = [
  { key: "alerts", label: "Alerts" },
  { key: "rules", label: "Rules" },
] as const
type Tab = (typeof TABS)[number]["key"]

export default function AlertsView() {
  const router = useRouter()
  const params = useSearchParams()
  const tab: Tab = params.get("tab") === "rules" ? "rules" : "alerts"
  const initialSite = params.get("site") ?? undefined
  const { data, isLoading } = useAlertSummary()
  const s = data?.data

  const setTab = (next: Tab) => {
    const q = new URLSearchParams(params.toString())
    if (next === "alerts") q.delete("tab")
    else q.set("tab", next)
    const qs = q.toString()
    router.replace(qs ? `/alerts?${qs}` : "/alerts", { scroll: false })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-bold text-[#1D1D1D]">Alerts</h1>
        <p className="text-muted-foreground text-sm">
          Raised automatically when a monitored condition breaks, and resolved
          when it clears.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Tile
          label="Active alerts"
          value={s?.active}
          isLoading={isLoading}
          sub={
            s?.highest_active_severity ? (
              <span className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${SEVERITY_META[s.highest_active_severity].dot}`}
                />
                Highest: {SEVERITY_META[s.highest_active_severity].label}
              </span>
            ) : s ? (
              "Nothing needs attention"
            ) : undefined
          }
        />
        <Tile
          label="Open"
          value={s?.open}
          isLoading={isLoading}
          sub="Not yet acknowledged"
        />
        <Tile
          label="Acknowledged"
          value={s?.acknowledged}
          isLoading={isLoading}
          sub="Seen, waiting to clear"
        />
        <Tile
          label="Monitored conditions"
          value={s?.monitored_conditions}
          isLoading={isLoading}
          sub={
            s
              ? `${s.healthy_conditions} healthy · ${s.breach_conditions} breached · ${s.unknown_conditions} unknown`
              : undefined
          }
          title={
            s?.latest_evaluated_at
              ? `Last checked ${toLocalDateTime(s.latest_evaluated_at)}`
              : undefined
          }
          footnote={
            s?.latest_evaluated_at
              ? `Last checked ${timeAgo(s.latest_evaluated_at)}`
              : undefined
          }
        />
      </div>

      <nav className="border-border/60 flex gap-6 border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            aria-current={tab === t.key ? "page" : undefined}
            className={`-mb-px border-b-2 py-2.5 text-sm transition-colors ${
              tab === t.key
                ? "border-[#024159] font-semibold text-[#1D1D1D]"
                : "text-muted-foreground hover:text-foreground border-transparent font-medium"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "alerts" ? (
        <AlertsTable key={initialSite} initialSiteUid={initialSite} />
      ) : (
        <RuleSettings />
      )}
    </div>
  )
}

function Tile({
  label,
  value,
  sub,
  footnote,
  title,
  isLoading,
}: {
  label: string
  value?: number
  sub?: React.ReactNode
  footnote?: string
  title?: string
  isLoading: boolean
}) {
  return (
    <div
      className="border-border/60 flex min-w-[200px] flex-1 flex-col gap-2 rounded-xl border bg-white px-5 py-4 shadow-sm"
      title={title}
    >
      <span className="text-sm text-[#1D1D1D]">{label}</span>
      {isLoading ? (
        <>
          <div className="bg-muted h-9 w-16 animate-pulse rounded" />
          <div className="bg-muted h-3 w-32 animate-pulse rounded" />
        </>
      ) : (
        <>
          <span className="text-3xl font-semibold text-[#1D1D1D]">
            {value ?? "—"}
          </span>
          {sub && <span className="text-muted-foreground text-xs">{sub}</span>}
          {footnote && (
            <span className="text-muted-foreground text-xs">{footnote}</span>
          )}
        </>
      )}
    </div>
  )
}
