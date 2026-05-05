"use client"

import { format } from "date-fns"
import { VIS } from "@/constants/contract"
import type { ContractDetailsValues } from "@/constants/contractDetails"

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
    <div className="grid grid-cols-[220px_1fr] py-2.5">
      <span className={LABEL}>{label}</span>
      <span className={VALUE}>{value || "—"}</span>
    </div>
  )
}

function fmt(dateStr: string | undefined): string {
  if (!dateStr) return "—"
  try {
    return format(new Date(dateStr), "M/d/yyyy")
  } catch {
    return dateStr
  }
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
              value={fmt(values.signing_date)}
            />
          )}
          {show("commissioning_date") && (
            <FieldRow
              label="Expected Commissioning Date"
              value={fmt(values.commissioning_date)}
            />
          )}
          {show("contract_end") && (
            <FieldRow label="Expected End Date" value={fmt(contractEnd)} />
          )}
          {show("actual_commissioned_at") && values.actual_commissioned_at && (
            <FieldRow
              label="Actual Commissioned Date"
              value={fmt(values.actual_commissioned_at)}
            />
          )}
          {show("actual_end_at") && (values.actual_end_at || actualEnd) && (
            <FieldRow
              label="Actual End Date"
              value={fmt(values.actual_end_at || actualEnd)}
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
          {show("grid_meter_reading") && (
            <FieldRow
              label="Grid Meter Reading at Commissioning"
              value={values.grid_meter_reading}
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
      {show("tariffs_table") && values.tariffs.length > 0 && (
        <div className="border-border overflow-hidden rounded-lg border">
          <div className="bg-blue/40 grid grid-cols-[180px_140px_140px] px-4 py-2.5 text-xs font-semibold text-[#2C6B6B]">
            <span>Tariff</span>
            <span>Type</span>
            <span>Rate</span>
          </div>
          {values.tariffs.map((t, i) => (
            <div
              key={i}
              className="border-border grid grid-cols-[180px_140px_140px] items-center border-t bg-white px-4 py-2.5 text-xs"
            >
              <span className="text-text-1 font-medium">
                Tariff {t.period_number}/{t.slot}
              </span>
              <span className="text-text-1">{t.slot_type || "—"}</span>
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
            </div>
          ))}
        </div>
      )}

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
