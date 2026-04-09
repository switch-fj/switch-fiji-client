import { z } from "zod";

export const EmailSchema = z.object({
  email: z.string(),
});

export const IdentityLoginSchema = z.object({
  email: z.string(),
  password: z.string().nullable().optional(),
});

export const VerifyLoginSchema = z.object({
  email: z.string(),
  otp: z.string(),
});

export const TokenSchema = z.object({
  access_token: z.string(),
  is_email_verified: z.boolean(),
  auth_type: z.enum(["otp", "pwd"]),
});

export const UserResponseSchema = z.object({
  uid: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  email: z.string(),
  role: z.number().nullable(),
  identity: z.number(),
  is_email_verified: z.boolean(),
});

export const ServerResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string(),
  });

export const CreateClientSchema = z.object({
  client_email: z.string().email(),
  client_name: z.string().min(1),
});

export const ClientRespSchema = z.object({
  uid: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  client_id: z.string().nullable(),
  client_name: z.string(),
  client_email: z.string(),
  sites_count: z.number().nullable(),
});

export const CursorPaginationSchema = z.object({
  limit: z.number(),
  next_cursor: z.string().nullable(),
  prev_cursor: z.string().nullable(),
});

export const PaginatedClientsSchema = z.object({
  items: z.array(ClientRespSchema),
  pagination: CursorPaginationSchema,
});
