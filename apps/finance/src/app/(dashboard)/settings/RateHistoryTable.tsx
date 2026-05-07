type Row = {
  uid: string
  rate: string | number | null
  effective_from: string
  effective_to: string | null
}

type Props = {
  title: string
  rows: Row[]
  rateLabel: string
  formatRate: (rate: string | number | null) => string
  isLoading: boolean
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function RateHistoryTable({
  title,
  rows,
  rateLabel,
  formatRate,
  isLoading,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold">{title}</p>
      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-[#E8EEF2] text-left">
              <th className="px-4 py-3 font-semibold">{rateLabel}</th>
              <th className="px-4 py-3 font-semibold">Effective From</th>
              <th className="px-4 py-3 font-semibold">Effective To</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <>
                {[0, 1, 2].map((i) => (
                  <tr
                    key={i}
                    className={i % 2 === 1 ? "bg-neutral-50" : "bg-white"}
                  >
                    {[0, 1, 2, 3].map((j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-text-1 px-4 py-8 text-center text-sm"
                >
                  No history yet
                </td>
              </tr>
            ) : (
              rows.map((row, i) => {
                const isCurrent = row.effective_to === null
                return (
                  <tr
                    key={row.uid}
                    className={i % 2 === 1 ? "bg-neutral-50" : "bg-white"}
                  >
                    <td className="px-4 py-3 font-medium">
                      {formatRate(row.rate)}
                    </td>
                    <td className="text-text-1 px-4 py-3">
                      {fmtDate(row.effective_from)}
                    </td>
                    <td className="text-text-1 px-4 py-3">
                      {row.effective_to ? fmtDate(row.effective_to) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {isCurrent ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          Current
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-500">
                          Expired
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
