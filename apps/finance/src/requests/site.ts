import api from "@/lib/axios"
import { SITE } from "@/constants/api"
import type { CreateSiteInput, SiteModel } from "@/types/site"
import type { ServerResponse } from "@/types/client"

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
