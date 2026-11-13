import {
  BatteryCharging,
  Cpu,
  LayoutGrid,
  Sun,
  type LucideIcon,
} from "lucide-react"

/** Sections of the site's System setup page, in tab order. `key` is the
 * `?view=` value, so links can open a section directly. */
export const SETUP_VIEWS: {
  key: "mppt" | "panels" | "pv" | "battery"
  label: string
  hint: string
  icon: LucideIcon
}[] = [
  {
    key: "mppt",
    label: "MPPT check",
    hint: "Charts and daily function check per MPPT",
    icon: Cpu,
  },
  {
    key: "panels",
    label: "Panel config",
    hint: "Panels and string wiring",
    icon: LayoutGrid,
  },
  {
    key: "pv",
    label: "PV summary",
    hint: "System size, commissioning and degradation",
    icon: Sun,
  },
  {
    key: "battery",
    label: "Battery SOC",
    hint: "Battery configuration and state of charge",
    icon: BatteryCharging,
  },
]

export type SetupViewKey = (typeof SETUP_VIEWS)[number]["key"]

export const setupHref = (
  siteId: string,
  siteName: string,
  view: SetupViewKey
) =>
  `/sites/${siteId}/summary?view=${view}&name=${encodeURIComponent(siteName)}`
