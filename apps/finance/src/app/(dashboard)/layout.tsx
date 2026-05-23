"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@workspace/ui"
import { useStore } from "@/store"
import { DASHBOARD_LINKS } from "@/constants/routes"
import QueryProvider from "@/providers/QueryProvider"
import {
  TZ_TEST_OPTIONS,
  setTimezoneOverride,
  localTimezone,
} from "@/utils/date"

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function formatClock(date: Date, tz: string) {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: tz,
  })
}

function TzTester() {
  const [value, setValue] = useState("")
  const now = useClock()

  useEffect(() => {
    const stored = localStorage.getItem("tz_override") ?? ""
    setValue(stored)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tz = e.target.value
    setValue(tz)
    setTimezoneOverride(tz || null)
    window.location.reload()
  }

  const localTz = localTimezone()
  const isOverridden = !!value

  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
      {/* UTC clock */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-mono text-xs font-bold text-white tabular-nums">
          {formatClock(now, "UTC")}
        </span>
        <span className="text-[9px] font-medium tracking-widest text-[#A1A1A1] uppercase">
          UTC
        </span>
      </div>

      <div className="h-6 w-px bg-white/15" />

      {/* Local clock */}
      <div className="flex flex-col items-center gap-0.5">
        <span
          className={`font-mono text-xs font-bold tabular-nums ${isOverridden ? "text-yellow-300" : "text-white"}`}
        >
          {formatClock(now, localTz)}
        </span>
        <span
          className={`text-[9px] font-medium tracking-widest uppercase ${isOverridden ? "text-yellow-400" : "text-[#A1A1A1]"}`}
        >
          Local
        </span>
      </div>

      <div className="h-6 w-px bg-white/15" />

      {/* TZ selector */}
      <div className="flex flex-col items-center gap-0.5">
        <select
          value={value}
          onChange={handleChange}
          className={`rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white transition-colors outline-none hover:bg-white/20 ${isOverridden ? "ring-1 ring-yellow-400/60" : ""}`}
        >
          {TZ_TEST_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-black">
              {opt.label}
            </option>
          ))}
        </select>
        <span
          className={`text-[9px] font-medium tracking-widest uppercase ${isOverridden ? "text-yellow-400" : "text-[#A1A1A1]"}`}
        >
          {isOverridden ? "⚠ override" : "system tz"}
        </span>
      </div>
    </div>
  )
}

type DashboardLayoutProps = {
  children: React.ReactNode
}

export default function FinanceDashboardLayout({
  children,
}: DashboardLayoutProps) {
  const router = useRouter()
  const { AuthStore } = useStore()

  useEffect(() => {
    if (!AuthStore.accessToken) {
      router.replace("/auth/login")
    }
  }, [AuthStore.accessToken, router])

  const handleLogout = useCallback(async () => {
    AuthStore.logout()
    await new Promise((resolve) => setTimeout(resolve, 800))
    router.replace("/auth/login")
  }, [AuthStore, router])

  return (
    <QueryProvider>
      <DashboardLayout
        title="Finance"
        links={DASHBOARD_LINKS}
        onLogout={handleLogout}
        headerRight={<TzTester />}
      >
        {children}
      </DashboardLayout>
    </QueryProvider>
  )
}
