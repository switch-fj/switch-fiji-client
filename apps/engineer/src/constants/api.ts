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
  MPPT_FUNCTION_CHECK: (siteUid: string) =>
    `/api/v1/sites/${siteUid}/mppt-function-check`,
  BATTERY_SOC: (siteUid: string) => `/api/v1/sites/${siteUid}/battery-soc`,
  BATTERY_CONFIG: (siteUid: string) =>
    `/api/v1/sites/${siteUid}/battery-config`,
  PRODUCTION_HISTORY: (siteUid: string) =>
    `/api/v1/sites/${siteUid}/production-history`,
  DEVICE_PRODUCTION_HISTORY: (siteUid: string, deviceUid: string) =>
    `/api/v1/sites/${siteUid}/devices/${deviceUid}/production-history`,
  PRODUCTION_YTD: (siteUid: string) =>
    `/api/v1/sites/${siteUid}/production-ytd`,
  MAINTENANCE_LOGS: (siteUid: string) =>
    `/api/v1/sites/${siteUid}/maintenance-logs`,
  MAINTENANCE_LOG: (siteUid: string, logUid: string) =>
    `/api/v1/sites/${siteUid}/maintenance-logs/${logUid}`,
} as const

export const DEVICE = {
  BY_SITE: (siteUid: string) => `/api/v1/device/site/${siteUid}`,
} as const

// Note: singular "site", unlike the SITE group above — a distinct route.
export const FLOW_GRAPH = {
  STREAM: (siteUid: string) => `/api/v1/site/${siteUid}/flow-graph/stream`,
} as const

export const ALERTS = {
  LIST: "/api/v1/alerts",
  SUMMARY: "/api/v1/alerts/summary",
  DETAIL: (alertUid: string) => `/api/v1/alerts/${alertUid}`,
  EVENTS: (alertUid: string) => `/api/v1/alerts/${alertUid}/events`,
  ACKNOWLEDGE: (alertUid: string) => `/api/v1/alerts/${alertUid}/acknowledge`,
  MONITORING_STATUS: (siteUid: string) =>
    `/api/v1/sites/${siteUid}/monitoring-status`,
  MONITORING_EXECUTIONS: (siteUid: string) =>
    `/api/v1/sites/${siteUid}/monitoring-executions`,
  GLOBAL_CONFIG: "/api/v1/alert-configuration",
  GLOBAL_RULE: (ruleKey: string) => `/api/v1/alert-configuration/${ruleKey}`,
  SITE_CONFIG: (siteUid: string) =>
    `/api/v1/sites/${siteUid}/alert-configuration`,
  SITE_RULE: (siteUid: string, ruleKey: string) =>
    `/api/v1/sites/${siteUid}/alert-configuration/${ruleKey}`,
} as const
