"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getClients,
  addClient,
  type GetClientsParams,
} from "@/requests/client";
import type { CreateClientInput } from "@/types/client";

export const CLIENT_KEYS = {
  all: ["clients"] as const,
  list: (params?: GetClientsParams) => [...CLIENT_KEYS.all, params] as const,
};

export const useClients = (params?: GetClientsParams) => {
  return useQuery({
    queryKey: CLIENT_KEYS.list(params),
    queryFn: () => getClients(params),
  });
};

export const useAddClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClientInput) => addClient(payload),
    onSuccess: (response) => {
      toast.success(response.message || "Client added successfully.");
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add client.");
    },
  });
};
