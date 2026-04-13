export type ClientMetricSet = {
  expected: string
  actual: string
  billing: string
  deviation: string
}

import {
  EnumContractBillingFrequency,
  EnumContractDetailsStatus,
  EnumContractSystemMode,
  EnumContractType,
} from "@/constants/mangle"

export type ClientSite = {
  name: string
  tagTone: string
  expected: string
  actual: string
  billing: string
  cumulative: string
  alert: string
  alertTone: string
  contractType: EnumContractType
  contractMode: EnumContractSystemMode
  contractStatus: EnumContractDetailsStatus
  billingFrequency: EnumContractBillingFrequency
}

export type ClientSummary = {
  id: string
  name: string
  status: string
  statusTone: string
  metrics: ClientMetricSet
  sites: ClientSite[]
}

export const clients: ClientSummary[] = [
  {
    id: "paradise-taveuni",
    name: "Paradise Taveuni",
    status: "Underperforming",
    statusTone: "bg-orange-100 text-orange-700",
    metrics: {
      expected: "$1,200,000",
      actual: "$1,050,000",
      billing: "90.6% of Guarantee met",
      deviation: "-12.5%",
    },
    sites: [
      {
        name: "Nadi Resort Solar Plant",
        tagTone: "bg-blue",
        expected: "$3,150.21",
        actual: "$650.00",
        billing: "50.6% of Guarantee met",
        cumulative: "145,000 kWh / 160,000 kWh",
        alert: "Low Load Detected",
        alertTone: "bg-orange-100 text-orange-700",
        contractType: EnumContractType.PPA,
        contractMode: EnumContractSystemMode.ON_GRID,
        contractStatus: EnumContractDetailsStatus.ACTIVE,
        billingFrequency: EnumContractBillingFrequency.MONTHLY,
      },
      {
        name: "Paradise Resort Solar Plant 2",
        tagTone: "bg-blue-100 text-blue-700",
        expected: "$3,150.21",
        actual: "$650.00",
        billing: "50.6% of Guarantee met",
        cumulative: "88,000 kWh / 85,000 kWh",
        alert: "Healthy Resource",
        alertTone: "bg-emerald-100 text-emerald-700",
        contractType: EnumContractType.LEASE,
        contractMode: EnumContractSystemMode.OFF_GRID,
        contractStatus: EnumContractDetailsStatus.ACTIVE,
        billingFrequency: EnumContractBillingFrequency.MONTHLY,
      },
    ],
  },
  {
    id: "client-2",
    name: "Client 2",
    status: "Within Target",
    statusTone: "bg-emerald-100 text-emerald-700",
    metrics: {
      expected: "$320,000",
      actual: "$318,500",
      billing: "99.4% of Guarantee met",
      deviation: "-0.3%",
    },
    sites: [],
  },
  {
    id: "client-3",
    name: "Client 3",
    status: "Within Target",
    statusTone: "bg-emerald-100 text-emerald-700",
    metrics: {
      expected: "$280,000",
      actual: "$292,000",
      billing: "104.2% of Guarantee met",
      deviation: "+4.2%",
    },
    sites: [],
  },
  {
    id: "client-4",
    name: "Client 4",
    status: "Within Target",
    statusTone: "bg-emerald-100 text-emerald-700",
    metrics: {
      expected: "$430,000",
      actual: "$421,000",
      billing: "97.9% of Guarantee met",
      deviation: "-2.1%",
    },
    sites: [],
  },
]
