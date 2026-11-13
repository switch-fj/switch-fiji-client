"use client"

import { useSyncExternalStore } from "react"

/**
 * Remembers each site's timezone, learned from production responses (the
 * engineer site list doesn't include it). Kept in localStorage so later
 * visits ask for the right dates straight away.
 */

const STORAGE_KEY = "engineer.siteTimezones"
const EMPTY: Record<string, string> = {}

let zones: Record<string, string> = load()
const listeners = new Set<() => void>()

function load(): Record<string, string> {
  if (typeof window === "undefined") return EMPTY
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

function isValidZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz })
    return true
  } catch {
    return false
  }
}

export function rememberSiteTimezone(siteUid: string, tz?: string | null) {
  if (!tz || zones[siteUid] === tz || !isValidZone(tz)) return
  zones = { ...zones, [siteUid]: tz }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(zones))
  } catch {
    // Storage unavailable — keep it in memory for this session.
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Known timezones by site uid; re-renders when a new one is learned. */
export function useSiteTimezones(): Record<string, string> {
  return useSyncExternalStore(
    subscribe,
    () => zones,
    () => EMPTY
  )
}

/** One site's timezone, or null while it's unknown. */
export function useSiteTimezone(siteUid: string): string | null {
  return useSiteTimezones()[siteUid] ?? null
}
