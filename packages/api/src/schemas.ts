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
  role: z.number(),
  is_email_verified: z.boolean(),
});

export const ServerResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string(),
  });
