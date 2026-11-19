"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, CircleCheck, X } from "lucide-react"
import {
  useAcknowledgeAlert,
  useAlert,
  useAlertEvents,
} from "@/hooks/useAlerts"
import {
  deviceName,
  siteName,
  useSiteDirectory,
} from "@/hooks/useSiteDirectory"
import type { Alert } from "@/types/alerts"
import {
  EVENT_LABEL,
  formatEvidenceValue,
  humanizeKey,
  ruleLabel,
  timeAgo,
} from "@/utils/alerts"
import { toLocalDateTime } from "@/utils/date"
import { AlertStatusBadge, SeverityBadge } from "./AlertBadges"

/**
 * Slide-over with everything about one alert: what's wrong, the evidence
 * the monitor saw, its event history, and an Acknowledge action.
 * Pass the row's alert as `initial` so it renders instantly; the detail
 * request then keeps it fresh.
 */
export function AlertDrawer({
  alertUid,
  initial,
  onClose,
  showSiteLink = true,
}: {
  alertUid: string | null
  initial?: Alert | null
  onClose: () => void
  showSiteLink?: boolean
}) {
  useEffect(() => {
    if (!alertUid) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [alertUid, onClose])

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${alertUid ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Alert details"
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-[560px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${alertUid ? "translate-x-0" : "translate-x-full"}`}
      >
        {alertUid && (
          <Body
            key={alertUid}
            alertUid={alertUid}
            initial={initial?.uid === alertUid ? initial : null}
            onClose={onClose}
            showSiteLink={showSiteLink}
          />
        )}
      </div>
    </>
  )
}

function Body({
  alertUid,
  initial,
  onClose,
  showSiteLink,
}: {
  alertUid: string
  initial: Alert | null
  onClose: () => void
  showSiteLink: boolean
}) {
  const { data, isLoading, isError, error } = useAlert(alertUid)
  const alert = data?.data ?? initial
  const directory = useSiteDirectory()
  const ack = useAcknowledgeAlert()
  const [eventsPage, setEventsPage] = useState(1)
  const events = useAlertEvents(alertUid, eventsPage)

  if (!alert) {
    return (
      <div className="flex h-full flex-col">
        <Header onClose={onClose} />
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <div className="bg-muted h-6 w-2/3 animate-pulse rounded" />
              <div className="bg-muted h-20 w-full animate-pulse rounded-lg" />
            </div>
          ) : (
            <p className="text-sm text-red-600">
              Couldn&apos;t load this alert.{isError ? ` ${error.message}` : ""}
            </p>
          )}
        </div>
      </div>
    )
  }

  const entry = directory.site(alert.site_uid)
  const device = deviceName(directory.device(alert.device_uid))
  const evidence = Object.entries(alert.evidence ?? {})
  const eventItems = events.data?.data.items ?? []
  const eventPages = events.data?.data.pagination.total_pages ?? 1

  return (
    <div className="flex h-full flex-col">
      <Header onClose={onClose}>
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={alert.severity} />
          <AlertStatusBadge status={alert.status} />
          <span className="text-muted-foreground text-xs">
            {ruleLabel(alert.rule_key)}
          </span>
        </div>
      </Header>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-semibold text-[#1D1D1D]">
            {alert.title}
          </h2>
          <p className="text-muted-foreground text-sm">
            {siteName(entry)}
            {entry ? ` · ${entry.client.client_name}` : ""}
            {device ? ` · ${device}` : ""}
            {alert.component_key
              ? ` · ${humanizeKey(alert.component_key)}`
              : ""}
          </p>
          <p className="mt-1 text-sm text-[#1D1D1D]">{alert.explanation}</p>
        </div>

        {alert.status === "resolved" && alert.resolution_explanation && (
          <div className="flex items-start gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-800">
            <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{alert.resolution_explanation}</span>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Fact label="First detected" iso={alert.first_detected_at} />
          <Fact label="Last detected" iso={alert.last_detected_at} />
          <Fact label="Acknowledged" iso={alert.acknowledged_at} />
          <Fact label="Resolved" iso={alert.resolved_at} />
        </dl>

        {evidence.length > 0 && (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-[#1D1D1D]">
              What the monitor saw
            </h3>
            <dl className="border-border/60 divide-border/40 divide-y rounded-lg border text-sm">
              {evidence.map(([k, v]) => (
                <div key={k} className="flex gap-4 px-3 py-2">
                  <dt className="text-muted-foreground w-40 shrink-0">
                    {humanizeKey(k)}
                  </dt>
                  <dd className="min-w-0 break-words text-[#1D1D1D]">
                    {formatEvidenceValue(v)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section>
          <h3 className="mb-3 text-sm font-semibold text-[#1D1D1D]">History</h3>
          {events.isLoading ? (
            <div className="bg-muted h-16 w-full animate-pulse rounded-lg" />
          ) : eventItems.length === 0 ? (
            <p className="text-muted-foreground text-sm">No events yet.</p>
          ) : (
            <ol className="border-border/60 ml-1.5 flex flex-col gap-4 border-l pl-5">
              {eventItems.map((ev) => {
                const details = Object.entries(ev.details ?? {})
                return (
                  <li key={ev.uid} className="relative">
                    <span className="absolute top-1.5 -left-[25px] h-2 w-2 rounded-full bg-[#024159] ring-4 ring-white" />
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-semibold text-[#1D1D1D]">
                        {EVENT_LABEL[ev.event_type] ??
                          humanizeKey(ev.event_type)}
                      </span>
                      <span
                        className="text-muted-foreground text-xs"
                        title={toLocalDateTime(ev.created_at)}
                      >
                        {toLocalDateTime(ev.created_at)}
                      </span>
                    </div>
                    {details.length > 0 && (
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {details
                          .map(
                            ([k, v]) =>
                              `${humanizeKey(k)}: ${formatEvidenceValue(v)}`
                          )
                          .join(" · ")}
                      </p>
                    )}
                  </li>
                )
              })}
            </ol>
          )}
          {eventPages > 1 && (
            <div className="mt-3 flex items-center gap-3 text-sm">
              <button
                disabled={eventsPage <= 1}
                onClick={() => setEventsPage((p) => p - 1)}
                className="font-medium text-[#024159] disabled:opacity-40"
              >
                Newer
              </button>
              <span className="text-muted-foreground">
                Page {eventsPage} of {eventPages}
              </span>
              <button
                disabled={eventsPage >= eventPages}
                onClick={() => setEventsPage((p) => p + 1)}
                className="font-medium text-[#024159] disabled:opacity-40"
              >
                Older
              </button>
            </div>
          )}
        </section>
      </div>

      <div className="border-border/60 flex items-center justify-between gap-3 border-t px-6 py-4">
        {showSiteLink && entry ? (
          <Link
            href={`/sites/${alert.site_uid}?name=${encodeURIComponent(siteName(entry))}&tab=alerts`}
            className="flex items-center gap-1 text-sm font-medium text-[#024159] hover:underline"
          >
            Open site
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span />
        )}
        {alert.status === "open" ? (
          <button
            onClick={() => ack.mutate(alert.uid)}
            disabled={ack.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-[#024159] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <CircleCheck className="h-4 w-4" />
            {ack.isPending ? "Acknowledging…" : "Acknowledge"}
          </button>
        ) : alert.status === "acknowledged" && alert.acknowledged_at ? (
          <span className="text-muted-foreground text-sm">
            Acknowledged {timeAgo(alert.acknowledged_at)} · stays open until the
            condition clears
          </span>
        ) : null}
      </div>
    </div>
  )
}

function Header({
  onClose,
  children,
}: {
  onClose: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="border-border/60 flex items-center justify-between gap-4 border-b px-6 py-4">
      <div>{children}</div>
      <button
        onClick={onClose}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
      >
        <X className="h-4 w-4" />
        Close
      </button>
    </div>
  )
}

function Fact({ label, iso }: { label: string; iso: string | null }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-[#1D1D1D]">
        {iso ? (
          <span title={toLocalDateTime(iso)}>
            {toLocalDateTime(iso)}{" "}
            <span className="text-muted-foreground">· {timeAgo(iso)}</span>
          </span>
        ) : (
          "—"
        )}
      </dd>
    </div>
  )
}
