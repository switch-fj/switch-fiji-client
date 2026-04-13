"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSites, addSite } from "@/requests/site";
import type { CreateSiteInput } from "@/types/site";

export const SITE_KEYS = {
  all: ["sites"] as const,
  byClient: (clientUid: string) => ["sites", clientUid] as const,
};

export const useSites = (clientUid: string | undefined) => {
  return useQuery({
    queryKey: SITE_KEYS.byClient(clientUid ?? ""),
    queryFn: () => getSites(clientUid!),
    enabled: !!clientUid,
  });
};

export const useAddSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSiteInput) => addSite(payload),
    onSuccess: (response, variables) => {
      toast.success(response.message || "Site added successfully.");
      queryClient.invalidateQueries({
        queryKey: SITE_KEYS.byClient(variables.client_uid),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add site.");
    },
  });
};
