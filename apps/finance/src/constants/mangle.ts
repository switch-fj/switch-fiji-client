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
