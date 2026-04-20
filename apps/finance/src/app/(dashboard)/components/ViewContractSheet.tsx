"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Sheet, SheetContent, Skeleton, Button } from "@workspace/ui"
import { CheckCircle } from "lucide-react"
import { useGetContract } from "@/hooks/useContract"
import { EnumContractType, EnumContractSystemMode } from "@/constants/mangle"
import type { ContractDetailsRespModel, TariffRespModel } from "@/types/site"
import ContractDetailsSheet from "./ContractDetailsSheet"

type Props = {
  open: boolean
  onClose: () => void
  contractUid: string
  clientName: string
  siteName: string | null
}

const LABEL = "text-xs text-muted-foreground shrink-0"
const VALUE = "text-xs font-medium text-text-1"
const VALUE_MUTED = "text-xs font-medium text-muted-foreground"

function fmt(val: string | null | undefined) {
  if (!val) return "—"
  try {
    return format(new Date(val), "M/d/yyyy")
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
    <div className="border-border flex items-start justify-between gap-4 border-b py-2.5 last:border-0">
      <span className={LABEL}>{label}</span>
      <span className={muted ? VALUE_MUTED : VALUE}>{value ?? "—"}</span>
    </div>
  )
}

function TariffRow({ t }: { t: TariffRespModel }) {
  const time =
    t.time_start && t.time_end ? `${t.time_start} - ${t.time_end}` : "—"
  return (
    <div className="border-border grid grid-cols-[160px_160px_1fr] items-center gap-3 border-t bg-white px-4 py-2.5 text-xs">
      <span className="text-text-1 font-medium">
        Tariff {t.period_number}/{t.slot}
      </span>
      <span
        className={
          t.rate < 0
            ? "text-destructive font-medium"
            : "text-primary font-medium"
        }
      >
        {t.rate}
      </span>
      <span className="text-text-1">{time}</span>
    </div>
  )
}

export default function ViewContractSheet({
  open,
  onClose,
  contractUid,
  clientName,
  siteName,
}: Props) {
  const { data: contract, isLoading, isError } = useGetContract(contractUid)
  const [editOpen, setEditOpen] = useState(false)

  const d: ContractDetailsRespModel | null = contract?.details ?? null
  const isPPA = contract?.contract_type === EnumContractType.PPA
  const isOffGrid = contract?.system_mode === EnumContractSystemMode.OFF_GRID
  const isLease = contract?.contract_type === EnumContractType.LEASE

  const contractTypeLabel = isPPA ? "PPA" : "Lease"
  const systemModeLabel = isOffGrid ? "Off Grid" : "On Grid"

  return (
    <>
      {contract && editOpen && (
        <ContractDetailsSheet
          open={editOpen}
          onClose={() => setEditOpen(false)}
          clientUid={contract.client_uid}
          contractUid={contractUid}
          contractType={contract.contract_type}
          systemMode={contract.system_mode}
          currency={contract.currency}
          clientName={clientName}
          siteName={siteName}
        />
      )}

      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent
          side="right"
          className="border-border top-11 w-screen! max-w-none! overflow-y-auto rounded-t-3xl border bg-[#FAFAFA] p-10 sm:top-21"
        >
          <div className="border-border overflow-hidden rounded-2xl border bg-white">
            {/* ── Header ── */}
            <div className="border-border flex items-center justify-between border-b px-8 py-5">
              <p className="text-text-1 text-lg font-semibold">View Contract</p>
              <div className="flex gap-2">
                <Button
                  variant="outlined"
                  size="md"
                  className="rounded-sm"
                  onClick={() => setEditOpen(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="gap-2 rounded-sm"
                >
                  <CheckCircle className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>

            {/* ── Loading / Error ── */}
            {isLoading && (
              <div className="space-y-3 px-8 py-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full rounded" />
                ))}
              </div>
            )}
            {isError && (
              <p className="text-destructive px-8 py-6 text-sm">
                Failed to load contract details.
              </p>
            )}

            {contract && (
              <>
                {/* ── Summary bar ── */}
                <div className="border-border grid grid-cols-[440px_290px_1fr] border-b px-8 py-5">
                  <div className="space-y-2">
                    <div className="grid grid-cols-[140px_1fr] items-baseline gap-1">
                      <span className="text-text-1 text-sm font-semibold">
                        Customer:
                      </span>
                      <span className="text-text-1 text-sm">{clientName}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-baseline gap-1">
                      <span className="text-text-1 text-sm font-semibold">
                        Site:
                      </span>
                      <span className="text-text-1 text-sm">
                        {siteName ?? "—"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-baseline gap-1">
                      <span className="text-text-1 text-sm font-semibold">
                        Contract reference
                      </span>
                      <span className="text-text-1 text-sm">
                        {contract.contract_ref}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-[110px_1fr] items-baseline gap-1">
                      <span className="text-text-1 text-sm font-semibold">
                        Contract Type
                      </span>
                      <span className="text-text-1 text-sm">
                        {contractTypeLabel}
                      </span>
                    </div>
                    <div className="grid grid-cols-[110px_1fr] items-baseline gap-1">
                      <span className="text-text-1 text-sm font-semibold">
                        System Mode
                      </span>
                      <span className="text-text-1 text-sm">
                        {systemModeLabel}
                      </span>
                    </div>
                    <div className="grid grid-cols-[110px_1fr] items-baseline gap-1">
                      <span className="text-text-1 text-sm font-semibold">
                        Currency
                      </span>
                      <span className="text-text-1 text-sm">
                        {contract.currency}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-[170px_1fr] items-baseline gap-1">
                      <span className="text-text-1 text-sm font-semibold">
                        Client email (for invoice)
                      </span>
                      <span className="text-text-1 text-sm">—</span>
                    </div>
                  </div>
                </div>

                {/* ── No details ── */}
                {!d && (
                  <div className="flex flex-col items-center gap-4 px-8 py-10 text-center">
                    <p className="text-muted-foreground text-sm">
                      No details have been submitted for this contract yet.
                    </p>
                    <Button
                      variant="primary"
                      size="md"
                      className="rounded-sm"
                      onClick={() => setEditOpen(true)}
                    >
                      Add Contract Details
                    </Button>
                  </div>
                )}

                {/* ── Details ── */}
                {d && (
                  <div className="space-y-6 px-8 py-6">
                    {/* 3-column flat field grid */}
                    <div className="border-border grid grid-cols-3 gap-x-10 border-b pb-6">
                      <div>
                        <FieldRow
                          label="Term years"
                          value={d.term_years ? `${d.term_years} years` : "—"}
                        />
                        {isPPA && (
                          <FieldRow
                            label="Tariff Periods"
                            value={d.tariff_periods ?? "—"}
                          />
                        )}
                        <FieldRow
                          label="Implementation Period"
                          value={d.implementation_period ?? "—"}
                        />
                      </div>
                      <div>
                        <FieldRow
                          label="Contract Signing Date"
                          value={fmt(d.signed_at)}
                        />
                        <FieldRow
                          label="Commissioning Date"
                          value={fmt(d.commissioned_at)}
                        />
                        <FieldRow
                          label="Implementation Period"
                          value={d.implementation_period ?? "—"}
                        />
                      </div>
                      <div>
                        <FieldRow
                          label="Billing Frequency"
                          value={d.billing_frequency ?? "—"}
                        />
                        {!isLease && (
                          <FieldRow
                            label="Grid Meter reading at Commissioning"
                            value={d.grid_meter_reading_at_commissioning ?? "—"}
                            muted={!d.grid_meter_reading_at_commissioning}
                          />
                        )}
                        {!isLease && (
                          <FieldRow
                            label="Guaranteed Production kWh/kWp"
                            value={d.guaranteed_production_kwh_per_kwp ?? "—"}
                            muted={!d.guaranteed_production_kwh_per_kwp}
                          />
                        )}
                        {isLease && (
                          <>
                            <FieldRow
                              label="Equipment Lease Amount"
                              value={d.equipment_lease_amount ?? "—"}
                            />
                            <FieldRow
                              label="Maintenance Amount"
                              value={d.maintenance_amount ?? "—"}
                            />
                            <FieldRow label="Total" value={d.total ?? "—"} />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Tariffs table */}
                    {isPPA && (
                      <div className="border-border overflow-hidden rounded-lg border">
                        <div className="bg-blue/40 grid grid-cols-[160px_160px_1fr] px-4 py-2.5 text-xs font-semibold text-[#2C6B6B]">
                          <span>Tariffs</span>
                          <span>Rate/%</span>
                          <span>Time</span>
                        </div>
                        {d.tariffs && d.tariffs.length > 0 ? (
                          d.tariffs.map((t) => <TariffRow key={t.uid} t={t} />)
                        ) : (
                          <div className="text-muted-foreground bg-white px-4 py-4 text-xs">
                            No tariff rows available.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom fields */}
                    {isPPA && (
                      <div className="border-border grid grid-cols-2 gap-x-10 border-t pt-6">
                        <div>
                          <FieldRow
                            label="Monthly Baseline Consumption (kWh)"
                            value={d.monthly_baseline_consumption_kwh ?? "—"}
                          />
                          <FieldRow
                            label="Minimum Consumption Monthly"
                            value={d.minimum_consumption_monthly_kwh ?? "—"}
                          />
                          <FieldRow
                            label="Minimum Spend"
                            value={
                              d.minimum_spend != null ? (
                                <span className="text-primary text-xs font-medium">
                                  {d.minimum_spend}
                                </span>
                              ) : (
                                "—"
                              )
                            }
                          />
                          <FieldRow
                            label="Estimated Utility"
                            value={d.estimated_utility ?? "—"}
                          />
                        </div>
                        <div>
                          <FieldRow label="Site Meter 1 - Day" value="—" />
                          <FieldRow label="Site Meter 1 - Night" value="—" />
                          <FieldRow label="Generator Meter 1 - Day" value="—" />
                          <FieldRow
                            label="Generator Meter 1 - Night"
                            value="—"
                          />
                        </div>
                      </div>
                    )}

                    {/* Warning banner */}
                    <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-xs text-orange-700">
                      <span className="mt-0.5 shrink-0">⚠</span>
                      <span>
                        You are creating a {d.term_years ?? "?"}-year{" "}
                        {systemModeLabel} {contractTypeLabel} contract for{" "}
                        {siteName ?? clientName}. Once created it will be locked
                        until the contract end date.
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
