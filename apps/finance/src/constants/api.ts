export const AUTH = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  OTP: "/auth/verify-otp",
  GET_PROFILE: "/auth/profile",
  NEW_ACCESS_TOKEN: "/auth/refresh-token",
  FORGOT_PWD: "/auth/forgot-password",
  NEW_PWD: "/auth/reset-password",
  CHANGE_PWD: "/auth/change-password",
  RESEND_EMAIL_VERIFICATION: "/auth/resend-email-verification",
} as const

export const CLIENT = {
  LIST: "/api/v1/admin/clients",
  ADD: "/api/v1/admin/client/add",
} as const

export const SITE = {
  LIST: (clientUid: string) => `/api/v1/admin/sites/${clientUid}`,
  ADD: "/api/v1/admin/site/add",
} as const
