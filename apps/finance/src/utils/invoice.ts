import type { InvoiceHistoryRespModel } from "@/types/invoice"

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function fmtMonthYear(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  })
}

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export function fmtAmount(value: string | number) {
  return `$${parseFloat(String(value)).toFixed(2)}`
}

export function uniqueByInvoiceUid(
  items: InvoiceHistoryRespModel[]
): InvoiceHistoryRespModel[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.invoice_uid)) return false
    seen.add(item.invoice_uid)
    return true
  })
}
