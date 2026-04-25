export type InvoiceHistorySummary = {
  uid: string
  invoice_ref: string
  period_start_at: string
  period_end_at: string
  subtotal: string
  vat_rate: string
  energy_mix: string | null
}

export type InvoiceHistoryRespModel = {
  uid: string
  invoice_uid: string
  sent_to: string
  sent_at: string
  was_successful: boolean
  failure_reason: string | null
  invoice: InvoiceHistorySummary
}

export type InvoiceLineItemRespModel = {
  uid: string
  description: string
  energy_kwh: string | null
  tariff_rate: string | null
  tariff_period: number | null
  tariff_slot: string | null
  amount: string
}

export type InvoiceMeterDataRespModel = {
  uid: string
  label: string
  period_start_reading: string
  period_end_reading: string
  vat_amount: string
  total: string
}

export type InvoiceRespModel = {
  uid: string
  invoice_ref: string
  period_start_at: string
  period_end_at: string
  subtotal: string
  vat_rate: string
  energy_mix: string | null
  line_items: InvoiceLineItemRespModel[]
  meter_data: InvoiceMeterDataRespModel[]
  history: InvoiceHistoryRespModel[]
}

export type OffsetPagination = {
  total: number
  current_page: number
  limit: number
  total_pages: number
}

export type InvoiceHistoryPage = {
  items: InvoiceHistoryRespModel[]
  pagination: OffsetPagination
}
