"use client"

import { useEffect, useState } from "react"
import { getApiBaseUrl } from "@workspace/api"
import { FLOW_GRAPH } from "@/constants/api"

export type FlowGraphEvent = {
  status: string
  site_uid: string
  graph: {
    solar: number
    battery: number
    /** Signed power flow — negative while charging, positive while
     * discharging (or vice versa); `battery` is the plain magnitude. */
    battery_flow: number
    grid: number
    consumption: number
    aux_loads: number
    micro_inv: number
    /** Per-bank state of charge, e.g. `{ battery_soc: 68, battery_soc2: 68 }`. */
    soc: Record<string, number>
  }
  last_seen: string | null
}

export type FlowGraphStreamStatus = "connecting" | "open" | "error"

export function useFlowGraphStream(siteUid: string | null) {
  const [data, setData] = useState<FlowGraphEvent | null>(null)
  const [status, setStatus] = useState<FlowGraphStreamStatus>("connecting")

  useEffect(() => {
    if (!siteUid) return

    setData(null)
    setStatus("connecting")

    const baseURL = getApiBaseUrl().replace(/\/api\/v1\/?$/, "")
    const source = new EventSource(`${baseURL}${FLOW_GRAPH.STREAM(siteUid)}`)

    source.onopen = () => setStatus("open")
    source.onmessage = (event) => {
      try {
        const parsed: unknown = JSON.parse(event.data)
        if (parsed && typeof parsed === "object" && "graph" in parsed) {
          setData(parsed as FlowGraphEvent)
        }
      } catch {
        // ignore malformed frames
      }
    }
    source.onerror = () => setStatus("error")

    return () => source.close()
  }, [siteUid])

  return { data, status }
}
