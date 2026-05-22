"use client"

import { Suspense, useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import {
  ChevronLeft,
  Download,
  Loader2,
  MousePointerClick,
  Plus,
  Edit,
} from "lucide-react"
import { format } from "date-fns"
import { Button, DatePickerInput, Skeleton } from "@workspace/ui"
import { useGetContract } from "@/hooks/useContract"
import { useClients } from "@/hooks/useClient"
import { useSites } from "@/hooks/useSite"
import {
  useGetInvoice,
  useGetInvoiceHistory,
  useGetLiveInvoice,
  useDownloadInvoicePdf,
  useComputeInvoice,
} from "@/hooks/useInvoice"
import { useInvoiceFormatters } from "@/hooks/useInvoiceFormatters"
import { useStore } from "@/store"
import { uniqueByInvoiceUid } from "@/utils/invoice"
import { EnumContractType, EnumContractSystemMode } from "@/constants/mangle"
import { getCombo, VIS, DAY_LABEL } from "@/constants/contract"
import type { ContractDetailsRespModel, TariffRespModel } from "@/types/site"
import InvoiceLineItemsTable from "@/app/(dashboard)/components/InvoiceLineItemsTable"
import InvoiceMeterDataTable from "@/app/(dashboard)/components/InvoiceMeterDataTable"
import ContractSummaryBar from "@/app/(dashboard)/components/ContractSummaryBar"
import ContractDetailsSheet from "@/app/(dashboard)/components/ContractDetailsSheet"
import CreateContractSheet from "@/app/(dashboard)/components/CreateContractSheet"

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val: string | null | undefined) {
  if (!val) return "—"
  try {
    return format(new Date(val), "d MMM yyyy")
  } catch {
    return val
  }
}

function FieldRow({
  label,
  value,
  muted,
}: {
  label: string
  value: React.ReactNode
  muted?: boolean
}) {
  return (
    <div className="grid grid-cols-[200px_1fr] py-2">
      <span className="text-text-1 text-sm font-semibold">{label}</span>
      <span
        className={
          muted ? "text-text-1/50 text-xs font-medium" : "text-text-1 text-sm"
        }
      >
        {value ?? "—"}
      </span>
    </div>
  )
}

function TariffRow({
  t,
  showDuration,
}: {
  t: TariffRespModel
  showDuration: boolean
}) {
  const slotLabel: Record<string, string> = {
    A: "Solar Hours",
    B: "Non-Solar Hours",
    Solar: "Solar Hours",
    Utility: "Utility Hours",
  }
  const cols = showDuration
    ? "grid-cols-[1fr_80px_90px_90px_80px]"
    : "grid-cols-[1fr_80px_90px_90px]"
  return (
    <div className={`grid ${cols} items-center bg-white px-4 py-2 text-xs`}>
      <span className="text-text-1 font-medium">
        {slotLabel[t.slot] ?? t.slot} (
        {t.slot_type === "Variable" ? "Indexed" : t.slot_type || "—"})
      </span>
      <span
        className={
          t.rate < 0 ? "font-medium text-red-500" : "text-primary font-medium"
        }
      >
        {t.rate}
      </span>
      <span className="text-text-1">{t.start_time ?? "—"}</span>
      <span className="text-text-1">{t.end_time ?? "—"}</span>
      {showDuration && (
        <span className="text-text-1">{t.duration_years ?? "—"}</span>
      )}
    </div>
  )
}

// ── Contract section ──────────────────────────────────────────────────────────

function ContractSection({
  contractUid,
  clientName,
  clientEmail,
  siteName,
  onEdit,
  onCreateDetails,
}: {
  contractUid: string
  clientName: string
  clientEmail: string
  siteName: string
  onEdit: () => void
  onCreateDetails: () => void
}) {
  const { data: contract, isLoading, isError } = useGetContract(contractUid)
  const d: ContractDetailsRespModel | null = contract?.details ?? null
  const combo = contract
    ? getCombo(contract.contract_type, contract.system_mode)
    : null
  const show = (field: keyof typeof VIS) => (combo ? VIS[field][combo] : false)

  const contractTypeLabel =
    contract?.contract_type === EnumContractType.PPA ? "PPA" : "Lease"
  const systemModeLabel =
    contract?.system_mode === EnumContractSystemMode.OFF_GRID
      ? "Off Grid"
      : "On Grid"

  if (isLoading) {
    return (
      <div className="space-y-2 p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-full rounded" />
        ))}
      </div>
    )
  }

  if (isError || !contract) {
    return (
      <p className="text-destructive px-6 py-4 text-sm">
        Failed to load contract.
      </p>
    )
  }

  return (
    <div>
      <ContractSummaryBar
        clientName={clientName}
        siteName={siteName}
        contractRef={contract.contract_ref}
        contractTypeLabel={contractTypeLabel}
        systemModeLabel={systemModeLabel}
        currency={contract.currency}
        clientEmail={clientEmail}
      />

      {!d ? (
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <p className="text-muted-foreground text-sm">
            No details submitted for this contract yet.
          </p>
          <Button
            variant="primary"
            size="md"
            className="rounded-sm"
            onClick={onCreateDetails}
          >
            Add Contract Details
          </Button>
        </div>
      ) : (
        <div className="space-y-6 px-6 py-4">
          <div className="grid grid-cols-3 gap-x-8 border-b pb-4">
            <div>
              {show("term_years") && (
                <FieldRow
                  label="Term Years"
                  value={d.term_years ? `${d.term_years} years` : "—"}
                />
              )}
              {show("tariff_periods") && (
                <FieldRow
                  label="Tariff Periods"
                  value={d.tariff_periods ?? "—"}
                />
              )}
              {show("tariff_indexed_rule_type") && (
                <FieldRow
                  label="Tariff Rule Type"
                  value={
                    d.tariff_indexed_rule_type === "EFL_LINKED"
                      ? "EFL Linked"
                      : d.tariff_indexed_rule_type === "FIXED_ANNUAL_ESCALATOR"
                        ? "Fixed Annual Escalator"
                        : (d.tariff_indexed_rule_type ?? "—")
                  }
                />
              )}
              {show("implementation_period") && (
                <FieldRow
                  label="Implementation Period"
                  value={d.implementation_period ?? "—"}
                />
              )}
              {show("system_size_kwp") && (
                <FieldRow
                  label="System Size (kWp)"
                  value={d.system_size_kwp ?? "—"}
                />
              )}
            </div>
            <div>
              {show("signing_date") && (
                <FieldRow
                  label="Contract Signing Date"
                  value={fmt(d.signed_at)}
                />
              )}
              {show("commissioning_date") && (
                <FieldRow
                  label="Commissioning Date"
                  value={fmt(d.commissioned_at)}
                />
              )}
              {show("contract_end") && (
                <FieldRow label="Contract End" value={fmt(d.end_at)} />
              )}
              {show("actual_commissioned_at") && (
                <FieldRow
                  label="Actual Commissioned"
                  value={
                    d.actual_commissioned_at
                      ? fmt(d.actual_commissioned_at)
                      : "—"
                  }
                  muted={!d.actual_commissioned_at}
                />
              )}
              {show("actual_end_at") && (
                <FieldRow
                  label="Actual End Date"
                  value={d.actual_end_at ? fmt(d.actual_end_at) : "—"}
                  muted={!d.actual_end_at}
                />
              )}
            </div>
            <div>
              {show("billing_frequency") && (
                <FieldRow
                  label="Billing Frequency"
                  value={d.billing_frequency ?? "—"}
                />
              )}
              {show("billing_frequency") &&
                d.billing_frequency === "weekly" &&
                d.weekly_billing_start_day != null && (
                  <FieldRow
                    label="Weekly Billing Day"
                    value={DAY_LABEL[d.weekly_billing_start_day] ?? "—"}
                  />
                )}
              {show("grid_meter_reading_kwh") && (
                <FieldRow
                  label="Grid Meter (kWh)"
                  value={d.grid_meter_reading_at_commissioning_kwh ?? "—"}
                />
              )}
              {show("grid_meter_reading_kvar") && (
                <FieldRow
                  label="Grid Meter (kVAR)"
                  value={d.grid_meter_reading_at_commissioning_kvar ?? "—"}
                />
              )}
              {show("with_battery") && (
                <FieldRow label="Battery" value={d.with_battery ?? "—"} />
              )}
              {show("guaranteed_production") && (
                <FieldRow
                  label="Guaranteed Production (kWh/kWp)"
                  value={d.guaranteed_production_kwh_per_kwp ?? "—"}
                />
              )}
              {show("equipment_lease") && (
                <FieldRow
                  label="Equipment Lease Amount"
                  value={d.equipment_lease_amount ?? "—"}
                />
              )}
              {show("maintenance") && (
                <FieldRow
                  label="Maintenance Amount"
                  value={d.maintenance_amount ?? "—"}
                />
              )}
              {show("total") && (
                <FieldRow label="Total" value={d.total ?? "—"} />
              )}
            </div>
          </div>

          {show("tariffs_table") &&
            (() => {
              const isOnGridNoBattery =
                combo === "ppa_on_grid" && d.with_battery === "no"
              const raw = isOnGridNoBattery
                ? d.ppa_on_grid_no_battery_tariffs
                : d.tariff_slots
              let slots: TariffRespModel[] = []
              try {
                slots = raw ? JSON.parse(raw) : []
              } catch {
                slots = []
              }
              if (slots.length === 0) return null

              const showDuration = (d.tariff_periods ?? 1) > 1
              const COLS = "grid-cols-[1fr_80px_90px_90px]"

              // Group by period_number
              const periodGroups = Array.from(
                slots.reduce((map, t) => {
                  const p = String(t.period_number)
                  if (!map.has(p)) map.set(p, [])
                  map.get(p)!.push(t)
                  return map
                }, new Map<string, TariffRespModel[]>())
              )

              return (
                <div>
                  <p className="text-text-1 mb-2 text-sm font-semibold">
                    Tariffs
                  </p>
                  <div className="overflow-hidden rounded-md border">
                    <div
                      className={`text-text-1 grid ${COLS} bg-neutral-100 px-4 py-2 text-xs font-semibold`}
                    >
                      <span>Slot</span>
                      <span>Rate</span>
                      <span>Start Time</span>
                      <span>End Time</span>
                    </div>
                    {periodGroups.map(([periodNum, group]) => (
                      <div key={periodNum}>
                        {showDuration && (
                          <div className="flex items-center justify-between border-t bg-neutral-50 px-4 py-1.5">
                            <span className="text-text-1 text-xs font-semibold">
                              Period {periodNum}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              Duration:{" "}
                              <span className="text-text-1 font-medium">
                                {group[0].duration_years != null
                                  ? `${group[0].duration_years} yr${group[0].duration_years !== 1 ? "s" : ""}`
                                  : "—"}
                              </span>
                            </span>
                          </div>
                        )}
                        {group.map((t, i) => (
                          <TariffRow key={i} t={t} showDuration={false} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
        </div>
      )}
    </div>
  )
}

// ── Invoice section ───────────────────────────────────────────────────────────

function InvoiceSection({
  contractUid,
  clientName,
  siteName,
  billingEmail,
  contractCombo,
}: {
  contractUid: string | null
  clientName: string
  siteName: string
  billingEmail: string
  contractCombo: ReturnType<typeof getCombo>
}) {
  // "live" = show live snapshots panel; any other string = selected historical invoice uid
  const [viewMode, setViewMode] = useState<"live" | string>("live")
  const isLive = viewMode === "live"

  // For live mode: which snapshot uid is selected (null = latest / first)
  const [liveSnapshotUid, setLiveSnapshotUid] = useState<string | null>(null)

  const {
    fmtDate,
    fmtMonthYear,
    fmtDateTime,
    datePickerFormat,
    datePickerPlaceholder,
  } = useInvoiceFormatters()
  const { mutate: downloadPdf, isPending: isDownloading } =
    useDownloadInvoicePdf()
  const { mutate: computeInvoiceMutate, isPending: computePending } =
    useComputeInvoice()

  const [periodStart, setPeriodStart] = useState<Date | undefined>()
  const [periodEnd, setPeriodEnd] = useState<Date | undefined>()

  const {
    data: historyData,
    isLoading: historyLoading,
    isFetchingNextPage: historyFetchingMore,
    hasNextPage: historyHasMore,
    fetchNextPage: historyFetchMore,
  } = useGetInvoiceHistory(contractUid)

  const {
    data: liveData,
    isLoading: liveLoading,
    isFetchingNextPage: liveFetchingMore,
    hasNextPage: liveHasMore,
    fetchNextPage: liveFetchMore,
  } = useGetLiveInvoice(contractUid)

  const { data: historicalInvoice, isLoading: historicalLoading } =
    useGetInvoice(isLive ? null : viewMode)

  // Flatten paginated pages
  const allHistory = historyData
    ? uniqueByInvoiceUid(historyData.pages.flatMap((p) => p.data?.items ?? []))
    : []
  const allSnapshots = liveData
    ? liveData.pages.flatMap((p) => p.data?.items ?? [])
    : []

  const hasHistory = allHistory.length > 0

  // Resolve which live snapshot to display
  const liveSnapshot =
    allSnapshots.length > 0
      ? (allSnapshots.find((s) => s.uid === liveSnapshotUid) ?? allSnapshots[0])
      : null

  const displayInvoice = isLive ? liveSnapshot : historicalInvoice
  const invoiceLoading = isLive ? liveLoading : historicalLoading
  const hasInvoice = !!displayInvoice && !invoiceLoading

  const historicalForActions = isLive ? null : historicalInvoice
  const latestSend = historicalForActions?.history?.[0] ?? null

  // Group live snapshots by calendar date (using period_start_at)
  type SnapshotItem = (typeof allSnapshots)[number]
  type DateGroup = { dateKey: string; label: string; snapshots: SnapshotItem[] }
  const dateGroups: DateGroup[] = []
  {
    const seen = new Map<string, DateGroup>()
    for (const snap of allSnapshots) {
      const d = new Date(snap.period_start_at)
      const dateKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
      if (!seen.has(dateKey)) {
        const group: DateGroup = {
          dateKey,
          label: format(
            new Date(
              Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
            ),
            "d MMM yyyy"
          ),
          snapshots: [],
        }
        seen.set(dateKey, group)
        dateGroups.push(group)
      }
      seen.get(dateKey)!.snapshots.push(snap)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {contractUid && (
        <div className="flex items-center gap-3 rounded-xl border bg-white px-5 py-4">
          <span className="text-text-1 shrink-0 text-sm font-semibold">
            Compute Invoice
          </span>
          <DatePickerInput
            value={periodStart}
            onChange={setPeriodStart}
            dateFormat={datePickerFormat}
            placeholder={datePickerPlaceholder}
          />
          <span className="text-text-1/50 text-sm">→</span>
          <DatePickerInput
            value={periodEnd}
            onChange={setPeriodEnd}
            dateFormat={datePickerFormat}
            placeholder={datePickerPlaceholder}
          />
          <Button
            variant="primary"
            size="md"
            className="max-w-fit shrink-0 rounded-sm"
            disabled={!periodStart || !periodEnd || computePending}
            onClick={() => {
              if (!periodStart || !periodEnd) return
              const start = new Date(periodStart)
              start.setUTCHours(0, 0, 0, 0)
              const end = new Date(periodEnd)
              end.setUTCHours(23, 59, 59, 999)
              computeInvoiceMutate(
                {
                  contract_uid: contractUid,
                  period_start: start.toISOString(),
                  period_end: end.toISOString(),
                },
                {
                  onSuccess: () => {
                    setPeriodStart(undefined)
                    setPeriodEnd(undefined)
                  },
                }
              )
            }}
          >
            {computePending ? "Computing…" : "Compute"}
          </Button>
        </div>
      )}
      <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-4">
        {/* ── Left: invoice card ── */}
        <div className="overflow-hidden rounded-xl border bg-white">
          {/* Card header */}
          <div className="grid grid-cols-[1fr_auto] gap-8 border-b px-6 py-5">
            <div className="space-y-2">
              <img
                src="https://i.ibb.co/S4PF9FrQ/switch-Fjlogo.png"
                alt="Switch"
                className="h-6 object-contain"
              />
              <div className="text-text-1 flex items-center gap-2 text-sm">
                <span className="font-medium">Invoice Date:</span>
                {invoiceLoading ? (
                  <div className="h-3 w-44 animate-pulse rounded bg-gray-200" />
                ) : hasInvoice ? (
                  <span>
                    {fmtDate(displayInvoice.period_start_at)} –{" "}
                    {fmtDate(displayInvoice.period_end_at)}
                  </span>
                ) : (
                  <span>--</span>
                )}
              </div>
            </div>
            <div className="text-sm">
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                <span className="text-text-1 font-medium">Customer:</span>
                <span>{clientName}</span>
                <span className="text-text-1 font-medium">Site:</span>
                <span>{siteName || "—"}</span>
                <span className="text-text-1 font-medium">Invoice No:</span>
                {invoiceLoading ? (
                  <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
                ) : isLive ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Live
                  </span>
                ) : historicalInvoice ? (
                  <span className="font-medium text-blue-600">
                    {historicalInvoice.invoice_ref}
                  </span>
                ) : (
                  <span>--</span>
                )}
              </div>
            </div>
          </div>

          {/* Date pills for live snapshots */}
          {isLive && !liveLoading && dateGroups.length > 1 && (
            <div className="flex gap-2 overflow-x-auto border-b px-6 py-3">
              {dateGroups.map((group) => {
                const isActive = group.snapshots.some((s) =>
                  liveSnapshotUid
                    ? s.uid === liveSnapshotUid
                    : s === allSnapshots[0]
                )
                return (
                  <button
                    key={group.dateKey}
                    onClick={() => setLiveSnapshotUid(group.snapshots[0].uid)}
                    className={[
                      "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      isActive
                        ? "border-green-500 bg-green-100 text-green-700"
                        : "border-border text-text-1 bg-white hover:bg-neutral-100",
                    ].join(" ")}
                  >
                    {group.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Card body */}
          <div className="px-6 py-5">
            {invoiceLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="overflow-hidden rounded-md border">
                  <div className="bg-[#E8EEF2] px-4 py-3">
                    <div className="h-3.5 w-1/3 rounded bg-gray-300" />
                  </div>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`flex gap-6 px-4 py-3.5 ${i % 2 ? "bg-neutral-50" : "bg-white"}`}
                    >
                      <div className="h-3 flex-1 rounded bg-gray-200" />
                      <div className="h-3 w-14 rounded bg-gray-200" />
                      <div className="h-3 w-10 rounded bg-gray-200" />
                      <div className="h-3 w-14 rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              </div>
            ) : !contractUid ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-2">
                <p className="text-text-1 text-base font-semibold">
                  No contract
                </p>
                <p className="text-muted-foreground text-sm">
                  Link a contract to generate invoices.
                </p>
              </div>
            ) : !hasInvoice ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-2">
                <p className="text-text-1 text-base font-semibold">
                  No data yet
                </p>
                <p className="text-muted-foreground text-sm">
                  Live invoice data will appear here once available.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <InvoiceLineItemsTable
                  invoice={displayInvoice}
                  hideUtilityLines={contractCombo === "ppa_on_grid"}
                />
                <InvoiceMeterDataTable invoice={displayInvoice} />
              </div>
            )}
          </div>
        </div>

        {/* ── Right: live snapshots + history + actions ── */}
        <div className="flex flex-col gap-4">
          {/* Live snapshots box */}
          {contractUid && (
            <div className="flex max-h-72 flex-col overflow-hidden rounded-xl border bg-white">
              <div className="flex shrink-0 items-center justify-between border-b px-4 py-4">
                <span className="flex items-center gap-2 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Live
                </span>
                {liveLoading && (
                  <Loader2 className="text-muted-foreground h-3.5 w-3.5 animate-spin" />
                )}
              </div>

              {liveLoading ? (
                <div className="animate-pulse divide-y">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="h-3 w-20 rounded bg-gray-200" />
                      <div className="h-3 w-16 rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              ) : dateGroups.length === 0 ? (
                <div className="text-muted-foreground px-4 py-6 text-center text-sm">
                  No live data yet
                </div>
              ) : (
                <div className="overflow-y-auto">
                  <div className="divide-y">
                    {dateGroups.map((group) => (
                      <div key={group.dateKey}>
                        <div className="text-muted-foreground bg-neutral-50 px-4 py-1.5 text-[11px] font-semibold tracking-wide uppercase">
                          {group.label}
                        </div>
                        {group.snapshots.map((snap, index) => {
                          const isActive =
                            isLive &&
                            (liveSnapshotUid === snap.uid ||
                              (!liveSnapshotUid && snap === allSnapshots[0]))
                          const s = new Date(snap.period_start_at)
                          const e = new Date(snap.period_end_at)
                          const startTime = `${String(s.getUTCHours()).padStart(2, "0")}:${String(s.getUTCMinutes()).padStart(2, "0")}`
                          const endTime = `${String(e.getUTCHours()).padStart(2, "0")}:${String(e.getUTCMinutes()).padStart(2, "0")}`
                          return (
                            <button
                              key={snap.uid}
                              onClick={() => {
                                setViewMode("live")
                                setLiveSnapshotUid(snap.uid)
                              }}
                              className={[
                                "flex w-full items-center justify-between border-l-2 py-2.5 pr-4 pl-3.5 text-left transition-all hover:bg-green-50",
                                index % 2 === 0 ? "bg-white" : "bg-neutral-50",
                                isActive
                                  ? "border-green-500 bg-green-50"
                                  : "border-transparent",
                              ].join(" ")}
                            >
                              <span className="text-text-1 text-xs font-medium">
                                {startTime} – {endTime}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {snap.total}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                  {liveHasMore && (
                    <button
                      onClick={() => liveFetchMore()}
                      disabled={liveFetchingMore}
                      className="text-muted-foreground flex w-full items-center justify-center gap-2 py-3 text-xs font-medium transition-colors hover:bg-neutral-50 disabled:opacity-50"
                    >
                      {liveFetchingMore ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : null}
                      {liveFetchingMore ? "Loading…" : "Load more"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* History box */}
          <div className="overflow-hidden rounded-xl border bg-white">
            <div className="border-b px-4 py-4">
              <span className="font-semibold">History</span>
            </div>

            {historyLoading ? (
              <div className="animate-pulse divide-y">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3.5"
                  >
                    <div className="h-3 w-28 rounded bg-gray-200" />
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-14 rounded bg-gray-200" />
                      <div className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !hasHistory ? (
              <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-12 text-center">
                <p className="font-semibold">No History</p>
                <p className="text-muted-foreground text-sm">
                  Generated invoices will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {allHistory.map((item, index) => {
                  const isSelected = !isLive && viewMode === item.invoice_uid
                  const isLoadingThis = isSelected && historicalLoading
                  return (
                    <button
                      key={item.uid}
                      onClick={() => setViewMode(item.invoice_uid)}
                      className={[
                        "text-text-1 flex w-full cursor-pointer items-center justify-between border-l-2 py-3 pr-4 pl-3.5 text-left transition-all hover:bg-neutral-50",
                        index % 2 === 0 ? "bg-neutral-100" : "",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-transparent",
                      ].join(" ")}
                    >
                      <span className="text-sm font-medium">
                        {item.invoice.invoice_ref}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-text-1 text-xs">
                          {fmtMonthYear(item.sent_at)}
                        </span>
                        {isLoadingThis ? (
                          <Loader2 className="text-muted-foreground h-3 w-3 animate-spin" />
                        ) : (
                          <span
                            className={[
                              "h-2.5 w-2.5 rounded-full",
                              item.was_successful
                                ? "bg-green-500"
                                : "bg-red-500",
                            ].join(" ")}
                          />
                        )}
                      </div>
                    </button>
                  )
                })}
                {historyHasMore && (
                  <button
                    onClick={() => historyFetchMore()}
                    disabled={historyFetchingMore}
                    className="text-muted-foreground flex w-full items-center justify-center gap-2 py-3 text-xs font-medium transition-colors hover:bg-neutral-50 disabled:opacity-50"
                  >
                    {historyFetchingMore ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : null}
                    {historyFetchingMore ? "Loading…" : "Load more"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="rounded-xl border bg-white px-4 py-4">
            {latestSend ? (
              <div className="mb-3 space-y-0.5 text-sm">
                <p className="text-muted-foreground">
                  Sent to{" "}
                  <span className="text-text-1 font-semibold">
                    {latestSend.sent_to}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Sent on{" "}
                  <span className="text-text-1 font-semibold">
                    {fmtDateTime(latestSend.sent_at)}
                  </span>
                </p>
              </div>
            ) : (
              <p className="mb-3 text-sm">
                <span className="text-muted-foreground">Billing Email: </span>
                <span className="font-semibold">{billingEmail}</span>
              </p>
            )}
            <Button
              variant={!isLive && !!historicalInvoice ? "primary" : "outlined"}
              size="sm"
              className="flex w-full items-center justify-center gap-2 rounded"
              disabled={isLive || !historicalInvoice || isDownloading}
              onClick={() =>
                historicalInvoice &&
                downloadPdf({
                  invoiceUid: historicalInvoice.uid,
                  invoiceRef: historicalInvoice.invoice_ref,
                })
              }
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isDownloading ? "Downloading..." : "Download PDF"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function SitePageInner() {
  const params = useParams<{ siteUid: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { SettingsStore } = useStore()

  const clientUid = searchParams.get("clientUid") ?? ""
  const contractUid = searchParams.get("contractUid") ?? ""

  const { data: clientsData } = useClients()
  const clientInfo = (clientsData?.data?.items ?? []).find(
    (c) => c.uid === clientUid
  )
  const clientName = clientInfo?.client_name ?? ""
  const clientEmail = clientInfo?.client_email ?? ""

  const { data: sitesData } = useSites(clientUid || undefined)
  const siteName =
    (sitesData?.data ?? []).find((s) => s.uid === params.siteUid)?.site_name ??
    ""

  const [editOpen, setEditOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const { data: contract } = useGetContract(contractUid)
  const contractCombo = contract
    ? getCombo(contract.contract_type, contract.system_mode)
    : null

  useEffect(() => {
    SettingsStore.fetchSettings()
  }, [])

  const hasContract = !!contractUid

  return (
    <div className="min-h-full bg-[#FAFAFA] p-6">
      {/* ── Page header ── */}
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              router.replace(
                clientUid ? `/?clientUid=${encodeURIComponent(clientUid)}` : "/"
              )
            }
            className="border-border flex h-8 w-8 items-center justify-center rounded border bg-white transition-colors hover:bg-neutral-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-text-1 text-xl font-bold">
              {siteName || "Site"}
            </h1>
            <p className="text-muted-foreground text-xs">{clientName}</p>
          </div>
          {contract && (
            <span className="rounded bg-blue-600 px-2.5 py-0.5 text-xs font-medium text-white">
              {contract.contract_type} · {contract.system_mode}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!hasContract && (
            <Button
              variant="primary"
              size="md"
              className="gap-2 rounded-sm"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Contract
            </Button>
          )}
        </div>
      </div>

      {/* ── Two-section layout ── */}
      <div className="space-y-6">
        <section>
          <h2 className="text-text-1 mb-3 font-semibold">Invoice</h2>
          <InvoiceSection
            contractUid={hasContract ? contractUid : null}
            clientName={clientName}
            siteName={siteName}
            billingEmail={clientEmail}
            contractCombo={contractCombo}
          />
        </section>

        {/* Contract terms — below, only when a contract exists */}
        {hasContract && (
          <section className="overflow-hidden rounded-xl border bg-white">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-text-1 font-semibold">Contract Terms</h2>
              <Button
                variant="outlined"
                size="md"
                className="max-w-fit gap-2 rounded-sm"
                onClick={() => setEditOpen(true)}
              >
                <Edit className="h-4 w-4" />
                Edit Contract
              </Button>
            </div>
            <ContractSection
              contractUid={contractUid}
              clientName={clientName}
              clientEmail={clientEmail}
              siteName={siteName}
              onEdit={() => setEditOpen(true)}
              onCreateDetails={() => setEditOpen(true)}
            />
          </section>
        )}
      </div>

      {/* ── Edit contract sheet ── */}
      {editOpen && contract && (
        <ContractDetailsSheet
          open={editOpen}
          onClose={() => setEditOpen(false)}
          clientUid={clientUid}
          contractUid={contractUid}
          contractType={contract.contract_type}
          systemMode={contract.system_mode}
          currency={contract.currency}
          clientName={clientName}
          siteName={siteName}
          existingDetails={contract.details ?? undefined}
        />
      )}

      {/* ── Create contract sheet ── */}
      {createOpen && (
        <CreateContractSheet
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          clientUid={clientUid}
          clientName={clientName}
          siteUid={params.siteUid}
          siteName={siteName}
          onContractCreated={(
            newContractUid,
            contractType,
            systemMode,
            currency
          ) => {
            setCreateOpen(false)
            router.replace(
              `/sites/${params.siteUid}?` +
                new URLSearchParams({
                  clientUid,
                  contractUid: newContractUid,
                }).toString()
            )
          }}
        />
      )}
    </div>
  )
}

export default function SitePage() {
  return (
    <Suspense fallback={null}>
      <SitePageInner />
    </Suspense>
  )
}
