export type InvoiceLineItem = {
  item: string
  energy_kwh: number
  tariff: number
  amount: number
}

export type MeterDataRow = {
  name: string
  period_start: number
  period_end: number
  usage: number
}

export type InvoiceStatus = "paid" | "pending" | "overdue"

export type InvoiceHistoryItem = {
  uid: string
  invoice_number: string
  period_label: string
  status: InvoiceStatus
}

export type InvoiceModel = {
  uid: string
  invoice_number: string
  date_start: string
  date_end: string
  line_items: InvoiceLineItem[]
  sub_total: number
  vat: number
  total: number
  meter_data: MeterDataRow[]
  billing_email: string
  sent_to: string | null
  sent_at: string | null
}
