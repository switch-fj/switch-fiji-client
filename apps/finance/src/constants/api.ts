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
  STATS_STREAM: (siteUid: string) =>
    `/api/v1/admin/sites/${siteUid}/stats/stream`,
} as const

export const CONTRACT = {
  CREATE: "/api/v1/contract/create",
  GET: (contractUid: string) => `/api/v1/contract/${contractUid}`,
  CREATE_DETAILS: (contractUid: string) =>
    `/api/v1/contract/details/${contractUid}`,
  UPDATE_DETAILS: (contractDetailsUid: string) =>
    `/api/v1/contract/details/${contractDetailsUid}`,
} as const

export const INVOICE = {
  GET: (invoiceUid: string) => `/api/v1/invoice/${invoiceUid}`,
  HISTORY: (contractUid: string) => `/api/v1/invoice/history/${contractUid}`,
  PDF: (invoiceUid: string) => `/api/v1/invoice/${invoiceUid}/pdf`,
  LIVE: (contractUid: string) => `/api/v1/invoice/live/${contractUid}`,
} as const

export const JOBRUN = {
  COMPUTE_INVOICE: "/api/v1/jobrun/invoice/compute",
} as const

export const PORTFOLIO = {
  STATS: "/api/v1/admin/portfolio/stats",
} as const

export const SETTINGS = {
  GET: "/api/v1/settings/contracts-settings",
  UPDATE: "/api/v1/settings/contracts-settings",
  EFL_HISTORY: "/api/v1/settings/efl-rate-history",
  VAT_HISTORY: "/api/v1/settings/vat-rate-history",
} as const
