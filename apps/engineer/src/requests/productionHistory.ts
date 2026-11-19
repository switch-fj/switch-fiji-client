import api from "@/lib/axios"
import { SITE } from "@/constants/api"
import type {
  DeviceProductionDaily,
  DeviceProductionGroup,
  DeviceProductionTotals,
  ProductionDay,
  ProductionHistory,
} from "@/types/engineer"
import type { ServerResponse } from "@workspace/api"
import { rememberSiteTimezone } from "@/utils/siteTimezone"
import { rangeLength, splitRange } from "@/utils/production"

/** Longest range one daily production-history request accepts. Longer
 * ranges are split into chunks, fetched in parallel and merged. */
export const MAX_HISTORY_DAYS = 31

type DateParams = { from_date: string; to_date: string }

/** Fetches `params` as one request, or in ≤31-day chunks merged by date. */
async function fetchDaily<T extends { items: ProductionDay[] }>(
  params: DateParams,
  fetchOne: (p: DateParams) => Promise<ServerResponse<T>>
): Promise<ServerResponse<T>> {
  const range = { from: params.from_date, to: params.to_date }
  if (rangeLength(range) <= MAX_HISTORY_DAYS) return fetchOne(params)

  const parts = await Promise.all(
    splitRange(range, MAX_HISTORY_DAYS).map((r) =>
      fetchOne({ ...params, from_date: r.from, to_date: r.to })
    )
  )
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

export const getProductionHistory = (
  siteUid: string,
  params: DateParams & { refresh?: boolean }
): Promise<ServerResponse<ProductionHistory>> =>
  fetchDaily(params, async (p) => {
    const { data } = await api.get<ServerResponse<ProductionHistory>>(
      SITE.PRODUCTION_HISTORY(siteUid),
      { params: { ...p, refresh: params.refresh } }
    )
    rememberSiteTimezone(siteUid, data.data?.timezone)
    return data
  })

/** Daily rows for one device (chunked like the site history). */
export const getDeviceProductionDaily = (
  siteUid: string,
  deviceUid: string,
  params: DateParams
): Promise<ServerResponse<DeviceProductionDaily>> =>
  fetchDaily(params, async (p) => {
    const { data } = await api.get<ServerResponse<DeviceProductionDaily>>(
      SITE.DEVICE_PRODUCTION_HISTORY(siteUid, deviceUid),
      { params: { ...p, group_by: "day" } }
    )
    rememberSiteTimezone(siteUid, data.data?.timezone)
    return data
  })

/** Week or month totals for one device. Not chunked — a chunk boundary
 * would split a period's total in two. */
export const getDeviceProductionTotals = async (
  siteUid: string,
  deviceUid: string,
  params: DateParams & { group_by: Exclude<DeviceProductionGroup, "day"> }
): Promise<ServerResponse<DeviceProductionTotals>> => {
  const { data } = await api.get<ServerResponse<DeviceProductionTotals>>(
    SITE.DEVICE_PRODUCTION_HISTORY(siteUid, deviceUid),
    { params }
  )
  rememberSiteTimezone(siteUid, data.data?.timezone)
  return data
}
