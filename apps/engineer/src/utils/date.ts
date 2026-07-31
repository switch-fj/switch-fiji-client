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

/**
 * For date-only fields (e.g. a commissioning date) transported as an ISO
 * datetime string. Reads the Y-M-D straight off the string and builds a
 * local-midnight Date, so the calendar day never shifts based on the
 * viewer's timezone offset (unlike `new Date(iso)`, which anchors to a UTC
 * instant and can roll the displayed day backward or forward).
 */
export function isoDateOnlyToLocalDate(iso: string): Date {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number)
  return new Date(year, month - 1, day)
}

/** Inverse of `isoDateOnlyToLocalDate`: serializes a local Date's calendar
 * day back to an ISO string without going through `toISOString()`, which
 * would convert through UTC and can shift the date by a day. */
export function localDateToIsoDateOnly(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}T00:00:00.000Z`
}

export function formatIsoDateOnly(iso: string): string {
  return isoDateOnlyToLocalDate(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
