export const toUtcIso = (dateStr: string): string => `${dateStr}T00:00:00Z`

const LOCAL_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone

export function toLocalDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: LOCAL_TZ,
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
    timeZone: LOCAL_TZ,
  })
}

export function toLocalTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: LOCAL_TZ,
  })
}

export function localTimezone(): string {
  return LOCAL_TZ
}
