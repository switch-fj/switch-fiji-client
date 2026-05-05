import { z } from "zod"
import { EnumContractType, EnumContractSystemMode } from "@/constants/mangle"

export const CreateSiteSchema = z.object({
  client_uid: z.string().uuid("Invalid client UID"),
  site_name: z.string().min(1, "Site name is required"),
})

export type CreateSiteInput = z.infer<typeof CreateSiteSchema>

export const CreateContractSchema = z.object({
  client_uid: z.string().uuid(),
  site_uid: z.string().uuid(),
  contract_type: z.nativeEnum(EnumContractType, {
    message: "Please select a contract type.",
  }),
  system_mode: z.nativeEnum(EnumContractSystemMode, {
    message: "Please select a system mode.",
  }),
  currency: z.enum(["USD", "FJD", "AUD", "NZD"], {
    message: "Please select a currency.",
  }),
  timezone: z.string().min(1, "Please select a timezone."),
})

export type CreateContractInput = z.infer<typeof CreateContractSchema>

export type TariffRowPayload = {
  period_number: number
  slot: string
  slot_type: string
  rate: number
}

export type ContractDetailsPayload = {
  term_years?: number
  signed_at?: string
  billing_frequency?: string
  commissioned_at?: string
  end_at?: string
  actual_commissioned_at?: string
  actual_end_at?: string
  implementation_period?: number
  system_size_kwp?: number
  guaranteed_production_kwh_per_kwp?: number
  grid_meter_reading_at_commissioning?: number
  equipment_lease_amount?: number
  maintenance_amount?: number
  total?: number
  monthly_baseline_consumption_kwh?: number
  minimum_consumption_monthly_kwh?: number
  minimum_spend?: number
  estimated_utility?: number
  tariff_periods?: number
  tariff_indexed_rule_type?: string
  tariffs?: TariffRowPayload[]
}

export type ContractModel = {
  uid: string
  created_at: string
  updated_at: string
  user_uid: string
  client_uid: string
  site_uid: string
  contract_ref: string
  contract_type: EnumContractType
  system_mode: EnumContractSystemMode
  currency: string
}

export type TariffRespModel = {
  period_number: number
  slot: string
  slot_type: string
  rate: number
  start_time: string | null
  end_time: string | null
}

export type ContractDetailsRespModel = {
  uid: string
  created_at: string
  updated_at: string
  contract_uid: string
  status: string
  term_years: number | null
  billing_frequency: string | null
  implementation_period: number | null
  signed_at: string | null
  commissioned_at: string | null
  end_at: string | null
  actual_commissioned_at: string | null
  actual_end_at: string | null
  system_size_kwp: number | null
  guaranteed_production_kwh_per_kwp: number | null
  grid_meter_reading_at_commissioning: number | null
  equipment_lease_amount: string | null
  maintenance_amount: string | null
  total: string | null
  monthly_baseline_consumption_kwh: number | null
  minimum_consumption_monthly_kwh: number | null
  minimum_spend: number | null
  estimated_utility: number | null
  tariff_periods: number | null
  tariff_slots: string | null
  tariff_indexed_rule_type: string | null
}

export type ContractDetailedRespModel = {
  uid: string
  created_at: string
  updated_at: string
  user_uid: string
  client_uid: string
  site_uid: string
  contract_ref: string
  contract_type: EnumContractType
  system_mode: EnumContractSystemMode
  currency: string
  details: ContractDetailsRespModel | null
}

export type SiteModel = {
  uid: string
  created_at: string
  updated_at: string
  client_uid: string
  site_id: string | null
  site_name: string | null
  gateway_id: string | null
  firmware: string | null
  contract: ContractModel | null
}

export type SiteStats = {
  power_kw?: number | null
  energy_today_kwh?: number | null
  energy_month_kwh?: number | null
  energy_total_kwh?: number | null
  voltage?: number | null
  current?: number | null
  frequency?: number | null
  state_of_charge?: number | null
  grid_power?: number | null
  status?: string | null
  [key: string]: string | number | null | undefined
}

export type ContractDetailsSheetProps = {
  open: boolean
  onClose: () => void
  clientUid: string
  contractUid: string
  contractType: EnumContractType
  systemMode: EnumContractSystemMode
  currency: string
  clientName: string
  siteName: string | null
  existingDetails?: ContractDetailsRespModel
}
