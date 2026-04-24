"use client"

import { useEffect, useState } from "react"
import { Sheet, SheetContent, Button } from "@workspace/ui"
import { ChevronLeft, ChevronDown, Search, Download } from "lucide-react"
import { useGetInvoice, useGetInvoiceHistory } from "@/hooks/useInvoice"
import type { InvoiceRespModel, InvoiceHistoryRespModel } from "@/types/invoice"

type Props = {
  open: boolean
  onClose: () => void
  clientName: string
  siteName: string | null
  billingEmail: string
  contractUid: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function fmtMonthYear(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  })
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

// Deduplicate send records by invoice_uid, keeping the most-recent per invoice
function uniqueInvoices(
  items: InvoiceHistoryRespModel[]
): InvoiceHistoryRespModel[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.invoice_uid)) return false
    seen.add(item.invoice_uid)
    return true
  })
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SwitchLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-bold tracking-[0.2em] text-[#1B3A4B] uppercase">
        Switch
      </span>
      <span className="text-sm font-light text-[#1B3A4B]">·:·</span>
    </div>
  )
}

function InvoiceEmptyState({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center gap-2">
      <p className="text-text-1 text-base font-semibold">No data yet</p>
      <p className="text-muted-foreground text-sm">
        {message ?? "Click generate to show generated invoice"}
      </p>
    </div>
  )
}

function LineItemsTable({ invoice }: { invoice: InvoiceRespModel }) {
  const subtotal = parseFloat(invoice.subtotal)
  const vatRate = parseFloat(invoice.vat_rate)
  const vatAmount = subtotal * vatRate
  const total = subtotal + vatAmount

  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#E8EEF2] text-[#1B3A4B]">
            <th className="px-4 py-3 text-left font-semibold">Item</th>
            <th className="px-4 py-3 text-right font-semibold">Energy (kWh)</th>
            <th className="px-4 py-3 text-right font-semibold">Tariff</th>
            <th className="px-4 py-3 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.line_items.map((row, i) => (
            <tr
              key={row.uid}
              className={i % 2 === 1 ? "bg-neutral-50" : "bg-white"}
            >
              <td className="px-4 py-3">{row.description}</td>
              <td className="px-4 py-3 text-right">
                {row.energy_kwh != null ? parseFloat(row.energy_kwh) : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                {row.tariff_rate != null
                  ? `$${parseFloat(row.tariff_rate).toFixed(2)}`
                  : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                ${parseFloat(row.amount).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t bg-white px-4 py-3">
        <div className="ml-auto max-w-[260px] space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sub Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">VAT</span>
            <span>${vatAmount.toFixed(5)}</span>
          </div>
          <div className="flex justify-between border-t pt-1.5 font-semibold">
            <span>Total</span>
            <span>${total.toFixed(5)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function MeterDataTable({ invoice }: { invoice: InvoiceRespModel }) {
  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white text-[#1B3A4B]">
            <th className="border-b px-4 py-3 text-left font-semibold">
              Meter Data
            </th>
            <th className="border-b px-4 py-3 text-right font-semibold">
              Period Start
            </th>
            <th className="border-b px-4 py-3 text-right font-semibold">
              Period End
            </th>
            <th className="border-b px-4 py-3 text-right font-semibold">
              Usage
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.meter_data.map((row, i) => {
            const start = parseFloat(row.period_start_reading)
            const end = parseFloat(row.period_end_reading)
            const usage = end - start
            return (
              <tr
                key={row.uid}
                className={i % 2 === 1 ? "bg-neutral-50" : "bg-white"}
              >
                <td className="px-4 py-3">{row.label}</td>
                <td className="px-4 py-3 text-right">{start}</td>
                <td className="px-4 py-3 text-right">{end}</td>
                <td className="px-4 py-3 text-right">{usage}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

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

  // Auto-select the first invoice from history on load
  const dedupedHistory = historyPage ? uniqueInvoices(historyPage.items) : []

  useEffect(() => {
    if (dedupedHistory.length > 0 && !selectedInvoiceUid) {
      setSelectedInvoiceUid(dedupedHistory[0].invoice_uid)
    }
  }, [dedupedHistory, selectedInvoiceUid])

  // Most recent send record for the currently loaded invoice
  const latestSend = invoice?.history[0] ?? null

  const hasInvoice = !!invoice && !invoiceLoading
  const hasHistory = dedupedHistory.length > 0

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="border-border w-screen! max-w-none! overflow-y-auto border bg-[#FAFAFA] p-8"
      >
        {/* ── Page header ── */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="border-border flex h-8 w-8 items-center justify-center rounded border bg-white text-sm transition-colors hover:bg-neutral-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h1 className="text-text-1 text-xl font-bold">Invoice</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Generated automatically from energy data recorded by site devices.
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-6">
          {/* ── Left: Invoice panel ── */}
          <div className="space-y-4">
            {/* Billing period controls */}
            <div className="flex items-center gap-3">
              <Button variant="primary" size="sm" className="rounded px-5 py-2">
                View Period
              </Button>

              {hasInvoice && (
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
              )}
            </div>

            {/* Invoice card */}
            <div className="border-border overflow-hidden rounded-xl border bg-white">
              {/* Card header */}
              <div className="border-border grid grid-cols-[1fr_auto] gap-8 border-b px-6 py-5">
                <div className="space-y-3">
                  <SwitchLogo />
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span className="font-medium text-neutral-700">
                      Invoice Date:
                    </span>
                    {hasInvoice ? (
                      <span>
                        {fmt(invoice.period_start_at)} –{" "}
                        {fmt(invoice.period_end_at)}
                      </span>
                    ) : (
                      <span>--</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">{clientName}</span>
                    <span className="text-muted-foreground">Site:</span>
                    <span className="font-medium">{siteName ?? "—"}</span>
                    <span className="text-muted-foreground">
                      Invoice Number:
                    </span>
                    {hasInvoice ? (
                      <span className="text-blue font-medium">
                        {invoice.invoice_ref}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div className="px-6 py-5">
                {invoiceLoading ? (
                  <InvoiceEmptyState message="Loading invoice…" />
                ) : !hasInvoice && !contractUid ? (
                  <InvoiceEmptyState message="No contract linked to this site." />
                ) : !hasInvoice && !hasHistory ? (
                  <InvoiceEmptyState message="No invoices generated yet." />
                ) : !hasInvoice ? (
                  <InvoiceEmptyState message="Select an invoice from the history panel." />
                ) : (
                  <div className="space-y-5">
                    <LineItemsTable invoice={invoice} />
                    <MeterDataTable invoice={invoice} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: History panel ── */}
          <div className="flex flex-col justify-between">
            <div className="border-border overflow-hidden rounded-xl border bg-white">
              {/* History header */}
              <div className="border-border flex items-center justify-between border-b px-4 py-4">
                <span className="font-semibold">History</span>
                <button className="border-border flex items-center gap-1.5 rounded border px-2.5 py-1 text-sm">
                  All time
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {historyLoading ? (
                <div className="text-muted-foreground px-4 py-8 text-center text-sm">
                  Loading…
                </div>
              ) : !hasHistory ? (
                <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-12 text-center">
                  <p className="font-semibold">No History</p>
                  <p className="text-muted-foreground text-sm">
                    New invoice generated will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {dedupedHistory.map((item) => (
                    <button
                      key={item.uid}
                      onClick={() => setSelectedInvoiceUid(item.invoice_uid)}
                      className={[
                        "flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-neutral-50",
                        selectedInvoiceUid === item.invoice_uid
                          ? "bg-neutral-50"
                          : "",
                      ].join(" ")}
                    >
                      <span className="text-sm font-medium">
                        {invoice?.uid === item.invoice_uid
                          ? invoice.invoice_ref
                          : fmtMonthYear(item.sent_at)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                          {fmtMonthYear(item.sent_at)}
                        </span>
                        <span
                          className={[
                            "h-2.5 w-2.5 rounded-full",
                            item.was_successful ? "bg-green-500" : "bg-red-500",
                          ].join(" ")}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom actions */}
            <div className="border-border mt-4 rounded-xl border bg-white px-4 py-4">
              {latestSend ? (
                <div className="mb-3 space-y-0.5 text-sm">
                  <p className="text-muted-foreground">
                    Sent to{" "}
                    <span className="text-text-1 font-semibold">
                      {latestSend.sent_to}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    Sent on{" "}
                    <span className="text-text-1 font-semibold">
                      {fmtDateTime(latestSend.sent_at)}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="mb-3 text-sm">
                  <span className="text-muted-foreground">Billing Email: </span>
                  <span className="font-semibold">{billingEmail}</span>
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant={hasInvoice ? "primary" : "outlined"}
                  size="sm"
                  className="flex flex-1 items-center justify-center gap-2 rounded"
                  disabled={!hasInvoice}
                >
                  <Download className="h-4 w-4" />
                  Download
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outlined"
                  size="sm"
                  className="flex-1 rounded"
                  disabled={!hasInvoice}
                >
                  Send to email
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
