import api from "@/lib/axios"
import { CONTRACT } from "@/constants/api"
import type {
  CreateContractInput,
  ContractDetailsPayload,
  ContractDetailedRespModel,
} from "@/types/site"
import type { ServerResponse } from "@/types/client"

export const createContract = async (
  payload: CreateContractInput
): Promise<ServerResponse<string>> => {
  const { data } = await api.post<ServerResponse<string>>(
    CONTRACT.CREATE,
    payload
  )
  return data
}

export const getContract = async (
  contractUid: string
): Promise<ServerResponse<ContractDetailedRespModel>> => {
  const { data } = await api.get<ServerResponse<ContractDetailedRespModel>>(
    CONTRACT.GET(contractUid)
  )
  return data
}

export const createContractDetails = async (
  contractUid: string,
  payload: ContractDetailsPayload
): Promise<ServerResponse<string>> => {
  const { data } = await api.post<ServerResponse<string>>(
    CONTRACT.CREATE_DETAILS(contractUid),
    payload
  )
  return data
}

export const updateContractDetails = async (
  contractDetailsUid: string,
  payload: ContractDetailsPayload
): Promise<ServerResponse<string>> => {
  const { data } = await api.put<ServerResponse<string>>(
    CONTRACT.UPDATE_DETAILS(contractDetailsUid),
    payload
  )
  return data
}
