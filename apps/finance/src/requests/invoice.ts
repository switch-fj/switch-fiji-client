import api from "@/lib/axios"
import { INVOICE, JOBRUN } from "@/constants/api"
import type { ServerResponse } from "@/types/client"
import type {
  InvoiceRespModel,
  InvoiceHistoryPage,
  InvoiceLivePage,
} from "@/types/invoice"

export const getInvoice = async (
  invoiceUid: string
): Promise<ServerResponse<InvoiceRespModel>> => {
  const { data } = await api.get<ServerResponse<InvoiceRespModel>>(
    INVOICE.GET(invoiceUid)
  )
  return data
}

export const getInvoiceHistory = async (
  contractUid: string,
  params: { offset?: number; limit?: number } = {}
): Promise<ServerResponse<InvoiceHistoryPage>> => {
  const { data } = await api.get<ServerResponse<InvoiceHistoryPage>>(
    INVOICE.HISTORY(contractUid),
    { params }
  )
  return data
}

export const getLiveInvoice = async (
  contractUid: string,
  params: { next_cursor?: string | null; limit?: number } = {}
): Promise<ServerResponse<InvoiceLivePage>> => {
  const { data } = await api.get<ServerResponse<InvoiceLivePage>>(
    INVOICE.LIVE(contractUid),
    { params: params.next_cursor ? params : { limit: params.limit } }
  )
  return data
}

export const computeInvoice = async (payload: {
  contract_uid: string
  period_start: string
  period_end: string
}): Promise<ServerResponse<{ task_id: string }>> => {
  const { data } = await api.post<ServerResponse<{ task_id: string }>>(
    JOBRUN.COMPUTE_INVOICE,
    payload
  )
  return data
}

export const downloadInvoicePdf = async (
  invoiceUid: string,
  invoiceRef: string
) => {
  const { data } = await api.get(INVOICE.PDF(invoiceUid), {
    responseType: "blob",
    withCredentials: false,
  })
  const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }))
  const a = document.createElement("a")
  a.href = url
  a.download = `${invoiceRef}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
