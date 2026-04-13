import api from "@/lib/axios";
import type { CreateSiteInput, SiteModel } from "@/types/site";
import type { ServerResponse } from "@/types/client";

export type { CreateSiteInput } from "@/types/site";

export const getSites = async (
  clientUid: string,
): Promise<ServerResponse<SiteModel[]>> => {
  const { data } = await api.get<ServerResponse<SiteModel[]>>(
    `/api/v1/admin/sites/${clientUid}`,
  );
  return data;
};

export const addSite = async (
  payload: CreateSiteInput,
): Promise<ServerResponse<string>> => {
  const { data } = await api.post<ServerResponse<string>>(
    "/api/v1/admin/site/add",
    payload,
  );
  return data;
};
