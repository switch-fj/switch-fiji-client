"use client"

import { Suspense, useMemo, useState } from "react"
import { UserPlus, Plus } from "lucide-react"
import { Button } from "@workspace/ui"
import DashboardHeaders from "./components/DashboardHeaders"
import SitesOverviewTable from "./components/SitesOverviewTable"
import AddClientModal from "./components/AddClientModal"
import AddSiteModal from "./components/AddSiteModal"
import { useAllClients } from "@/hooks/useClient"
import { useAllSitesWithMetrics, useSitesSummary } from "@/hooks/useSite"

function DashboardViewInner() {
  const [addClientOpen, setAddClientOpen] = useState(false)
  const [addSiteOpen, setAddSiteOpen] = useState(false)

  const { data: summaryData, isLoading: isLoadingSummary } = useSitesSummary()

  const { data: clients } = useAllClients()
  const clientsById = useMemo(
    () => new Map((clients ?? []).map((c) => [c.uid, c])),
    [clients]
  )

  const {
    data: sites,
    isLoading: isLoadingSites,
    isError: isSitesError,
  } = useAllSitesWithMetrics()

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeaders
        summary={summaryData?.data}
        isLoadingSummary={isLoadingSummary}
      />

      <AddClientModal
        open={addClientOpen}
        onClose={() => setAddClientOpen(false)}
      />
      <AddSiteModal open={addSiteOpen} onClose={() => setAddSiteOpen(false)} />

      <div className="flex items-center justify-between">
        <span className="text-text-1 text-xl font-semibold">Sites</span>
        {/* <Button
          variant="outlined"
          size="md"
          className="w-36 gap-2"
          onClick={() => setAddSiteOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Site
        </Button> */}
      </div>

      <SitesOverviewTable
        sites={sites ?? []}
        clientsById={clientsById}
        isLoading={isLoadingSites}
        isError={isSitesError}
      />

      <button
        onClick={() => setAddClientOpen(true)}
        className="bg-primary fixed right-30 bottom-8 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-opacity hover:opacity-90"
        aria-label="Add client"
      >
        <UserPlus className="h-6 w-6" />
      </button>
    </div>
  )
}

export default function DashboardView() {
  return (
    <Suspense fallback={null}>
      <DashboardViewInner />
    </Suspense>
  )
}
