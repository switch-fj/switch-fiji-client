import { useStore } from "@/store"
import {
  fmtDate,
  fmtMonthYear,
  fmtDateTime,
  fmtPeriodDate,
} from "@/utils/invoice"

export function useInvoiceFormatters() {
  const { SettingsStore } = useStore()
  const dateFmt = (SettingsStore.settings?.date_format ?? "dmy") as
    | "dmy"
    | "mdy"
  const timeFmt = (SettingsStore.settings?.time_format ?? "24") as "12" | "24"

  return {
    fmtDate: (iso: string) => fmtDate(iso, dateFmt),
    fmtPeriodDate: (iso: string) => fmtPeriodDate(iso, dateFmt),
    fmtMonthYear: (iso: string) => fmtMonthYear(iso, dateFmt),
    fmtDateTime: (iso: string) => fmtDateTime(iso, dateFmt, timeFmt),
    // date-fns format string and matching placeholder for DatePickerInput
    datePickerFormat: dateFmt === "mdy" ? "MM/dd/yyyy" : "dd/MM/yyyy",
    datePickerPlaceholder: dateFmt === "mdy" ? "12/25/2025" : "25/12/2025",
  }
}
