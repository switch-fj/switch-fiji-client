"use client"

import { useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@workspace/ui"
import { useStore } from "@/store"
import { DASHBOARD_LINKS } from "@/constants/routes"
import QueryProvider from "@/providers/QueryProvider"

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
      >
        {children}
      </DashboardLayout>
    </QueryProvider>
  )
}
