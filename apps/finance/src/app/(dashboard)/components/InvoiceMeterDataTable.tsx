import type { InvoiceRespModel } from "@/types/invoice"
import { fmtAmount } from "@/utils/invoice"

type Props = { invoice: InvoiceRespModel }

export default function InvoiceMeterDataTable({ invoice }: Props) {
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
            return (
              <tr
                key={row.uid}
                className={i % 2 === 1 ? "bg-neutral-50" : "bg-white"}
              >
                <td className="px-4 py-3">{row.label}</td>
                <td className="px-4 py-3 text-right">{start.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{end.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  {(end - start).toFixed(2)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
