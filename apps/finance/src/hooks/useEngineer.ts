"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getUsers, registerEngineer } from "@/requests/engineer"
import type { RegisterEngineerInput, GetUsersParams } from "@/types/engineer"

export const ENGINEER_KEYS = {
  all: ["users"] as const,
  list: (params?: GetUsersParams) => [...ENGINEER_KEYS.all, params] as const,
}

export const useUsers = (params?: GetUsersParams) =>
  useQuery({
    queryKey: ENGINEER_KEYS.list(params),
    queryFn: () => getUsers(params),
  })

export const useRegisterEngineer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegisterEngineerInput) => registerEngineer(payload),
    onSuccess: (response) => {
      toast.success(response.message || "Engineer registered successfully.")
      queryClient.invalidateQueries({ queryKey: ENGINEER_KEYS.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to register engineer.")
    },
  })
}
