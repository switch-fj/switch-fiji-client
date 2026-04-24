import {
  EnumContractType,
  EnumContractSystemMode,
  EnumContractBillingFrequency,
} from "./mangle"

export type Combo = "ppa_off_grid" | "ppa_on_grid" | "lease_on_grid"

export function getCombo(
  contractType: EnumContractType,
  systemMode: EnumContractSystemMode
): Combo | null {
  if (
    contractType === EnumContractType.PPA &&
    systemMode === EnumContractSystemMode.OFF_GRID
  )
    return "ppa_off_grid"
  if (
    contractType === EnumContractType.PPA &&
    systemMode === EnumContractSystemMode.ON_GRID
  )
    return "ppa_on_grid"
  if (
    contractType === EnumContractType.LEASE &&
    systemMode === EnumContractSystemMode.ON_GRID
  )
    return "lease_on_grid"
  return null
}

export const VIS = {
  term_years: { ppa_off_grid: true, ppa_on_grid: true, lease_on_grid: true },
  signing_date: { ppa_off_grid: true, ppa_on_grid: true, lease_on_grid: true },
  billing_frequency: {
    ppa_off_grid: true,
    ppa_on_grid: true,
    lease_on_grid: true,
  },
  tariff_periods: {
    ppa_off_grid: true,
    ppa_on_grid: true,
    lease_on_grid: false,
  },
  commissioning_date: {
    ppa_off_grid: true,
    ppa_on_grid: true,
    lease_on_grid: true,
  },
  contract_end: { ppa_off_grid: true, ppa_on_grid: true, lease_on_grid: true },
  implementation_period: {
    ppa_off_grid: true,
    ppa_on_grid: true,
    lease_on_grid: true,
  },
  client_email: {
    ppa_off_grid: false,
    ppa_on_grid: false,
    lease_on_grid: false,
  },
  grid_meter_reading: {
    ppa_off_grid: false,
    ppa_on_grid: true,
    lease_on_grid: true,
  },
  system_size_kwp: {
    ppa_off_grid: false,
    ppa_on_grid: true,
    lease_on_grid: false,
  },
  guaranteed_production: {
    ppa_off_grid: false,
    ppa_on_grid: true,
    lease_on_grid: true,
  },
  equipment_lease: {
    ppa_off_grid: false,
    ppa_on_grid: false,
    lease_on_grid: true,
  },
  maintenance: { ppa_off_grid: false, ppa_on_grid: false, lease_on_grid: true },
  total: { ppa_off_grid: false, ppa_on_grid: false, lease_on_grid: true },
  solar_production_month: {
    ppa_off_grid: false,
    ppa_on_grid: false,
    lease_on_grid: true,
  },
  estimated_utility: {
    ppa_off_grid: true,
    ppa_on_grid: true,
    lease_on_grid: true,
  },
  monthly_baseline_consumption: {
    ppa_off_grid: true,
    ppa_on_grid: true,
    lease_on_grid: false,
  },
  minimum_consumption_monthly: {
    ppa_off_grid: true,
    ppa_on_grid: true,
    lease_on_grid: false,
  },
  minimum_spend: {
    ppa_off_grid: true,
    ppa_on_grid: true,
    lease_on_grid: false,
  },
  tariffs_table: {
    ppa_off_grid: true,
    ppa_on_grid: true,
    lease_on_grid: false,
  },
} satisfies Record<string, Record<Combo, boolean>>

export const BILLING_FREQUENCY_OPTIONS = Object.values(
  EnumContractBillingFrequency
).map((v) => ({
  label: v.charAt(0).toUpperCase() + v.slice(1),
  value: v,
}))

export const TARIFF_PERIOD_OPTIONS = [
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
]

export const IMPLEMENTATION_PERIOD_OPTIONS = [
  { label: "1 Month", value: "1" },
  { label: "3 Months", value: "3" },
  { label: "6 Months", value: "6" },
  { label: "12 Months", value: "12" },
]

export const TARIFF_SLOT_TYPE_OPTIONS = [
  { label: "Fixed", value: "Fixed" },
  { label: "Variable", value: "Variable" },
]
