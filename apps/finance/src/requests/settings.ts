import api from "@/lib/axios"
import { SETTINGS } from "@/constants/api"
import type { ServerResponse } from "@/types/client"
import type {
  ContractSettingsRespModel,
  ContractSettingsUpdateInput,
  EFLRateHistoryRespModel,
  VATRateHistoryRespModel,
} from "@/types/settings"

export const getContractSettings = async (): Promise<
  ServerResponse<ContractSettingsRespModel>
> => {
  const { data } = await api.get<ServerResponse<ContractSettingsRespModel>>(
    SETTINGS.GET
  )
  return data
}

export const updateContractSettings = async (
  payload: ContractSettingsUpdateInput
): Promise<ServerResponse<ContractSettingsRespModel>> => {
  const { data } = await api.patch<ServerResponse<ContractSettingsRespModel>>(
    SETTINGS.UPDATE,
    payload
  )
  return data
}

export const getEFLRateHistory = async (): Promise<
  ServerResponse<EFLRateHistoryRespModel[]>
> => {
  const { data } = await api.get<ServerResponse<EFLRateHistoryRespModel[]>>(
    SETTINGS.EFL_HISTORY
  )
  return data
}

export const getVATRateHistory = async (): Promise<
  ServerResponse<VATRateHistoryRespModel[]>
> => {
  const { data } = await api.get<ServerResponse<VATRateHistoryRespModel[]>>(
    SETTINGS.VAT_HISTORY
  )
  return data
}
