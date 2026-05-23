export const toUtcIso = (dateStr: string): string => `${dateStr}T00:00:00Z`

const SYSTEM_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone
const TZ_OVERRIDE_KEY = "tz_override"

export function localTimezone(): string {
  if (typeof window === "undefined") return SYSTEM_TZ
  return localStorage.getItem(TZ_OVERRIDE_KEY) || SYSTEM_TZ
}

export function setTimezoneOverride(tz: string | null) {
  if (typeof window === "undefined") return
  if (tz) {
    localStorage.setItem(TZ_OVERRIDE_KEY, tz)
  } else {
    localStorage.removeItem(TZ_OVERRIDE_KEY)
  }
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

export function toLocalTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: localTimezone(),
  })
}

export const TZ_TEST_OPTIONS = [
  { label: "System (detected)", value: "" },
  { label: "Fiji (UTC+12)", value: "Pacific/Fiji" },
  { label: "Tokyo (UTC+9)", value: "Asia/Tokyo" },
  { label: "London (UTC+0/+1)", value: "Europe/London" },
  { label: "New York (UTC-5/-4)", value: "America/New_York" },
  { label: "Los Angeles (UTC-8/-7)", value: "America/Los_Angeles" },
  { label: "UTC", value: "UTC" },
]
