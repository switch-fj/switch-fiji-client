import api from "@/lib/axios"
import { SITE } from "@/constants/api"
import type { CreateSiteInput, SiteModel, SiteStats } from "@/types/site"
import type { ServerResponse } from "@/types/client"
import { defaultAuthStorage, getApiBaseUrl } from "@workspace/api"

export type { CreateSiteInput } from "@/types/site"

export const getSites = async (
  clientUid: string
): Promise<ServerResponse<SiteModel[]>> => {
  const { data } = await api.get<ServerResponse<SiteModel[]>>(
    SITE.LIST(clientUid)
  )
  return data
}

export const addSite = async (
  payload: CreateSiteInput
): Promise<ServerResponse<string>> => {
  const { data } = await api.post<ServerResponse<string>>(SITE.ADD, payload)
  return data
}

export const streamSiteStats = (
  siteUid: string,
  onData: (stats: SiteStats) => void,
  onError: () => void
): (() => void) => {
  const controller = new AbortController()

  const run = async () => {
    try {
      const token = defaultAuthStorage.getToken()
      const url = `${getApiBaseUrl()}${SITE.STATS_STREAM(siteUid)}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        },
        signal: controller.signal,
      })

      if (!response.ok) {
        onError()
        return
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })

        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.slice(6))
              onData(parsed)
            } catch {}
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") onError()
    }
  }

  run()

  // Return a cleanup function (replaces .close() from EventSource)
  return () => controller.abort()
}
