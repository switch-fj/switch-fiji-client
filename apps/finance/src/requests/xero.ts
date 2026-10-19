import api from "@/lib/axios"
import { XERO } from "@/constants/api"
import type { ServerResponse } from "@/types/client"
import type {
  XeroSettingsModel,
  XeroTaxMappingInput,
  XeroTaxMappingModel,
} from "@/types/xero"

export const getXeroSettings = async (): Promise<
  ServerResponse<XeroSettingsModel>
> => {
  const { data } = await api.get<ServerResponse<XeroSettingsModel>>(
    XERO.SETTINGS
  )
  return data
}

export const updateXeroSettings = async (
  payload: XeroSettingsModel
): Promise<ServerResponse<XeroSettingsModel>> => {
  const { data } = await api.put<ServerResponse<XeroSettingsModel>>(
    XERO.SETTINGS,
    payload
  )
  return data
}

export const getXeroTaxMappings = async (): Promise<
  ServerResponse<XeroTaxMappingModel[]>
> => {
  const { data } = await api.get<ServerResponse<XeroTaxMappingModel[]>>(
    XERO.TAX_MAPPINGS
  )
  return data
}

export const setXeroTaxMapping = async (
  payload: XeroTaxMappingInput
): Promise<ServerResponse<XeroTaxMappingModel>> => {
  const { data } = await api.put<ServerResponse<XeroTaxMappingModel>>(
    XERO.TAX_MAPPINGS,
    payload
  )
  return data
}
