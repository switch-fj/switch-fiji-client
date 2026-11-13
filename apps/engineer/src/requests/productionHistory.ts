import api from "@/lib/axios"
import { SITE } from "@/constants/api"
import type { ProductionHistory } from "@/types/engineer"
import type { ServerResponse } from "@workspace/api"
import { rememberSiteTimezone } from "@/utils/siteTimezone"
import { rangeLength, shiftDate } from "@/utils/production"

/** Longest range one production-history request accepts. Longer ranges are
 * split into chunks and merged. */
export const MAX_HISTORY_DAYS = 31

type HistoryParams = { from_date: string; to_date: string; refresh?: boolean }

const fetchOne = async (siteUid: string, params: HistoryParams) => {
  const { data } = await api.get<ServerResponse<ProductionHistory>>(
    SITE.PRODUCTION_HISTORY(siteUid),
    { params }
  )
  rememberSiteTimezone(siteUid, data.data?.timezone)
  return data
}

export const getProductionHistory = async (
  siteUid: string,
  params: HistoryParams
): Promise<ServerResponse<ProductionHistory>> => {
  const range = { from: params.from_date, to: params.to_date }
  if (rangeLength(range) <= MAX_HISTORY_DAYS) return fetchOne(siteUid, params)

  // Split into ≤31-day chunks, oldest first, fetched in parallel.
  const chunks: HistoryParams[] = []
  for (let from = range.from; from <= range.to; ) {
    const end = shiftDate(from, MAX_HISTORY_DAYS - 1)
    const to = end < range.to ? end : range.to
    chunks.push({ ...params, from_date: from, to_date: to })
    from = shiftDate(to, 1)
  }
  const parts = await Promise.all(chunks.map((c) => fetchOne(siteUid, c)))

  const byDate = new Map(
    parts
      .flatMap((p) => p.data.items)
      .map((item) => [item.date_at.slice(0, 10), item] as const)
  )
  const last = parts[parts.length - 1]
  return {
    ...last,
    data: {
      ...last.data,
      from_date: params.from_date,
      to_date: params.to_date,
      items: [...byDate.values()].sort((a, b) =>
        a.date_at.localeCompare(b.date_at)
      ),
    },
  }
}
