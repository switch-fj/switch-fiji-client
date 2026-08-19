"use client"

import Link from "next/link"
import {
  Activity,
  AlertCircle,
  BatteryCharging,
  ChevronDown,
  ChevronLeft,
  HousePlus,
  Info,
  RadioTower,
  RefreshCw,
  Server,
  Sun,
  type LucideIcon,
} from "lucide-react"
import { useSiteDevices } from "@/hooks/useSitePanels"
import { toLocalDateTime } from "@/utils/date"
import type { SiteDeviceModel } from "@/types/engineer"

const MOCK_ALERTS = [
  { type: "Device warning", description: "Backup Meter is currently offline" },
  { type: "MPPT Health", description: "1.1 and 2.2 below functional" },
  { type: "Grid", description: "energy low" },
]

const CHART_LEGEND = [
  { label: "Solar", color: "#024159" },
  { label: "Grid", color: "#FA4F19" },
  { label: "Battery", color: "#00822E" },
  { label: "Consumption", color: "#E11D2E" },
  { label: "SOC", color: "#00AEEF" },
]

const CHART_TIMES = [
  "9:00am",
  "9:30am",
  "10:00am",
  "10:30am",
  "11:00am",
  "11:30am",
  "12:00pm",
  "12:30pm",
  "1:00pm",
  "1:30pm",
  "2:00pm",
  "2:30pm",
]

const CHART_Y_LABELS = ["+100", "+50", "+20", "0", "-20", "-50", "-100"]

type SiteDetailViewProps = {
  siteId: string
  siteName: string
  location?: string
  onBack: () => void
}

export function SiteDetailView({
  siteId,
  siteName,
  location,
  onBack,
}: SiteDetailViewProps) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-border/60 flex flex-wrap items-center justify-between gap-4 border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1D1D1D]">{siteName}</h1>
            {location && (
              <p className="text-muted-foreground text-sm">{location}</p>
            )}
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            href={`/sites/${siteId}/summary?name=${encodeURIComponent(siteName)}`}
            className="rounded-lg bg-[#024159] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Dashboard
          </Link>
        </nav>
      </div>

      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-wrap gap-4">
          <FlowGraphCard />
          <EnergyUsageCard />
        </div>

        <DevicesSection siteId={siteId} />

        <AlertsSection />
      </div>
    </div>
  )
}

type FlowTone = "blue" | "dark" | "navy" | "green" | "orange"

const FLOW_TONE_CLASSES: Record<FlowTone, string> = {
  blue: "bg-[#CCEFFC] text-[#00AEEF]",
  dark: "border-border/60 border bg-white text-[#1D1D1D]",
  navy: "bg-[#024159] text-white",
  green: "bg-[#00822E]/10 text-[#00822E]",
  orange: "bg-[#FA4F19]/10 text-[#FA4F19]",
}

function FlowNode({
  icon: Icon,
  value,
  left,
  top,
  tone,
}: {
  icon: LucideIcon
  value?: string
  left: string
  top: string
  tone: FlowTone
}) {
  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
      style={{ left, top }}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${FLOW_TONE_CLASSES[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      {value && (
        <span className="text-xs font-medium whitespace-nowrap text-[#1D1D1D]">
          {value}
        </span>
      )}
    </div>
  )
}

function FlowGraphCard() {
  return (
    <div className="border-border/60 min-w-[320px] flex-1 rounded-xl border p-5">
      <h3 className="mb-2 text-base font-semibold text-[#1D1D1D]">
        Flow Graph
      </h3>
      <div className="relative mx-auto mt-6 h-56 w-full max-w-[420px]">
        <svg
          viewBox="0 0 420 220"
          className="absolute inset-0 h-full w-full"
          fill="none"
        >
          <path d="M70 40 H150 V95" stroke="#00AEEF" strokeWidth="2" />
          <path d="M350 40 H270 V95" stroke="#1D1D1D" strokeWidth="2" />
          <path d="M70 180 H150 V125" stroke="#00822E" strokeWidth="2" />
          <path d="M350 180 H270 V125" stroke="#024159" strokeWidth="2" />
          <path
            d="M210 130 V172"
            stroke="#FA4F19"
            strokeWidth="2"
            markerEnd="url(#flow-arrow)"
          />
          <defs>
            <marker
              id="flow-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="4"
              refY="4"
              orient="auto"
            >
              <path d="M0,0 L8,4 L0,8 Z" fill="#FA4F19" />
            </marker>
          </defs>
        </svg>

        <FlowNode
          icon={Sun}
          value="90.52 kW"
          left="17%"
          top="18%"
          tone="blue"
        />
        <FlowNode
          icon={Activity}
          value="2.43 kW"
          left="83%"
          top="18%"
          tone="dark"
        />
        <FlowNode icon={Server} left="50%" top="45%" tone="navy" />
        <FlowNode
          icon={BatteryCharging}
          value="27.52 kW"
          left="17%"
          top="82%"
          tone="green"
        />
        <FlowNode
          icon={HousePlus}
          value="46.34 kW"
          left="50%"
          top="82%"
          tone="orange"
        />
        <FlowNode
          icon={RadioTower}
          value="34.34 kW"
          left="83%"
          top="82%"
          tone="navy"
        />
      </div>
    </div>
  )
}

const CHART_PATHS = {
  consumption:
    "M0,90 L44,82 L87,55 L131,28 L175,18 L218,22 L262,40 L305,65 L349,85 L393,90 L436,90 L480,90 Z",
  solar:
    "M0,90 L44,85 L87,70 L131,50 L175,42 L218,45 L262,55 L305,72 L349,86 L393,90 L436,90 L480,90 Z",
  battery:
    "M0,90 L44,90 L87,95 L131,120 L175,150 L218,168 L262,165 L305,140 L349,110 L393,92 L436,90 L480,90 Z",
  grid: "M0,92 L44,90 L87,88 L131,91 L175,93 L218,90 L262,89 L305,92 L349,94 L393,91 L436,90 L480,92",
  soc: "M0,20 L44,28 L87,38 L131,48 L175,58 L218,68 L262,78 L305,90 L349,102 L393,114 L436,128 L480,142",
}

function EnergyUsageCard() {
  return (
    <div className="border-border/60 min-w-[320px] flex-1 rounded-xl border p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#1D1D1D]">Energy usage</h3>
        <button className="border-border/60 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-[#1D1D1D]">
          This month <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex gap-4">
        <ul className="flex shrink-0 flex-col gap-2.5 pt-1">
          {CHART_LEGEND.map((l) => (
            <li
              key={l.label}
              className="flex items-center gap-2 text-sm text-[#1D1D1D]"
            >
              <span
                className="h-1.5 w-4 shrink-0 rounded-full"
                style={{ backgroundColor: l.color }}
              />
              {l.label}
            </li>
          ))}
        </ul>
        <div className="min-w-0 flex-1">
          <div className="flex gap-2">
            <div className="text-muted-foreground flex flex-col justify-between py-1 text-[10px]">
              {CHART_Y_LABELS.map((y) => (
                <span key={y}>{y}</span>
              ))}
            </div>
            <svg
              viewBox="0 0 480 180"
              className="h-40 w-full"
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1="90"
                x2="480"
                y2="90"
                stroke="#E3E3E3"
                strokeWidth="1"
              />
              <path
                d={CHART_PATHS.consumption}
                fill="#E11D2E"
                fillOpacity="0.15"
                stroke="#E11D2E"
                strokeWidth="1.5"
              />
              <path
                d={CHART_PATHS.solar}
                fill="#024159"
                fillOpacity="0.12"
                stroke="#024159"
                strokeWidth="1.5"
              />
              <path
                d={CHART_PATHS.battery}
                fill="#00822E"
                fillOpacity="0.15"
                stroke="#00822E"
                strokeWidth="1.5"
              />
              <path
                d={CHART_PATHS.grid}
                fill="none"
                stroke="#FA4F19"
                strokeWidth="1.5"
              />
              <path
                d={CHART_PATHS.soc}
                fill="none"
                stroke="#00AEEF"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <div className="text-muted-foreground mt-1 flex justify-between pl-8 text-[10px]">
            {CHART_TIMES.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const ONLINE_THRESHOLD_MINUTES = 15

function isDeviceOnline(lastSeenAt: string | null): boolean {
  if (!lastSeenAt) return false
  const minutesSince = (Date.now() - new Date(lastSeenAt).getTime()) / 60_000
  return minutesSince <= ONLINE_THRESHOLD_MINUTES
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1)
}

type DeviceTelemetry = {
  p_total_w?: number
  kwh_total?: number
}

function parseTelemetryReading(raw: string | null): DeviceTelemetry | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    return parsed && typeof parsed === "object"
      ? (parsed as DeviceTelemetry)
      : null
  } catch {
    return null
  }
}

function DeviceCard({ device }: { device: SiteDeviceModel }) {
  const online = isDeviceOnline(device.last_seen_at)
  const telemetry = parseTelemetryReading(device.recent_telemetry_reading)

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-[#1D1D1D]">
          {capitalize(device.device_type)} · Slave {device.slave_id}
        </span>
      </div>
      <div className="divide-border/40 divide-y rounded-lg bg-[#F2F2F2]">
        <div className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="text-muted-foreground">Slave ID</span>
          <span className="font-semibold text-[#1D1D1D]">
            {device.slave_id}
          </span>
        </div>
        {device.meter_role && (
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-muted-foreground">Meter Role</span>
            <span className="font-semibold text-[#1D1D1D]">
              {device.meter_role}
            </span>
          </div>
        )}
        {typeof telemetry?.p_total_w === "number" && (
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-muted-foreground">Total kW</span>
            <span className="font-semibold text-[#1D1D1D]">
              {(telemetry.p_total_w / 1000).toFixed(2)} kW
            </span>
          </div>
        )}
        {typeof telemetry?.kwh_total === "number" && (
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-muted-foreground">Total Energy</span>
            <span className="font-semibold text-[#1D1D1D]">
              {telemetry.kwh_total.toLocaleString()} kWh
            </span>
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="text-muted-foreground">Last Seen</span>
          <span className="font-semibold text-[#1D1D1D]">
            {device.last_seen_at
              ? toLocalDateTime(device.last_seen_at)
              : "Never"}
          </span>
        </div>
      </div>
      <div
        className={`mt-3 flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-semibold ${
          online
            ? "bg-green-100 text-green-700"
            : "bg-[#FA4F19]/15 text-[#B8380D]"
        }`}
      >
        {online ? "Online" : "Offline"}
        <Info className="h-4 w-4" />
      </div>
    </div>
  )
}

function DevicesSection({ siteId }: { siteId: string }) {
  const { data, isLoading, refetch, isFetching } = useSiteDevices(siteId)
  const devices = data?.data ?? []

  return (
    <div className="border-border/60 rounded-xl border">
      <div className="border-border/60 flex items-center justify-between border-b px-5 py-4">
        <h3 className="text-base font-semibold text-[#1D1D1D]">Devices</h3>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-[#FA4F19] hover:opacity-80 disabled:opacity-50"
          aria-label="Refresh devices"
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
        </button>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="bg-muted h-32 w-full animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : devices.length === 0 ? (
        <p className="text-muted-foreground px-5 py-8 text-center text-sm">
          No devices found for this site.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
          {devices.map((d) => (
            <DeviceCard key={d.uid} device={d} />
          ))}
        </div>
      )}
    </div>
  )
}

function AlertsSection() {
  return (
    <div className="border-border/60 rounded-xl border">
      <div className="px-5 py-4">
        <h3 className="text-base font-semibold text-[#1D1D1D]">Alerts</h3>
      </div>
      <div className="divide-border/40 divide-y">
        {MOCK_ALERTS.map((alert, i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-3.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="text-sm">
              <span className="font-semibold text-[#1D1D1D]">{alert.type}</span>{" "}
              <span className="text-muted-foreground">{alert.description}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
