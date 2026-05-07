import { z } from "zod"

export type EFLRateHistoryRespModel = {
  uid: string
  created_at: string
  contract_settings_uid: string
  efl_standard_rate_kwh: string | null
  effective_from: string
  effective_to: string | null
  created_by_uid: string | null
}

export type VATRateHistoryRespModel = {
  uid: string
  created_at: string
  contract_settings_uid: string
  vat_rate: number | null
  effective_from: string
  effective_to: string | null
  created_by_uid: string | null
}

export type ContractSettingsRespModel = {
  vat_rate: number
  efl_standard_rate_kwh: string
  primary_currency: string
  asset_performance: boolean
  invoice_generated: boolean
  invoice_emailed: boolean
  time_format: string
  date_format: string
}

export const ContractSettingsSchema = z.object({
  vat_rate: z.string().min(1, "VAT rate is required"),
  efl_standard_rate_kwh: z.string().min(1, "EFL standard rate is required"),
  primary_currency: z.string().min(1, "Primary currency is required"),
  asset_performance: z.boolean(),
  invoice_generated: z.boolean(),
  invoice_emailed: z.boolean(),
  time_format: z.string().min(1, "Time format is required"),
  date_format: z.enum(["dmy", "mdy"], { message: "Date format is required" }),
})

export type ContractSettingsInput = z.infer<typeof ContractSettingsSchema>

export type ContractSettingsUpdateInput = Partial<ContractSettingsInput>
