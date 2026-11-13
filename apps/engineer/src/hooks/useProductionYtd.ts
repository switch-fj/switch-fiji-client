"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getProductionYtd } from "@/requests/productionYtd"
import { siteToday } from "@/utils/production"

export const PRODUCTION_YTD_KEYS = {
  all: ["production-ytd"] as const,
  site: (siteUid: string) => ["production-ytd", siteUid] as const,
}

/** While days are still calculating, ask again every few seconds… */
const POLL_MS = 3_000
/** …but give up after this long and let the user check again. */
const POLL_BUDGET_MS = 60_000

export type YtdErrorKind = "not-found" | "forbidden" | "bad-request" | "other"

function errorKind(err: unknown): YtdErrorKind | null {
  if (!err) return null
  const status = (err as { status?: number }).status
  if (status === 404) return "not-found"
  if (status === 403) return "forbidden"
  if (status === 400) return "bad-request"
  return "other"
}

/**
 * Year-to-date production for one site.
 *
 * Each request can queue up to 31 more days for calculation, so while the
 * backend says `needs_polling` we re-request every 3s (React Query never
 * overlaps them). Polling stops when the work is done, when the backend
 * reports a dispatch failure, or after 60s — partial results stay on screen
 * either way, and `checkAgain()` restarts the budget.
 */
export function useProductionYtd(siteUid: string) {
  const queryClient = useQueryClient()
  const pollStarted = useRef(Date.now())
  const [timedOut, setTimedOut] = useState(false)

  // Fresh budget whenever the site changes.
  useEffect(() => {
    pollStarted.current = Date.now()
    setTimedOut(false)
  }, [siteUid])

  const query = useQuery({
    queryKey: PRODUCTION_YTD_KEYS.site(siteUid),
    queryFn: ({ signal }) => getProductionYtd(siteUid, signal),
    retry: (count, err) => errorKind(err) === "other" && count < 2,
    refetchInterval: (q) => {
      const d = q.state.data?.data
      if (!d || !d.needs_polling || d.dispatch_failed) return false
      if (Date.now() - pollStarted.current >= POLL_BUDGET_MS) return false
      return POLL_MS
    },
  })

  // Guard against a response for a different site ever being shown.
  const raw = query.data?.data
  const data = raw && raw.site_uid === siteUid ? raw : undefined
  const polling = !!data?.needs_polling && !data.dispatch_failed

  // Flag the timeout so the UI can say "still calculating — check again".
  useEffect(() => {
    if (!polling || timedOut) return
    const left = POLL_BUDGET_MS - (Date.now() - pollStarted.current)
    const t = setTimeout(() => setTimedOut(true), Math.max(0, left))
    return () => clearTimeout(t)
  }, [polling, timedOut])

  // The report always covers "1 Jan → yesterday" in the site's timezone, so
  // refetch when the site's date rolls over (incl. new year).
  const timezone = data?.timezone
  useEffect(() => {
    if (!timezone) return
    let day = siteToday(new Date(), timezone)
    const t = setInterval(() => {
      const now = siteToday(new Date(), timezone)
      if (now !== day) {
        day = now
        queryClient.invalidateQueries({
          queryKey: PRODUCTION_YTD_KEYS.site(siteUid),
        })
      }
    }, 60_000)
    return () => clearInterval(t)
  }, [timezone, siteUid, queryClient])

  const checkAgain = () => {
    pollStarted.current = Date.now()
    setTimedOut(false)
    return query.refetch()
  }

  return {
    data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    errorKind: errorKind(query.error),
    /** Background calculation is still running and we're still asking. */
    isPolling: polling && !timedOut,
    /** We stopped asking while days were still calculating. */
    timedOut: polling && timedOut,
    checkAgain,
  }
}
