import type { InvoiceHistoryRespModel } from "@/types/invoice"

type DateFmt = "dmy" | "mdy"
type TimeFmt = "12" | "24"

export function fmtDate(iso: string, dateFmt: DateFmt = "dmy") {
  const locale = dateFmt === "mdy" ? "en-US" : "en-GB"
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function fmtMonthYear(iso: string, dateFmt: DateFmt = "dmy") {
  const locale = dateFmt === "mdy" ? "en-US" : "en-GB"
  return new Date(iso).toLocaleDateString(locale, {
    month: "short",
    year: "numeric",
  })
}

export function fmtDateTime(
  iso: string,
  dateFmt: DateFmt = "dmy",
  timeFmt: TimeFmt = "24"
) {
  const locale = dateFmt === "mdy" ? "en-US" : "en-GB"
  return new Date(iso).toLocaleString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: timeFmt === "12",
  })
}

export function fmtAmount(value: string | number) {
  return `$${parseFloat(String(value)).toFixed(4)}`
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
