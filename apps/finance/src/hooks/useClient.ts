"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { fetchAllCursorPages } from "@workspace/api"
import { getClients, addClient, type GetClientsParams } from "@/requests/client"
import type { ClientModel, CreateClientInput } from "@/types/client"

export const CLIENT_KEYS = {
  all: ["clients"] as const,
  list: (params?: GetClientsParams) => [...CLIENT_KEYS.all, params] as const,
  allPages: ["clients", "all-pages"] as const,
}

export const useClients = (params?: GetClientsParams) => {
  return useQuery({
    queryKey: CLIENT_KEYS.list(params),
    queryFn: () => getClients(params),
  })
}

// Every client, across all pages — used where we need a full id → client
// lookup (e.g. joining the portfolio-wide sites table to client names).
export const useAllClients = () => {
  return useQuery({
    queryKey: CLIENT_KEYS.allPages,
    queryFn: () =>
      fetchAllCursorPages<ClientModel>((cursor) =>
        getClients({ limit: 100, cursor })
      ),
  })
}

export const useAddClient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateClientInput) => addClient(payload),
    onSuccess: (response) => {
      toast.success(response.message || "Client added successfully.")
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add client.")
    },
  })
}
