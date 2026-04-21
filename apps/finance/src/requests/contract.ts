import api from "@/lib/axios"
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
    "/api/v1/contract/create",
    payload
  )
  return data
}

export const getContract = async (
  contractUid: string
): Promise<ServerResponse<ContractDetailedRespModel>> => {
  const { data } = await api.get<ServerResponse<ContractDetailedRespModel>>(
    `/api/v1/contract/${contractUid}`
  )
  return data
}

export const createContractDetails = async (
  contractUid: string,
  payload: ContractDetailsPayload
): Promise<ServerResponse<string>> => {
  const { data } = await api.post<ServerResponse<string>>(
    `/api/v1/contract/details/${contractUid}`,
    payload
  )
  return data
}

export const updateContractDetails = async (
  contractDetailsUid: string,
  payload: ContractDetailsPayload
): Promise<ServerResponse<string>> => {
  const { data } = await api.put<ServerResponse<string>>(
    `/api/v1/contract/details/${contractDetailsUid}`,
    payload
  )
  return data
}
