"use client"

import { useState } from "react"
import { Sheet, SheetContent, Button } from "@workspace/ui"
import {
  ChevronLeft,
  ChevronDown,
  Search,
  Download,
  ChevronDown as DropdownIcon,
} from "lucide-react"
import type {
  InvoiceModel,
  InvoiceHistoryItem,
  InvoiceStatus,
} from "@/types/invoice"

type Props = {
  open: boolean
  onClose: () => void
  clientName: string
  siteName: string | null
  billingEmail: string
  invoice?: InvoiceModel | null
  history?: InvoiceHistoryItem[]
  onSelectInvoice?: (uid: string) => void
}

const BILLING_PERIODS = ["This week", "This month", "Last month", "Custom"]

const STATUS_DOT: Record<InvoiceStatus, string> = {
  paid: "bg-green-500",
  pending: "bg-blue-400",
  overdue: "bg-red-500",
}

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

function InvoiceEmptyState() {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center gap-2">
      <p className="text-text-1 text-base font-semibold">No data yet</p>
      <p className="text-muted-foreground text-sm">
        Click generate to show generated invoice
      </p>
    </div>
  )
}

function LineItemsTable({ invoice }: { invoice: InvoiceModel }) {
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
            <tr key={i} className={i % 2 === 1 ? "bg-neutral-50" : "bg-white"}>
              <td className="px-4 py-3">{row.item}</td>
              <td className="px-4 py-3 text-right">{row.energy_kwh}</td>
              <td className="px-4 py-3 text-right">${row.tariff.toFixed(2)}</td>
              <td className="px-4 py-3 text-right">${row.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t bg-white px-4 py-3">
        <div className="ml-auto max-w-[260px] space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sub Total</span>
            <span>${invoice.sub_total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">VAT</span>
            <span>${invoice.vat.toFixed(5)}</span>
          </div>
          <div className="flex justify-between border-t pt-1.5 font-semibold">
            <span>Total</span>
            <span>${invoice.total.toFixed(5)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function MeterDataTable({ invoice }: { invoice: InvoiceModel }) {
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
          {invoice.meter_data.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? "bg-neutral-50" : "bg-white"}>
              <td className="px-4 py-3">{row.name}</td>
              <td className="px-4 py-3 text-right">{row.period_start}</td>
              <td className="px-4 py-3 text-right">{row.period_end}</td>
              <td className="px-4 py-3 text-right">{row.usage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ViewInvoiceSheet({
  open,
  onClose,
  clientName,
  siteName,
  billingEmail,
  invoice,
  history = [],
  onSelectInvoice,
}: Props) {
  const [billingPeriod, setBillingPeriod] = useState("This week")
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const hasInvoice = !!invoice
  const hasHistory = history.length > 0

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
              <div className="relative">
                <button
                  onClick={() => setPeriodDropdownOpen((v) => !v)}
                  className="border-border flex items-center gap-2 rounded border bg-white px-3 py-2 text-sm"
                >
                  {billingPeriod}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {periodDropdownOpen && (
                  <div className="border-border absolute top-full left-0 z-10 mt-1 w-40 overflow-hidden rounded border bg-white shadow-md">
                    {BILLING_PERIODS.map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setBillingPeriod(p)
                          setPeriodDropdownOpen(false)
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

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
                        {invoice.date_start} – {invoice.date_end}
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
                        {invoice.invoice_number}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div className="px-6 py-5">
                {!hasInvoice ? (
                  <InvoiceEmptyState />
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

              {/* History list or empty state */}
              {!hasHistory ? (
                <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-12 text-center">
                  <p className="font-semibold">No History</p>
                  <p className="text-muted-foreground text-sm">
                    New invoice generated will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {history.map((item) => (
                    <button
                      key={item.uid}
                      onClick={() => onSelectInvoice?.(item.uid)}
                      className={[
                        "flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-neutral-50",
                        invoice?.uid === item.uid ? "bg-neutral-50" : "",
                      ].join(" ")}
                    >
                      <span className="text-sm font-medium">
                        {item.invoice_number}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                          {item.period_label}
                        </span>
                        <span
                          className={[
                            "h-2.5 w-2.5 rounded-full",
                            STATUS_DOT[item.status],
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
              {invoice?.sent_to && invoice?.sent_at ? (
                <div className="mb-3 space-y-0.5 text-sm">
                  <p className="text-muted-foreground">
                    Sent to{" "}
                    <span className="text-text-1 font-semibold">
                      {invoice.sent_to}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    Sent on{" "}
                    <span className="text-text-1 font-semibold">
                      {invoice.sent_at}
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
