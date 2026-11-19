"use client"

import { useState } from "react"
import { ArrowRight, CircleCheck } from "lucide-react"
import { useAlerts } from "@/hooks/useAlerts"
import type { Alert } from "@/types/alerts"
import { SEVERITY_META, timeAgo } from "@/utils/alerts"
import { AlertDrawer } from "@/app/(dashboard)/alerts/components/AlertDrawer"
import { AlertStatusBadge } from "@/app/(dashboard)/alerts/components/AlertBadges"

const SHOWN = 5

/** Overview-tab card: this site's active alerts, newest problems first. */
export function SiteAlertsCard({
  siteId,
  onViewAll,
}: {
  siteId: string
  onViewAll: () => void
}) {
  const { data, isLoading, isError } = useAlerts({
    site_uid: siteId,
    active_only: true,
    limit: SHOWN,
  })
  const [open, setOpen] = useState<Alert | null>(null)
  const items = data?.data.items ?? []
  const total = data?.data.pagination.total ?? 0

  return (
    <div className="border-border/60 flex h-full flex-col rounded-xl border bg-white">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-baseline gap-2">
          <h3 className="text-base font-semibold text-[#1D1D1D]">Alerts</h3>
          {total > 0 && (
            <span className="text-muted-foreground text-sm">
              {total} active
            </span>
          )}
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-sm font-medium text-[#024159] hover:underline"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 px-5 pb-5">
          {[0, 1].map((i) => (
            <div key={i} className="bg-muted h-10 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <p className="px-5 pb-5 text-sm text-red-600">
          Couldn&apos;t load alerts.
        </p>
      ) : items.length === 0 ? (
        <p className="flex items-center gap-2 px-5 pb-5 text-sm text-green-700">
          <CircleCheck className="h-4 w-4" />
          No active alerts at this site.
        </p>
      ) : (
        <ul className="divide-border/40 divide-y">
          {items.map((a) => (
            <li key={a.uid}>
              <button
                onClick={() => setOpen(a)}
                className="hover:bg-muted/30 flex w-full items-start gap-3 px-5 py-3 text-left transition-colors"
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${SEVERITY_META[a.severity].dot}`}
                  aria-label={SEVERITY_META[a.severity].label}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[#1D1D1D]">
                    {a.title}
                  </span>
                  <span className="text-muted-foreground line-clamp-1 text-xs">
                    {a.explanation}
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
              </button>
            </li>
          ))}
          {total > SHOWN && (
            <li>
              <button
                onClick={onViewAll}
                className="w-full px-5 py-2.5 text-sm font-medium text-[#024159] hover:bg-neutral-50"
              >
                {total - SHOWN} more
              </button>
            </li>
          )}
        </ul>
      )}

      <AlertDrawer
        alertUid={open?.uid ?? null}
        initial={open}
        onClose={() => setOpen(null)}
        showSiteLink={false}
      />
    </div>
  )
}
