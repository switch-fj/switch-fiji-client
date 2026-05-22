"use client"

import { useQuery, useInfiniteQuery, useMutation } from "@tanstack/react-query"
import {
  getInvoice,
  getInvoiceHistory,
  getLiveInvoice,
  downloadInvoicePdf,
  computeInvoice,
} from "@/requests/invoice"
import { toast } from "sonner"

export const INVOICE_KEYS = {
  detail: (uid: string) => ["invoice", uid] as const,
  history: (contractUid: string) => ["invoice-history", contractUid] as const,
  live: (contractUid: string) => ["invoice-live", contractUid] as const,
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
  return useInfiniteQuery({
    queryKey: INVOICE_KEYS.history(contractUid ?? ""),
    queryFn: ({ pageParam }) =>
      getInvoiceHistory(contractUid!, { offset: pageParam, limit: 20 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const p = lastPage.data?.pagination
      if (!p) return undefined
      return p.current_page < p.total_pages
        ? p.current_page * p.limit
        : undefined
    },
    enabled: !!contractUid,
  })
}

export const useGetLiveInvoice = (contractUid: string | null) => {
  return useInfiniteQuery({
    queryKey: INVOICE_KEYS.live(contractUid ?? ""),
    queryFn: ({ pageParam }) =>
      getLiveInvoice(contractUid!, {
        next_cursor: pageParam ?? null,
        limit: 30,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.data?.pagination?.next_cursor ?? undefined,
    enabled: !!contractUid,
  })
}

export const useDownloadInvoicePdf = () => {
  return useMutation({
    mutationFn: ({
      invoiceUid,
      invoiceRef,
    }: {
      invoiceUid: string
      invoiceRef: string
    }) => downloadInvoicePdf(invoiceUid, invoiceRef),
  })
}

export const useComputeInvoice = () =>
  useMutation({
    mutationFn: computeInvoice,
    onSuccess: (res) =>
      toast.success(res.message || "Invoice computation started."),
    onError: (err: Error) =>
      toast.error(err.message || "Failed to compute invoice."),
  })
