import { z } from "zod";

export const CreateClientSchema = z.object({
  client_email: z.email("Enter a valid email"),
  client_name: z.string().min(1, "Client name is required"),
});

export type CreateClientInput = z.infer<typeof CreateClientSchema>;

export type ClientModel = {
  uid: string;
  created_at: string;
  updated_at: string;
  client_id: string | null;
  client_name: string;
  client_email: string;
  sites_count: number | null;
};

export type CursorPagination = {
  limit: number;
  next_cursor: string | null;
  prev_cursor: string | null;
};

export type PaginatedClients = {
  items: ClientModel[];
  pagination: CursorPagination;
};

export type ServerResponse<T> = {
  data: T;
  message: string;
};
