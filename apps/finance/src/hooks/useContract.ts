"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createContract,
  createContractDetails,
  updateContractDetails,
  getContract,
} from "@/requests/contract"
import type { CreateContractInput, ContractDetailsPayload } from "@/types/site"
import { SITE_KEYS } from "./useSite"

export const CONTRACT_KEYS = {
  detail: (uid: string) => ["contract", uid] as const,
}

export const useGetContract = (contractUid: string) => {
  return useQuery({
    queryKey: CONTRACT_KEYS.detail(contractUid),
    queryFn: () => getContract(contractUid),
    select: (res) => res.data,
    enabled: !!contractUid,
  })
}

export const useCreateContract = (clientUid: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateContractInput) => createContract(payload),
    onSuccess: (response) => {
      toast.success(response.message || "Contract created successfully.")
      queryClient.invalidateQueries({
        queryKey: SITE_KEYS.byClient(clientUid),
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create contract.")
    },
  })
}

export const useCreateContractDetails = (
  clientUid: string,
  contractUid: string
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ContractDetailsPayload) =>
      createContractDetails(contractUid, payload),
    onSuccess: (response) => {
      toast.success(response.message || "Contract details saved successfully.")
      queryClient.invalidateQueries({ queryKey: SITE_KEYS.byClient(clientUid) })
      queryClient.invalidateQueries({
        queryKey: CONTRACT_KEYS.detail(contractUid),
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save contract details.")
    },
  })
}

export const useUpdateContractDetails = (
  clientUid: string,
  contractUid: string,
  contractDetailsUid: string
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ContractDetailsPayload) =>
      updateContractDetails(contractDetailsUid, payload),
    onSuccess: (response) => {
      toast.success(
        response.message || "Contract details updated successfully."
      )
      queryClient.invalidateQueries({ queryKey: SITE_KEYS.byClient(clientUid) })
      queryClient.invalidateQueries({
        queryKey: CONTRACT_KEYS.detail(contractUid),
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update contract details.")
    },
  })
}
