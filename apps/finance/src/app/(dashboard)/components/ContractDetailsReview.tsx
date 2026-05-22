"use client"

import { VIS, DAY_LABEL } from "@/constants/contract"
import type { ContractDetailsValues } from "@/constants/contractDetails"
import { useInvoiceFormatters } from "@/hooks/useInvoiceFormatters"

type Props = {
  values: ContractDetailsValues
  show: (field: keyof typeof VIS) => boolean
  contractEnd: string
  actualEnd: string
  computedTotal: string
  currency: string
  contractTypeLabel: string
  systemModeLabel: string
  siteName: string | null
  clientName: string
}

const LABEL = "text-sm text-text-1 font-semibold shrink-0"
const VALUE = "text-sm text-text-1"

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[320px_1fr] py-2.5">
      <span className={LABEL}>{label}</span>
      <span className={VALUE}>{value || "—"}</span>
    </div>
  )
}

export default function ContractDetailsReview({
  values,
  show,
  contractEnd,
  actualEnd,
  computedTotal,
  currency,
  contractTypeLabel,
  systemModeLabel,
  siteName,
  clientName,
}: Props) {
  const { fmtDate } = useInvoiceFormatters()

  return (
    <div className="space-y-6">
      {/* 3-column field grid */}
      <div className="border-border grid grid-cols-3 gap-x-10 border-b pb-6">
        {/* Col 1 — time / period fields */}
        <div>
          {show("term_years") && (
            <FieldRow
              label="Term Years"
              value={values.term_years ? `${values.term_years} years` : "—"}
            />
          )}
          {show("tariff_periods") && (
            <FieldRow label="Tariff Periods" value={values.tariff_periods} />
          )}
          {show("tariff_indexed_rule_type") && (
            <FieldRow
              label="Tariff Rule Type"
              value={values.tariff_indexed_rule_type}
            />
          )}
          {show("implementation_period") && (
            <FieldRow
              label="Implementation Period"
              value={
                values.implementation_period
                  ? `${values.implementation_period} Month${parseInt(values.implementation_period, 10) > 1 ? "s" : ""}`
                  : "—"
              }
            />
          )}
          {show("monthly_baseline_consumption") && (
            <FieldRow
              label="Monthly Baseline Consumption (kWh)"
              value={values.monthly_baseline_consumption}
            />
          )}
          {show("minimum_consumption_monthly") && (
            <FieldRow
              label="Minimum Monthly Consumption (kWh)"
              value={values.minimum_consumption_monthly}
            />
          )}
          {show("minimum_spend") && (
            <FieldRow label="Minimum Spend" value={values.minimum_spend} />
          )}
          {show("estimated_utility") && (
            <FieldRow
              label="Estimated Utility"
              value={values.estimated_utility}
            />
          )}
        </div>

        {/* Col 2 — dates */}
        <div>
          {show("signing_date") && (
            <FieldRow
              label="Contract Signing Date"
              value={fmtDate(values.signing_date ?? "")}
            />
          )}
          {show("commissioning_date") && (
            <FieldRow
              label="Expected Commissioning Date"
              value={fmtDate(values.commissioning_date ?? "")}
            />
          )}
          {show("contract_end") && (
            <FieldRow label="Expected End Date" value={fmtDate(contractEnd)} />
          )}
          {show("actual_commissioned_at") && values.actual_commissioned_at && (
            <FieldRow
              label="Actual Commissioned Date"
              value={fmtDate(values.actual_commissioned_at)}
            />
          )}
          {show("actual_end_at") && (values.actual_end_at || actualEnd) && (
            <FieldRow
              label="Actual End Date"
              value={fmtDate(values.actual_end_at || actualEnd)}
            />
          )}
          {show("system_size_kwp") && (
            <FieldRow
              label="System Size (kWp)"
              value={values.system_size_kwp}
            />
          )}
          {show("guaranteed_production") && (
            <FieldRow
              label="Guaranteed Production (kWh/kWp)"
              value={values.guaranteed_production}
            />
          )}
          {show("grid_meter_reading_kwh") && (
            <FieldRow
              label="Grid Meter Reading at Commissioning (kWh)"
              value={values.grid_meter_reading_kwh}
            />
          )}
          {show("grid_meter_reading_kvar") && (
            <FieldRow
              label="Grid Meter Reading at Commissioning (kVAR)"
              value={values.grid_meter_reading_kvar}
            />
          )}
          {show("with_battery") && (
            <FieldRow
              label="With Battery"
              value={
                values.with_battery === "yes"
                  ? "Yes"
                  : values.with_battery === "no"
                    ? "No"
                    : "—"
              }
            />
          )}
        </div>

        {/* Col 3 — billing / financial */}
        <div>
          {show("billing_frequency") && (
            <FieldRow
              label="Billing Frequency"
              value={values.billing_frequency}
            />
          )}
          {show("billing_frequency") &&
            values.billing_frequency === "weekly" &&
            values.weekly_billing_start_day !== "" && (
              <FieldRow
                label="Weekly Billing Start Day"
                value={
                  DAY_LABEL[
                    parseInt(values.weekly_billing_start_day ?? "", 10)
                  ] ?? "—"
                }
              />
            )}
          {show("equipment_lease") && (
            <FieldRow
              label="Equipment Lease"
              value={
                values.equipment_lease
                  ? `${currency} ${values.equipment_lease}`
                  : "—"
              }
            />
          )}
          {show("maintenance") && (
            <FieldRow
              label="Maintenance"
              value={
                values.maintenance ? `${currency} ${values.maintenance}` : "—"
              }
            />
          )}
          {show("total") && (
            <FieldRow
              label="Total"
              value={computedTotal ? `${currency} ${computedTotal}` : "—"}
            />
          )}
          {show("solar_production_month") && (
            <FieldRow
              label="Solar Production this Month"
              value={values.solar_production_month}
            />
          )}
        </div>
      </div>

      {/* Tariffs table */}
      {show("tariffs_table") &&
        values.tariffs.length > 0 &&
        (() => {
          const SLOT_LABEL: Record<string, string> = {
            A: "Solar Hours",
            B: "Non-Solar Hours",
            Solar: "Solar Hours",
            Utility: "Utility Hours",
          }
          const showDuration = parseInt(values.tariff_periods ?? "0", 10) > 1
          const COLS = "grid-cols-[1fr_120px_100px_100px]"

          // Group by period_number preserving insertion order
          const periodGroups = Array.from(
            values.tariffs.reduce((map, t) => {
              const p = t.period_number ?? "1"
              if (!map.has(p)) map.set(p, [])
              map.get(p)!.push(t)
              return map
            }, new Map<string, typeof values.tariffs>())
          )

          return (
            <div className="border-border overflow-hidden rounded-lg border">
              <div
                className={`bg-blue/40 grid ${COLS} gap-4 px-4 py-2.5 text-xs font-semibold text-[#2C6B6B]`}
              >
                <span>Tariff</span>
                <span>Rate</span>
                <span>Start Time</span>
                <span>End Time</span>
              </div>

              {periodGroups.map(([periodNum, slots]) => (
                <div key={periodNum}>
                  {showDuration && (
                    <div className="border-border flex items-center justify-between border-t bg-neutral-50 px-4 py-2">
                      <span className="text-text-1 text-xs font-semibold">
                        Period {periodNum}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        Duration:{" "}
                        <span className="text-text-1 font-medium">
                          {slots[0].duration_years
                            ? `${slots[0].duration_years} yr${parseInt(slots[0].duration_years, 10) !== 1 ? "s" : ""}`
                            : "—"}
                        </span>
                      </span>
                    </div>
                  )}
                  {slots.map((t, i) => (
                    <div
                      key={i}
                      className={`border-border grid ${COLS} items-center gap-4 border-t bg-white px-4 py-2.5 text-xs`}
                    >
                      <span className="text-text-1 font-medium">
                        {SLOT_LABEL[t.slot] ?? t.slot} (
                        {t.slot_type === "Variable"
                          ? "Indexed"
                          : t.slot_type || "—"}
                        )
                      </span>
                      <span
                        className={
                          t.rate && parseFloat(t.rate) < 0
                            ? "text-destructive font-medium"
                            : "text-primary font-medium"
                        }
                      >
                        {t.rate
                          ? `${t.rate} ${t.slot_type === "Variable" ? "%" : "$/kWh"}`
                          : "—"}
                      </span>
                      <span className="text-text-1">{t.time_start || "—"}</span>
                      <span className="text-text-1">{t.time_end || "—"}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )
        })()}

      {/* Warning banner */}
      <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-xs text-orange-700">
        <span className="mt-0.5 shrink-0">⚠</span>
        <span>
          You are creating a {values.term_years ?? "?"}-year {systemModeLabel}{" "}
          {contractTypeLabel} contract for {siteName ?? clientName}. Please
          review all details carefully before confirming.
        </span>
      </div>
    </div>
  )
}
