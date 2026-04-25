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

export const downloadInvoicePdf = async (
  invoiceUid: string,
  invoiceRef: string
) => {
  const { data } = await api.get(INVOICE.PDF(invoiceUid), {
    responseType: "blob",
  })
  const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }))
  const a = document.createElement("a")
  a.href = url
  a.download = `${invoiceRef}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
