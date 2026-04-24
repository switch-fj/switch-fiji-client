"use client"

import { useQuery } from "@tanstack/react-query"
import { getInvoice, getInvoiceHistory } from "@/requests/invoice"

export const INVOICE_KEYS = {
  detail: (uid: string) => ["invoice", uid] as const,
  history: (contractUid: string) => ["invoice-history", contractUid] as const,
}

export const useGetInvoice = (invoiceUid: string | null) => {
  return useQuery({
    queryKey: INVOICE_KEYS.detail(invoiceUid ?? ""),
    queryFn: () => getInvoice(invoiceUid!),
    select: (res) => res.data,
    enabled: !!invoiceUid,
  })
}

export const useGetInvoiceHistory = (contractUid: string | null) => {
  return useQuery({
    queryKey: INVOICE_KEYS.history(contractUid ?? ""),
    queryFn: () => getInvoiceHistory(contractUid!),
    select: (res) => res.data,
    enabled: !!contractUid,
  })
}
