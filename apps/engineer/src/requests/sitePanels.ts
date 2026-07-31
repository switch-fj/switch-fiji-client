import api from "@/lib/axios"
import { SITE, DEVICE } from "@/constants/api"
import type {
  SitePanelRef,
  PanelRefItemInput,
  UpdatePanelRefItemInput,
  SiteStringWiring,
  StringWiringItemInput,
  SiteDeviceModel,
} from "@/types/engineer"
import type { ServerResponse } from "@workspace/api"

export const getSitePanels = async (
  siteUid: string
): Promise<ServerResponse<SitePanelRef[]>> => {
  const { data } = await api.get<ServerResponse<SitePanelRef[]>>(
    SITE.PANELS(siteUid)
  )
  return data
}

export const createSitePanels = async (
  siteUid: string,
  refs: PanelRefItemInput[]
): Promise<ServerResponse<boolean>> => {
  const { data } = await api.post<ServerResponse<boolean>>(
    SITE.PANELS(siteUid),
    { refs }
  )
  return data
}

export const editSitePanels = async (
  siteUid: string,
  refs: UpdatePanelRefItemInput[]
): Promise<ServerResponse<boolean>> => {
  const { data } = await api.put<ServerResponse<boolean>>(
    SITE.PANELS(siteUid),
    { refs }
  )
  return data
}

export const getSiteStringWiring = async (
  siteUid: string
): Promise<ServerResponse<SiteStringWiring | null>> => {
  const { data } = await api.get<ServerResponse<SiteStringWiring | null>>(
    SITE.STRING_WIRING(siteUid)
  )
  return data
}

export const createSiteStringWiring = async (
  siteUid: string,
  strings: StringWiringItemInput[]
): Promise<ServerResponse<SiteStringWiring>> => {
  const { data } = await api.post<ServerResponse<SiteStringWiring>>(
    SITE.STRING_WIRING(siteUid),
    { strings }
  )
  return data
}

/** Same endpoint as create — the site's wiring is a single record, and this
 * PUT fully replaces it. */
export const editSiteStringWiring = async (
  siteUid: string,
  strings: StringWiringItemInput[]
): Promise<ServerResponse<SiteStringWiring>> => {
  const { data } = await api.put<ServerResponse<SiteStringWiring>>(
    SITE.STRING_WIRING(siteUid),
    { strings }
  )
  return data
}

export const getSiteDevices = async (
  siteUid: string
): Promise<ServerResponse<SiteDeviceModel[]>> => {
  const { data } = await api.get<ServerResponse<SiteDeviceModel[]>>(
    DEVICE.BY_SITE(siteUid)
  )
  return data
}
