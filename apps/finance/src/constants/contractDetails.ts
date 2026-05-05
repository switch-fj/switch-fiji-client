import { z } from "zod"
import { VIS } from "@/constants/contract"
import type { Combo } from "@/constants/contract"
import type { ContractDetailsRespModel, TariffRespModel } from "@/types/site"

export const localDate = (s: string) => {
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

export const TariffRowSchema = z.object({
  period_number: z.string(),
  slot: z.string(),
  slot_type: z.string().min(1, "Required"),
  rate: z.string().min(1, "Required"),
  time_start: z.string().optional(),
  time_end: z.string().optional(),
})

// Loose type for TypeScript (all optional) — runtime validation via makeDetailsSchema
export const ContractDetailsSchema = z.object({
  term_years: z.string().optional(),
  signing_date: z.string().optional(),
  billing_frequency: z.string().optional(),
  tariff_periods: z.string().optional(),
  tariff_indexed_rule_type: z.string().optional(),
  commissioning_date: z.string().optional(),
  implementation_period: z.string().optional(),
  client_email: z.string().optional(),
  grid_meter_reading: z.string().optional(),
  system_size_kwp: z.string().optional(),
  guaranteed_production: z.string().optional(),
  equipment_lease: z.string().optional(),
  maintenance: z.string().optional(),
  solar_production_month: z.string().optional(),
  estimated_utility: z.string().optional(),
  monthly_baseline_consumption: z.string().optional(),
  minimum_consumption_monthly: z.string().optional(),
  minimum_spend: z.string().optional(),
  actual_commissioned_at: z.string().optional(),
  actual_end_at: z.string().optional(),
  tariffs: z.array(TariffRowSchema),
})

export type ContractDetailsValues = z.infer<typeof ContractDetailsSchema>

export function makeDetailsSchema(combo: Combo | null) {
  const req = (msg: string) => z.string().min(1, msg)
  const opt = z.string().optional()
  const f = (key: keyof typeof VIS, msg: string) =>
    combo && VIS[key][combo] ? req(msg) : opt

  return z.object({
    term_years: f("term_years", "Term years is required"),
    signing_date: f("signing_date", "Signing date is required"),
    billing_frequency: f("billing_frequency", "Billing frequency is required"),
    tariff_periods: f("tariff_periods", "Tariff periods is required"),
    tariff_indexed_rule_type: f(
      "tariff_indexed_rule_type",
      "Tariff rule type is required"
    ),
    commissioning_date: f(
      "commissioning_date",
      "Commissioning date is required"
    ),
    implementation_period: f(
      "implementation_period",
      "Implementation period is required"
    ),
    client_email:
      combo && VIS.client_email[combo]
        ? z.string().min(1, "Client email is required").email("Invalid email")
        : opt,
    grid_meter_reading: f(
      "grid_meter_reading",
      "Grid meter reading is required"
    ),
    system_size_kwp: f("system_size_kwp", "System size is required"),
    guaranteed_production: f(
      "guaranteed_production",
      "Guaranteed production is required"
    ),
    equipment_lease: f("equipment_lease", "Equipment lease is required"),
    maintenance: f("maintenance", "Maintenance is required"),
    solar_production_month: f(
      "solar_production_month",
      "Solar production is required"
    ),
    estimated_utility: f("estimated_utility", "Estimated utility is required"),
    monthly_baseline_consumption: f(
      "monthly_baseline_consumption",
      "Monthly baseline consumption is required"
    ),
    minimum_consumption_monthly: f(
      "minimum_consumption_monthly",
      "Minimum monthly consumption is required"
    ),
    minimum_spend: f("minimum_spend", "Minimum spend is required"),
    tariffs:
      combo && VIS.tariffs_table[combo]
        ? z.array(TariffRowSchema).min(1, "Add at least one tariff row")
        : z.array(TariffRowSchema),
  })
}

export function detailsToDefaults(
  d: ContractDetailsRespModel
): ContractDetailsValues {
  const slots: TariffRespModel[] = (() => {
    try {
      return JSON.parse(d.tariff_slots ?? "[]")
    } catch {
      return []
    }
  })()
  return {
    term_years: d.term_years != null ? String(d.term_years) : "",
    signing_date: d.signed_at?.split("T")[0] ?? "",
    billing_frequency: d.billing_frequency ?? "",
    tariff_periods: d.tariff_periods != null ? String(d.tariff_periods) : "",
    tariff_indexed_rule_type: d.tariff_indexed_rule_type ?? "",
    commissioning_date: d.commissioned_at?.split("T")[0] ?? "",
    implementation_period:
      d.implementation_period != null ? String(d.implementation_period) : "",
    client_email: "",
    grid_meter_reading:
      d.grid_meter_reading_at_commissioning != null
        ? String(d.grid_meter_reading_at_commissioning)
        : "",
    system_size_kwp: d.system_size_kwp != null ? String(d.system_size_kwp) : "",
    guaranteed_production:
      d.guaranteed_production_kwh_per_kwp != null
        ? String(d.guaranteed_production_kwh_per_kwp)
        : "",
    equipment_lease: d.equipment_lease_amount ?? "",
    maintenance: d.maintenance_amount ?? "",
    solar_production_month: "",
    estimated_utility:
      d.estimated_utility != null ? String(d.estimated_utility) : "",
    monthly_baseline_consumption:
      d.monthly_baseline_consumption_kwh != null
        ? String(d.monthly_baseline_consumption_kwh)
        : "",
    minimum_consumption_monthly:
      d.minimum_consumption_monthly_kwh != null
        ? String(d.minimum_consumption_monthly_kwh)
        : "",
    minimum_spend: d.minimum_spend != null ? String(d.minimum_spend) : "",
    actual_commissioned_at: d.actual_commissioned_at?.split("T")[0] ?? "",
    actual_end_at: d.actual_end_at?.split("T")[0] ?? "",
    tariffs: slots.map((t) => ({
      period_number: String(t.period_number),
      slot: t.slot,
      slot_type: t.slot_type,
      rate: String(t.rate),
      time_start: t.start_time ?? "",
      time_end: t.end_time ?? "",
    })),
  }
}
