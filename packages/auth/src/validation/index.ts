import { z } from "zod";

const lowerCaseRegex = /(?=.*[a-z])\w+/;
const upperCaseRegex = /(?=.*[A-Z])\w+/;
const numberRegex = /\d/;
const specialCharcterRegex = /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;

export const email = z
  .string()
  .min(1, "Email is required.")
  .email("Please enter a valid email address.");

export const password = z
  .string()
  .min(1, "Password is required.")
  .min(8, "Must be at least 8 characters long.")
  .refine((value) => upperCaseRegex.test(value), {
    message: "Password must contain at least one uppercase letter.",
  })
  .refine((value) => lowerCaseRegex.test(value), {
    message: "Password must contain at least one lowercase letter.",
  })
  .refine((value) => numberRegex.test(value), {
    message: "Password must contain at least one number.",
  })
  .refine((value) => specialCharcterRegex.test(value), {
    message: "Password must contain at least one special character.",
  });

export const confirmPassword = z
  .string()
  .trim()
  .min(1, "Confirm Password is required.");

export const loginSchema = z.object({
  email,
  password,
});

export const loginBaseSchema = z.object({
  email,
  password: z.string().optional(),
  otp: z.string().optional(),
});

export const loginEmailSchema = z.object({
  email,
});

export const loginOtpSchema = z.object({
  email,
  otp: z.string().min(1, "OTP is required."),
});

export const registerSchema = z
  .object({
    email,
    password,
    confirmPassword,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type TLogin = z.infer<typeof loginSchema>;
export type TLoginBase = z.infer<typeof loginBaseSchema>;
export type TLoginEmail = z.infer<typeof loginEmailSchema>;
export type TLoginOtp = z.infer<typeof loginOtpSchema>;
export type TRegister = z.infer<typeof registerSchema>;
