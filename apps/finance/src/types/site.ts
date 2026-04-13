import { z } from "zod";

export const CreateSiteSchema = z.object({
  client_uid: z.string().uuid("Invalid client UID"),
  site_name: z.string().min(1, "Site name is required"),
});

export type CreateSiteInput = z.infer<typeof CreateSiteSchema>;

export type SiteModel = {
  uid: string;
  created_at: string;
  updated_at: string;
  client_uid: string;
  site_id: string | null;
  site_name: string | null;
  gateway_id: string | null;
  firmware: string | null;
};
