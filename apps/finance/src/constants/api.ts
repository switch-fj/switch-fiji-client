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
} as const;

export const FINANCE = {
  INVOICES: {
    LIST: "/finance/invoices",
    CREATE: "/finance/invoices",
    DETAILS: (id: string) => `/finance/invoices/${id}`,
    UPDATE: (id: string) => `/finance/invoices/${id}`,
    VOID: (id: string) => `/finance/invoices/${id}/void`,
  },
  PAYMENTS: {
    LIST: "/finance/payments",
    CREATE: "/finance/payments",
    DETAILS: (id: string) => `/finance/payments/${id}`,
    REFUND: (id: string) => `/finance/payments/${id}/refund`,
  },
  PAYOUTS: {
    LIST: "/finance/payouts",
    REQUEST: "/finance/payouts",
    DETAILS: (id: string) => `/finance/payouts/${id}`,
    CANCEL: (id: string) => `/finance/payouts/${id}/cancel`,
  },
  REPORTS: {
    OVERVIEW: "/finance/reports/overview",
    REVENUE: "/finance/reports/revenue",
    CASHFLOW: "/finance/reports/cashflow",
  },
} as const;
