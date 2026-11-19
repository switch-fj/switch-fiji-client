"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, CircleCheck } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui"
import {
  useAcknowledgeAlert,
  useAlertSummary,
  useAlerts,
} from "@/hooks/useAlerts"
import {
  deviceName,
  siteName,
  useSiteDirectory,
} from "@/hooks/useSiteDirectory"
import type { Alert, AlertQuery, AlertSeverity } from "@/types/alerts"
import { RULE_META, humanizeKey, ruleLabel, timeAgo } from "@/utils/alerts"
import { toLocalDateTime } from "@/utils/date"
import { AlertStatusBadge, SeverityBadge } from "./AlertBadges"
import { AlertDrawer } from "./AlertDrawer"

type StatusTab = "active" | "open" | "acknowledged" | "resolved" | "all"

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "open", label: "Open" },
  { key: "acknowledged", label: "Acknowledged" },
  { key: "resolved", label: "Resolved" },
  { key: "all", label: "All" },
]

const PAGE_SIZE = 20
const ALL = "__all"

/**
 * Paginated alert list with status tabs and filters. With `siteUid` it's
 * scoped to one site (no site filter or column); without it, it covers the
 * whole portfolio and `initialSiteUid` can preselect a site.
 */
export function AlertsTable({
  siteUid,
  initialSiteUid,
}: {
  siteUid?: string
  initialSiteUid?: string
}) {
  const directory = useSiteDirectory()
  const [tab, setTab] = useState<StatusTab>("active")
  const [severity, setSeverity] = useState<AlertSeverity | "">("")
  const [ruleKey, setRuleKey] = useState("")
  const [siteFilter, setSiteFilter] = useState(initialSiteUid ?? "")
  const [page, setPage] = useState(1)
  const [openAlert, setOpenAlert] = useState<Alert | null>(null)
  const ack = useAcknowledgeAlert()

  const scopeSite = siteUid ?? (siteFilter || undefined)
  const query: AlertQuery = {
    page,
    limit: PAGE_SIZE,
    site_uid: scopeSite,
    severity: severity || undefined,
    rule_key: ruleKey || undefined,
    ...(tab === "active"
      ? { active_only: true }
      : tab === "all"
        ? {}
        : { status: tab }),
  }
  const list = useAlerts(query)
  const summary = useAlertSummary({
    site_uid: scopeSite,
    rule_key: ruleKey || undefined,
  }).data?.data

  const counts: Record<StatusTab, number | undefined> = {
    active: summary?.active,
    open: summary?.open,
    acknowledged: summary?.acknowledged,
    resolved: summary?.resolved,
    all: summary ? summary.active + summary.resolved : undefined,
  }

  const items = list.data?.data.items ?? []
  const pagination = list.data?.data.pagination
  const totalPages = pagination?.total_pages ?? 1
  const filtersOn = !!(severity || ruleKey || (!siteUid && siteFilter))

  // Any filter change goes back to page 1.
  const reset =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v)
      setPage(1)
    }

  return (
    <div className="border-border/60 rounded-xl border bg-white">
      <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-b px-5 pt-4">
        <div className="flex gap-6 overflow-x-auto overflow-y-hidden">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => reset(setTab)(t.key)}
              className={`border-b-2 pb-3 text-sm whitespace-nowrap transition-colors ${
                tab === t.key
                  ? "border-[#024159] font-semibold text-[#1D1D1D]"
                  : "text-muted-foreground hover:text-foreground border-transparent font-medium"
              }`}
            >
              {t.label}
              {counts[t.key] !== undefined && (
                <span className="text-muted-foreground ml-1.5 font-normal">
                  {counts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
        {!siteUid && (
          <FilterSelect
            value={siteFilter}
            onChange={reset(setSiteFilter)}
            placeholder="All sites"
            options={directory.sites
              .map((s) => ({
                value: s.site.uid,
                label: `${siteName(s)} · ${s.client.client_name}`,
              }))
              .sort((a, b) => a.label.localeCompare(b.label))}
            className="w-64"
          />
        )}
        <FilterSelect
          value={severity}
          onChange={(v) => reset(setSeverity)(v as AlertSeverity | "")}
          placeholder="Any severity"
          options={[
            { value: "critical", label: "Critical" },
            { value: "warning", label: "Warning" },
          ]}
          className="w-40"
        />
        <FilterSelect
          value={ruleKey}
          onChange={reset(setRuleKey)}
          placeholder="Any rule"
          options={Object.entries(RULE_META).map(([value, m]) => ({
            value,
            label: m.label,
          }))}
          className="w-48"
        />
        {filtersOn && (
          <button
            onClick={() => {
              setSeverity("")
              setRuleKey("")
              if (!siteUid) setSiteFilter("")
              setPage(1)
            }}
            className="text-sm font-medium text-[#024159] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div
        className={`overflow-x-auto p-5 transition-opacity ${list.isFetching && !list.isLoading ? "opacity-70" : ""}`}
      >
        {list.isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-muted h-12 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : list.isError ? (
          <p className="px-3 py-10 text-center text-sm text-red-600">
            Couldn&apos;t load alerts. {list.error.message}
          </p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed px-6 py-10 text-center">
            {tab === "active" && !filtersOn ? (
              <>
                <CircleCheck className="h-5 w-5 text-green-600" />
                <p className="text-sm font-semibold text-[#1D1D1D]">
                  No active alerts
                </p>
                <p className="text-muted-foreground text-sm">
                  Everything being monitored
                  {siteUid ? " at this site" : ""} is healthy.
                </p>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                No alerts match these filters.
              </p>
            )}
          </div>
        ) : (
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-sky-100">
                <Th first>Severity</Th>
                <Th>Alert</Th>
                {!siteUid && <Th>Site</Th>}
                <Th>Device</Th>
                <Th>Status</Th>
                <Th>Detected</Th>
                <Th last>
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {items.map((a, i) => {
                const entry = directory.site(a.site_uid)
                const device =
                  deviceName(directory.device(a.device_uid)) ??
                  (a.component_key ? humanizeKey(a.component_key) : "—")
                const cell = "border-border/60 border-b px-3 py-3 align-middle"
                return (
                  <tr
                    key={a.uid}
                    onClick={() => setOpenAlert(a)}
                    className={`cursor-pointer transition-colors hover:bg-sky-100/60 ${i % 2 ? "bg-sky-50" : "bg-white"}`}
                  >
                    <td className={cell}>
                      <SeverityBadge severity={a.severity} />
                    </td>
                    <td className={`${cell} max-w-[360px]`}>
                      <span className="block font-semibold text-[#1D1D1D]">
                        {a.title}
                      </span>
                      <span className="text-muted-foreground line-clamp-1 text-xs">
                        {ruleLabel(a.rule_key)} · {a.explanation}
                      </span>
                    </td>
                    {!siteUid && (
                      <td className={cell}>
                        <span className="block text-[#1D1D1D]">
                          {siteName(entry)}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {entry?.client.client_name ?? "—"}
                        </span>
                      </td>
                    )}
                    <td className={`${cell} whitespace-nowrap text-[#1D1D1D]`}>
                      {device}
                    </td>
                    <td className={cell}>
                      <AlertStatusBadge status={a.status} />
                    </td>
                    <td
                      className={`${cell} text-muted-foreground whitespace-nowrap`}
                      title={`First detected ${toLocalDateTime(a.first_detected_at)}\nLast detected ${toLocalDateTime(a.last_detected_at)}`}
                    >
                      {timeAgo(a.first_detected_at)}
                    </td>
                    <td className={`${cell} text-right`}>
                      {a.status === "open" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            ack.mutate(a.uid)
                          }}
                          disabled={ack.isPending && ack.variables === a.uid}
                          className="border-border/60 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-[#024159] transition-colors hover:bg-[#024159]/5 disabled:opacity-50"
                        >
                          {ack.isPending && ack.variables === a.uid
                            ? "Acknowledging…"
                            : "Acknowledge"}
                        </button>
                      ) : (
                        <ChevronRight className="text-muted-foreground ml-auto h-4 w-4" />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Page {page} of {totalPages} · {pagination?.total} alerts
            </span>
            <div className="flex gap-2">
              <PageButton
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </PageButton>
              <PageButton
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next <ChevronRight className="h-4 w-4" />
              </PageButton>
            </div>
          </div>
        )}
      </div>

      <AlertDrawer
        alertUid={openAlert?.uid ?? null}
        initial={openAlert}
        onClose={() => setOpenAlert(null)}
        showSiteLink={!siteUid}
      />
    </div>
  )
}

function Th({
  children,
  first,
  last,
}: {
  children: React.ReactNode
  first?: boolean
  last?: boolean
}) {
  return (
    <th
      className={`px-3 py-2 text-left font-semibold whitespace-nowrap text-[#1D1D1D] ${first ? "rounded-l-md" : ""} ${last ? "rounded-r-md" : ""}`}
    >
      {children}
    </th>
  )
}

function PageButton({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="border-border/60 flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[#1D1D1D] hover:bg-neutral-50 disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <Select
      value={value || ALL}
      onValueChange={(v) => onChange(v === ALL ? "" : v)}
    >
      <SelectTrigger className={`border-border/60 h-9 ${className ?? ""}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
