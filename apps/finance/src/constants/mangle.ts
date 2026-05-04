export enum EnumUserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  INVITED = "invited",
  SUSPENDED = "suspended",
  AVAILABLE = "Available",
  UNAVAILABLE = "Unavailable",
}

export enum EnumStaffRole {
  ADMIN = 1,
  ENGINEER = 2,
}

export enum EnumIdentityType {
  USER = 1,
  CLIENT = 2,
}

export enum EnumContractType {
  PPA = "PPA",
  LEASE = "Lease",
}

export enum EnumContractSystemMode {
  ON_GRID = "On Grid",
  OFF_GRID = "Off Grid",
}

export enum EnumContractDetailsStatus {
  DRAFT = "draft",
  PENDING = "pending",
  ACTIVE = "active",
  EXPIRED = "expired",
}

export enum EnumContractBillingFrequency {
  WEEKLY = "weekly",
  BI_WEEKLY = "bi-weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  SEMI_ANNUALLY = "semi-annually",
  ANNUALLY = "annually",
}

export const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "FJD", label: "FJD" },
  { value: "AUD", label: "AUD" },
  { value: "NZD", label: "NZD" },
]

export const TIMEZONE_OPTIONS = [
  { value: "Pacific/Fiji", label: "Pacific/Fiji (UTC+12)" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland (UTC+12/+13)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (UTC+10/+11)" },
  { value: "Australia/Brisbane", label: "Australia/Brisbane (UTC+10)" },
  { value: "Pacific/Port_Moresby", label: "Pacific/Port Moresby (UTC+10)" },
  { value: "Pacific/Guadalcanal", label: "Pacific/Guadalcanal (UTC+11)" },
  { value: "Pacific/Tongatapu", label: "Pacific/Tongatapu (UTC+13)" },
  { value: "UTC", label: "UTC (UTC+0)" },
]

export const TIME_FORMAT_OPTIONS = [
  { value: "24", label: "24-hour" },
  { value: "12", label: "12-hour" },
]

export const DATE_FORMAT_OPTIONS = [
  { value: "dmy", label: "DD-MMM-YYYY" },
  { value: "mdy", label: "MM/DD/YYYY" },
]
