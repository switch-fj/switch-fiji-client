"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  TriangleAlert,
} from "lucide-react"
import { compareAlerts } from "@/hooks/useSiteOverviews"
import { siteName, useSiteDirectory } from "@/hooks/useSiteDirectory"
import type { Alert } from "@/types/alerts"
import { SEVERITY_META, ruleLabel, timeAgo } from "@/utils/alerts"
import { AlertDrawer } from "../alerts/components/AlertDrawer"
import { AlertStatusBadge } from "../alerts/components/AlertBadges"

const COLLAPSED_COUNT = 5

/**
 * Active alerts across the portfolio, straight from the alerts API —
 * critical first, then most recent. Click one for details and to
 * acknowledge it without leaving the dashboard.
 */
export function AttentionPanel({
  alerts,
  isLoading,
  error,
}: {
  alerts: Alert[] | undefined
  isLoading: boolean
  error: Error | null
}) {
  const directory = useSiteDirectory()
  const [showAll, setShowAll] = useState(false)
  const [open, setOpen] = useState<Alert | null>(null)

  const rows = [...(alerts ?? [])].sort(compareAlerts)
  const visible = showAll ? rows : rows.slice(0, COLLAPSED_COUNT)
  const critical = rows.filter((a) => a.severity === "critical").length
  const unacknowledged = rows.filter((a) => a.status === "open").length

  return (
    <div className="border-border/60 rounded-xl border bg-white shadow-sm">
      <div className="border-border/60 flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-base font-semibold text-[#1D1D1D]">
            Needs attention
          </h2>
          {rows.length > 0 && (
            <span className="text-muted-foreground text-sm">
              {rows.length} active
              {critical > 0 && ` · ${critical} critical`}
              {unacknowledged > 0 && ` · ${unacknowledged} not acknowledged`}
            </span>
          )}
        </div>
        <Link
          href="/alerts"
          className="flex items-center gap-1 text-sm font-medium text-[#024159] hover:underline"
        >
          All alerts
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 p-5">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="bg-muted h-10 w-full animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : error && !alerts ? (
        <p className="px-5 py-4 text-sm text-red-600">
          Couldn&apos;t load alerts. {error.message}
        </p>
      ) : rows.length === 0 ? (
        <p className="flex items-center gap-2 px-5 py-4 text-sm text-green-700">
          <CircleCheck className="h-4 w-4" />
          No active alerts. Everything being monitored is healthy.
        </p>
      ) : (
        <>
          <ul className="divide-border/40 divide-y">
            {visible.map((a) => {
              const entry = directory.site(a.site_uid)
              const Icon =
                a.severity === "critical" ? CircleAlert : TriangleAlert
              return (
                <li key={a.uid}>
                  <button
                    onClick={() => setOpen(a)}
                    className="hover:bg-muted/30 flex w-full items-center gap-3 px-5 py-3 text-left transition-colors"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${SEVERITY_META[a.severity].badge}`}
                      title={SEVERITY_META[a.severity].label}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-[#1D1D1D]">
                        <span className="font-semibold">{siteName(entry)}</span>
                        {entry && (
                          <span className="text-muted-foreground">
                            {" "}
                            · {entry.client.client_name}
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-sm">
                        {a.title}
                        <span className="text-muted-foreground">
                          {" "}
                          — {ruleLabel(a.rule_key)}
                        </span>
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      {a.status === "acknowledged" && (
                        <AlertStatusBadge status={a.status} />
                      )}
                      <span className="text-muted-foreground text-xs">
                        {timeAgo(a.first_detected_at)}
                      </span>
                    </span>
                    <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
                  </button>
                </li>
              )
            })}
          </ul>
          {rows.length > COLLAPSED_COUNT && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="border-border/60 w-full border-t px-5 py-2.5 text-sm font-medium text-[#024159] hover:bg-neutral-50"
            >
              {showAll ? "Show fewer" : `Show all ${rows.length}`}
            </button>
          )}
        </>
      )}

      <AlertDrawer
        alertUid={open?.uid ?? null}
        initial={open}
        onClose={() => setOpen(null)}
      />
    </div>
  )
}
