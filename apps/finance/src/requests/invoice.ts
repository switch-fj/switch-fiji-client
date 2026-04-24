import api from "@/lib/axios"
import { INVOICE } from "@/constants/api"
import type { ServerResponse } from "@/types/client"
import type { InvoiceRespModel, InvoiceHistoryPage } from "@/types/invoice"

export const getInvoice = async (
  invoiceUid: string
): Promise<ServerResponse<InvoiceRespModel>> => {
  const { data } = await api.get<ServerResponse<InvoiceRespModel>>(
    INVOICE.GET(invoiceUid)
  )
  return data
}

export const getInvoiceHistory = async (
  contractUid: string
): Promise<ServerResponse<InvoiceHistoryPage>> => {
  const { data } = await api.get<ServerResponse<InvoiceHistoryPage>>(
    INVOICE.HISTORY(contractUid)
  )
  return data
}
