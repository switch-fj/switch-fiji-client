import { useStore } from "@/store"
import { fmtDate, fmtMonthYear, fmtDateTime } from "@/utils/invoice"

export function useInvoiceFormatters() {
  const { SettingsStore } = useStore()
  const dateFmt = (SettingsStore.settings?.date_format ?? "dmy") as
    | "dmy"
    | "mdy"
  const timeFmt = (SettingsStore.settings?.time_format ?? "24") as "12" | "24"

  return {
    fmtDate: (iso: string) => fmtDate(iso, dateFmt),
    fmtMonthYear: (iso: string) => fmtMonthYear(iso, dateFmt),
    fmtDateTime: (iso: string) => fmtDateTime(iso, dateFmt, timeFmt),
  }
}
