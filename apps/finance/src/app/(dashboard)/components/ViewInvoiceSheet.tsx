"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetTitle, Button } from "@workspace/ui"
import {
  ChevronLeft,
  Search,
  Download,
  Loader2,
  MousePointerClick,
  ChevronDown,
} from "lucide-react"
import {
  useGetInvoice,
  useGetInvoiceHistory,
  useDownloadInvoicePdf,
} from "@/hooks/useInvoice"
import {
  fmtDate,
  fmtMonthYear,
  fmtDateTime,
  uniqueByInvoiceUid,
} from "@/utils/invoice"
import InvoiceLineItemsTable from "./InvoiceLineItemsTable"
import InvoiceMeterDataTable from "./InvoiceMeterDataTable"

type Props = {
  open: boolean
  onClose: () => void
  clientName: string
  siteName: string | null
  billingEmail: string
  contractUid: string | null
}

export default function ViewInvoiceSheet({
  open,
  onClose,
  clientName,
  siteName,
  billingEmail,
  contractUid,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInvoiceUid, setSelectedInvoiceUid] = useState<string | null>(
    null
  )

  const { data: historyPage, isLoading: historyLoading } =
    useGetInvoiceHistory(contractUid)
  const { data: invoice, isLoading: invoiceLoading } =
    useGetInvoice(selectedInvoiceUid)
  const { mutate: downloadPdf, isPending: isDownloading } =
    useDownloadInvoicePdf()

  const dedupedHistory = historyPage
    ? uniqueByInvoiceUid(historyPage.items)
    : []
  const hasInvoice = !!invoice && !invoiceLoading
  const hasHistory = dedupedHistory.length > 0
  const latestSend = invoice?.history?.[0] ?? null

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-screen! max-w-none! overflow-y-auto bg-[#FAFAFA] p-8"
      >
        <div className="border-border rounded-lg border p-8">
          <SheetTitle className="sr-only">Invoice</SheetTitle>

          {/* ── Header ── */}
          <div className="mb-6 flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="border-border flex h-8 w-8 items-center justify-center rounded border bg-white transition-colors hover:bg-neutral-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h1 className="text-text-1 text-xl font-bold">Invoice</h1>
            </div>
            <p className="text-text-1 text-sm">
              Generated automatically from energy data recorded by site devices.
            </p>
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-[minmax(0,1fr)_450px] gap-6">
            {/* ── Left: Invoice panel ── */}
            <div className="">
              <div className="flex gap-3">
                {hasInvoice && (
                  <>
                    <span className="block text-sm font-semibold">
                      Billing Period
                    </span>
                    <Button
                      variant="primary"
                      size="md"
                      className="max-w-xs rounded-lg px-5 py-2"
                    >
                      View Period
                    </Button>
                    <div className="border-border ml-auto flex items-center gap-2 rounded border bg-white px-3 py-2 text-sm text-neutral-400">
                      <Search className="h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search invoice..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-52 bg-transparent outline-none placeholder:text-neutral-400"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="border-border overflow-hidden rounded-xl border bg-white">
                {/* Card header */}
                <div className="border-border grid grid-cols-[1fr_auto] gap-8 border-b px-6 py-5">
                  <div className="space-y-3">
                    <img
                      src="https://i.ibb.co/S4PF9FrQ/switch-Fjlogo.png"
                      alt="Switch"
                      className="h-6 object-contain"
                    />
                    <div className="text-text-1 flex items-center gap-2 text-sm">
                      <span className="text-text-1 font-medium">
                        Invoice Date:
                      </span>
                      {invoiceLoading ? (
                        <div className="h-3 w-44 animate-pulse rounded bg-gray-200" />
                      ) : hasInvoice ? (
                        <span>
                          {fmtDate(invoice.period_start_at)} –{" "}
                          {fmtDate(invoice.period_end_at)}
                        </span>
                      ) : (
                        <span>--</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                      <span className="text-text-1 font-medium">Customer:</span>
                      <span className="font-normal">{clientName}</span>
                      <span className="text-text-1 font-medium">Site:</span>
                      <span className="font-normal">{siteName ?? "—"}</span>
                      <span className="text-text-1 font-medium">
                        Invoice Number:
                      </span>
                      {invoiceLoading ? (
                        <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
                      ) : hasInvoice ? (
                        <span className="text-blue font-medium">
                          {invoice.invoice_ref}
                        </span>
                      ) : (
                        <span className="text-text-1">--</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-6 py-5">
                  {invoiceLoading ? (
                    // Skeleton
                    <div className="animate-pulse space-y-5">
                      <div className="overflow-hidden rounded-md border">
                        <div className="bg-[#E8EEF2] px-4 py-3">
                          <div className="h-3.5 w-1/3 rounded bg-gray-300" />
                        </div>
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className={`flex gap-6 px-4 py-3.5 ${i % 2 === 1 ? "bg-neutral-50" : "bg-white"}`}
                          >
                            <div className="h-3 flex-1 rounded bg-gray-200" />
                            <div className="h-3 w-14 rounded bg-gray-200" />
                            <div className="h-3 w-10 rounded bg-gray-200" />
                            <div className="h-3 w-14 rounded bg-gray-200" />
                          </div>
                        ))}
                        <div className="border-t bg-white px-4 py-3">
                          <div className="ml-auto max-w-[260px] space-y-2">
                            {[0, 1].map((i) => (
                              <div
                                key={i}
                                className="flex justify-between gap-4"
                              >
                                <div className="h-3 w-16 rounded bg-gray-200" />
                                <div className="h-3 w-16 rounded bg-gray-200" />
                              </div>
                            ))}
                            <div className="flex justify-between gap-4 border-t pt-1.5">
                              <div className="h-3.5 w-10 rounded bg-gray-300" />
                              <div className="h-3.5 w-20 rounded bg-gray-300" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="overflow-hidden rounded-md border">
                        <div className="border-b bg-white px-4 py-3">
                          <div className="h-3.5 w-1/4 rounded bg-gray-200" />
                        </div>
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`flex gap-6 px-4 py-3.5 ${i % 2 === 1 ? "bg-neutral-50" : "bg-white"}`}
                          >
                            <div className="h-3 flex-1 rounded bg-gray-200" />
                            <div className="h-3 w-12 rounded bg-gray-200" />
                            <div className="h-3 w-12 rounded bg-gray-200" />
                            <div className="h-3 w-12 rounded bg-gray-200" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : !hasInvoice && !contractUid ? (
                    <div className="flex min-h-[260px] flex-col items-center justify-center gap-2">
                      <p className="text-text-1 text-2xl font-semibold">
                        No data yet
                      </p>
                      <p className="text-text-1 text-sm">
                        No contract linked to this site.
                      </p>
                    </div>
                  ) : !hasInvoice && !hasHistory ? (
                    <div className="flex min-h-[260px] flex-col items-center justify-center gap-2">
                      <p className="text-text-1 text-2xl font-semibold">
                        No data yet
                      </p>
                      <p className="text-text-1 text-sm">
                        No invoices generated yet.
                      </p>
                    </div>
                  ) : !hasInvoice ? (
                    <div className="flex min-h-[260px] flex-col items-center justify-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                        <MousePointerClick className="text-text-1 h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <p className="text-text-1 text-sm font-semibold">
                          Select an invoice
                        </p>
                        <p className="text-text-1 mt-0.5 text-xs">
                          Click an item in the history panel to view it
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <InvoiceLineItemsTable invoice={invoice} />
                      <InvoiceMeterDataTable invoice={invoice} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right: History panel ── */}
            <div className="border-border flex flex-col justify-between rounded-md border bg-white">
              <div className="overflow-hidden">
                <div className="border-border flex items-center justify-between border-b px-4 py-4">
                  <span className="font-semibold">History</span>
                  <button className="border-border flex items-center gap-1.5 rounded border px-2.5 py-1 text-sm">
                    All time <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {historyLoading ? (
                  <div className="animate-pulse divide-y">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-4 py-3.5"
                      >
                        <div className="h-3 w-28 rounded bg-gray-200" />
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-14 rounded bg-gray-200" />
                          <div className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !hasHistory ? (
                  <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-12 text-center">
                    <p className="font-semibold">No History</p>
                    <p className="text-text-1 text-sm">
                      New invoice generated will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 divide-y p-3">
                    {dedupedHistory.map((item, index) => {
                      const isSelected = selectedInvoiceUid === item.invoice_uid
                      const isLoadingThis = isSelected && invoiceLoading
                      return (
                        <button
                          key={item.uid}
                          onClick={() =>
                            setSelectedInvoiceUid(item.invoice_uid)
                          }
                          className={[
                            "text-text-1 flex w-full cursor-pointer items-center justify-between rounded-md border-l-2 py-3 pr-4 pl-3.5 text-left transition-all hover:bg-neutral-50",
                            index % 2 === 0 ? "bg-neutral-100" : "",
                            isSelected ? "bg-primary/30" : "border-transparent",
                          ].join(" ")}
                        >
                          <span className="text-sm font-medium">
                            {invoice?.invoice_ref}
                          </span>
                          <span className="text-text-1 text-sm">
                            {fmtMonthYear(item.sent_at)}
                          </span>
                          <div className="flex items-center gap-2">
                            {isLoadingThis ? (
                              <Loader2 className="text-text-1 h-3 w-3 animate-spin" />
                            ) : (
                              <span
                                className={[
                                  "h-3.5 w-3.5 rounded-full",
                                  item.was_successful
                                    ? "bg-green-500"
                                    : "bg-red-500",
                                ].join(" ")}
                              />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Bottom actions */}
              <div className="mt-4 border-t px-4 py-4">
                {latestSend ? (
                  <div className="mb-3 space-y-0.5 text-sm">
                    <p className="text-text-1">
                      Sent to{" "}
                      <span className="text-text-1 font-semibold">
                        {latestSend.sent_to}
                      </span>
                    </p>
                    <p className="text-text-1">
                      Sent on{" "}
                      <span className="text-text-1 font-semibold">
                        {fmtDateTime(latestSend.sent_at)}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="mb-3 text-sm">
                    <span className="text-text-1">Billing Email: </span>
                    <span className="font-semibold">{billingEmail}</span>
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant={hasInvoice ? "primary" : "outlined"}
                    size="md"
                    className="flex flex-1 items-center justify-center gap-2 rounded"
                    disabled={!hasInvoice || isDownloading}
                    onClick={() =>
                      invoice &&
                      downloadPdf({
                        invoiceUid: invoice.uid,
                        invoiceRef: invoice.invoice_ref,
                      })
                    }
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {isDownloading ? "Downloading..." : "Download"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="md"
                    className="flex-1 rounded"
                    disabled={!hasInvoice}
                  >
                    Send to email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
