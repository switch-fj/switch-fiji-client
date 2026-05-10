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
  const token = defaultAuthStorage.getToken()
  const baseUrl = getApiBaseUrl().replace(/\/api\/v1\/?$/, "")

  const run = async () => {
    try {
      const response = await fetch(`${baseUrl}${SITE.STATS_STREAM(siteUid)}`, {
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

      const reader = response
        .body!.pipeThrough(new TextDecoderStream())
        .getReader()
      let buf = ""

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buf += value
        const lines = buf.split("\n")
        buf = lines.pop() ?? ""
        for (const line of lines)
          if (line.startsWith("data:"))
            try {
              onData(JSON.parse(line.slice(5).trim()))
            } catch {}
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") onError()
    }
  }

  run()
  return () => controller.abort()
}
