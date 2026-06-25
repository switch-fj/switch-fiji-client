const SYSTEM_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone
const TZ_OVERRIDE_KEY = "tz_override"

export function localTimezone(): string {
  if (typeof window === "undefined") return SYSTEM_TZ
  return localStorage.getItem(TZ_OVERRIDE_KEY) || SYSTEM_TZ
}

export function toLocalDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: localTimezone(),
  })
}

export function toLocalDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: localTimezone(),
  })
}
