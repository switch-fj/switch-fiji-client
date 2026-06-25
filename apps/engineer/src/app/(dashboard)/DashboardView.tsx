"use client"

import { useEngineerStats } from "@/hooks/useEngineer"
import { StatCard } from "./components/StatCard"
import { ClientStatusTable } from "./components/ClientStatusTable"
import { AlertsPanel } from "./components/AlertsPanel"

export default function DashboardView() {
  const { data: statsData, isLoading: isLoadingStats } = useEngineerStats()
  const stats = statsData?.data

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex gap-4">
        <StatCard
          label="Clients"
          value={stats?.clients}
          subLabel="Active clients"
          isLoading={isLoadingStats}
        />
        <StatCard
          label="Sites"
          value={stats?.sites}
          subLabel="Monitored locations"
          isLoading={isLoadingStats}
        />
        <StatCard
          label="Devices"
          value={stats?.devices}
          subLabel="Total devices"
          isLoading={isLoadingStats}
        />
      </div>

      <ClientStatusTable />

      <AlertsPanel />
    </div>
  )
}
