export type BadgeStatus = "active" | "all_online" | "meter_offline"

type StatusBadgeProps = {
  status: BadgeStatus
  meterOfflineCount?: number
}

export function StatusBadge({ status, meterOfflineCount }: StatusBadgeProps) {
  if (status === "meter_offline") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-none bg-[#FA4F19]/25 px-3 py-1 text-sm font-medium text-orange-700">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FA4F19]" />
        {meterOfflineCount ?? 1} Meter offline
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-none bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
      <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
      {status === "all_online" ? "All online" : "Active"}
    </span>
  )
}
