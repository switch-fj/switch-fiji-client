export const AUTH = {
  LOGIN: "/api/v1/auth/login",
  LOGIN_VERIFY: "/api/v1/auth/login/verify",
  PROFILE: "/api/v1/auth/profile",
  NEW_ACCESS_TOKEN: "/api/v1/auth/new-access-token",
  VERIFY_SEND: "/api/v1/auth/verify/send",
  VERIFY_ACCT: (token: string) => `/api/v1/auth/verify/acct/${token}`,
} as const

export const ENGINEER = {
  STATS: "/api/v1/engineer/stats",
  CLIENTS: "/api/v1/engineer/clients",
  CLIENT_SITES: (clientUid: string) =>
    `/api/v1/engineer/client/${clientUid}/sites`,
  UPDATE_CLIENT: (clientUid: string) => `/api/v1/engineer/client/${clientUid}`,
  UPDATE_SITE: "/api/v1/engineer/site",
} as const

export const SITE = {
  PVS: (siteUid: string) => `/api/v1/sites/${siteUid}/pvs`,
  DEGRADATION: (siteUid: string) => `/api/v1/sites/${siteUid}/degradation`,
  PANELS: (siteUid: string) => `/api/v1/sites/${siteUid}/panels`,
  STRING_WIRING: (siteUid: string) => `/api/v1/sites/${siteUid}/string-wiring`,
} as const

export const DEVICE = {
  BY_SITE: (siteUid: string) => `/api/v1/device/site/${siteUid}`,
} as const
