import api from "@/lib/axios"
import { SETTINGS } from "@/constants/api"
import type { ServerResponse } from "@/types/client"
import type {
  ContractSettingsRespModel,
  ContractSettingsUpdateInput,
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
