import type { z } from "zod";
import type {
  EmailSchema,
  IdentityLoginSchema,
  VerifyLoginSchema,
  TokenSchema,
  UserResponseSchema,
  CreateClientSchema,
  ClientRespSchema,
  CursorPaginationSchema,
  PaginatedClientsSchema,
} from "./schemas";

export type EmailInput = z.infer<typeof EmailSchema>;
export type IdentityLoginInput = z.infer<typeof IdentityLoginSchema>;
export type VerifyLoginInput = z.infer<typeof VerifyLoginSchema>;
export type TokenModel = z.infer<typeof TokenSchema>;
export type UserResponseModel = z.infer<typeof UserResponseSchema>;
export type ServerResponse<T> = { data: T; message: string };

export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type ClientModel = z.infer<typeof ClientRespSchema>;
export type CursorPagination = z.infer<typeof CursorPaginationSchema>;
export type PaginatedClients = z.infer<typeof PaginatedClientsSchema>;
