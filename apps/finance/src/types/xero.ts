import { z } from "zod"

export type XeroSettingsModel = {
  sales_account_code: string | null
  tax_reporting_type: string | null
  invoice_status: "DRAFT"
  create_invoices_enabled: boolean
}

export type XeroTaxMappingModel = {
  vat_rate: string
  reporting_type: string
  xero_tax_type: string | null
  is_explicit: boolean
}

export type XeroTaxMappingInput = {
  vat_rate: string
  xero_tax_type: string
}

export const XeroSettingsSchema = z.object({
  create_invoices_enabled: z.boolean(),
  sales_account_code: z
    .string()
    .trim()
    .max(10, "Max 10 characters")
    .regex(/^\S*$/, "No spaces allowed"),
  tax_reporting_type: z
    .string()
    .trim()
    .max(50, "Max 50 characters")
    .regex(/^[A-Z0-9_]*$/, "Use uppercase letters, digits and _ only"),
})

export type XeroSettingsInput = z.infer<typeof XeroSettingsSchema>

export const XeroTaxMappingSchema = z.object({
  vat_rate: z
    .string()
    .trim()
    .min(1, "VAT rate is required")
    .regex(/^\d+(\.\d{1,4})?$/, "Up to 4 decimal places")
    .refine((v) => Number(v) <= 100, "Must be between 0 and 100"),
  xero_tax_type: z
    .string()
    .trim()
    .min(1, "Xero tax type is required")
    .max(50, "Max 50 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Letters, digits, _ and - only"),
})
