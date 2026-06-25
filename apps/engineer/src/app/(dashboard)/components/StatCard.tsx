type StatCardProps = {
  label: string
  value: number | undefined
  subLabel: string
  isLoading?: boolean
}

export function StatCard({ label, value, subLabel, isLoading }: StatCardProps) {
  return (
    <div className="border-border/60 flex flex-1 flex-col gap-3 rounded-xl border bg-white px-5 py-4 shadow-sm">
      <span className="text-base text-[#1D1D1D]">{label}</span>
      <div className="flex items-center gap-2">
        {isLoading ? (
          <div className="bg-muted h-9 w-12 animate-pulse rounded" />
        ) : (
          <span className="text-4xl font-semibold text-[#1D1D1D]">
            {value ?? "—"}
          </span>
        )}
        <span className="text-xs text-[#1D1D1D]">{subLabel}</span>
      </div>
    </div>
  )
}
