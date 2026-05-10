import type { InvoiceDisplayModel } from "@/types/invoice"
import { fmtAmount } from "@/utils/invoice"

type Props = { invoice: InvoiceDisplayModel; hideUtilityLines?: boolean }

export default function InvoiceLineItemsTable({
  invoice,
  hideUtilityLines,
}: Props) {
  const lineItems = hideUtilityLines
    ? invoice.line_items.filter((row) => row.tariff_slot !== "Utility")
    : invoice.line_items
  const subtotal = parseFloat(invoice.subtotal)
  const vatAmount =
    invoice.vat_amount != null
      ? parseFloat(invoice.vat_amount)
      : subtotal * parseFloat(invoice.vat_rate)
  const total =
    invoice.total != null ? parseFloat(invoice.total) : subtotal + vatAmount

  return (
    <div className="overflow-hidden rounded-md border-none">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-blue/40 text-text-1">
            <th className="px-4 py-3 text-left font-semibold">Item</th>
            <th className="px-4 py-3 text-left font-semibold">Energy (kWh)</th>
            <th className="px-4 py-3 text-left font-semibold">Tariff</th>
            <th className="px-4 py-3 text-left font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((row, i) => (
            <tr
              key={row.uid}
              className={i % 2 === 1 ? "bg-neutral-50" : "bg-white"}
            >
              <td className="px-4 py-3">{row.description}</td>
              <td className="px-4 py-3 text-left">
                {row.energy_kwh != null
                  ? parseFloat(row.energy_kwh).toFixed(2)
                  : "—"}
              </td>
              <td className="px-4 py-3 text-left">
                {row.tariff_rate != null ? fmtAmount(row.tariff_rate) : "—"}
              </td>
              <td className="px-4 py-3 text-left">
                {row.amount != null ? fmtAmount(row.amount) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-white text-sm">
          <tr>
            <td
              colSpan={3}
              className="text-text-1 px-4 py-2 text-right font-medium"
            >
              Sub Total
            </td>
            <td className="px-4 py-2 text-left">{fmtAmount(subtotal)}</td>
          </tr>
          <tr>
            <td
              colSpan={3}
              className="text-text-1 px-4 py-2 text-right font-medium"
            >
              VAT
            </td>
            <td className="px-4 py-2 text-left">{fmtAmount(vatAmount)}</td>
          </tr>
          <tr className="border-t font-semibold">
            <td colSpan={3} className="px-4 py-2 text-right text-lg">
              Total
            </td>
            <td className="px-4 py-2 text-left text-lg">{fmtAmount(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
