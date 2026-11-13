import type { MaintenanceType } from "@/types/engineer"

export const MAINTENANCE_TYPE_OPTIONS: {
  value: MaintenanceType
  label: string
}[] = [
  { value: "cleaning", label: "Cleaning" },
  { value: "servicing", label: "Servicing" },
  { value: "repair", label: "Repair" },
  { value: "other", label: "Other" },
]

export const MAINTENANCE_TYPE_LABEL: Record<MaintenanceType, string> = {
  cleaning: "Cleaning",
  servicing: "Servicing",
  repair: "Repair",
  other: "Other",
}

// Same tones as the site Flow Graph nodes, so colours mean the same thing
// across the page.
export const MAINTENANCE_TYPE_TONE: Record<MaintenanceType, string> = {
  cleaning: "bg-[#CCEFFC] text-[#0077A3]",
  servicing: "bg-[#024159]/10 text-[#024159]",
  repair: "bg-[#FA4F19]/10 text-[#B8380D]",
  other: "bg-neutral-100 text-neutral-600",
}
