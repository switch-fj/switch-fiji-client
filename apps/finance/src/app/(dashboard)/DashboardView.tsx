"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { UserPlus } from "lucide-react"
import DashboardHeaders from "./components/DashboardHeaders"
import ClientAccordion from "./components/ClientAccordion"
import ClientSitesPanel from "./components/ClientSitesPanel"
import AddClientModal from "./components/AddClientModal"
import { useClients } from "@/hooks/useClient"

function DashboardViewInner() {
  const [addClientOpen, setAddClientOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const [activeClientId, setActiveClientId] = useState(
    () => searchParams.get("clientUid") ?? ""
  )

  const { data, isLoading, isError } = useClients()
  const clients = data?.data?.items ?? []

  const activeClient = useMemo(
    () => clients.find((c) => c.uid === activeClientId),
    [clients, activeClientId]
  )

  const handleActiveChange = (id: string) => {
    setActiveClientId(id)
    router.replace(id ? "?clientUid=" + encodeURIComponent(id) : "?")
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeaders
        totalCount={clients.length}
        onAddClient={() => setAddClientOpen(true)}
      />
      <AddClientModal
        open={addClientOpen}
        onClose={() => setAddClientOpen(false)}
      />

      <div className="grid lg:h-[calc(100vh-310px)] lg:grid-cols-[540px_minmax(0,1fr)]">
        <section className="border-red space-y-3 overflow-y-auto border bg-white p-4">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-text-1 text-xl">Clients</span>
            <span className="text-text-1 text-xs font-normal">
              All client will display here
            </span>
          </div>

          {isLoading && (
            <div className="text-muted-foreground py-6 text-center text-sm">
              Loading clients…
            </div>
          )}

          {isError && (
            <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-6 text-sm">
              Failed to load clients. Please refresh.
            </div>
          )}

          {!isLoading && !isError && (
            <ClientAccordion
              clients={clients}
              activeClientId={activeClientId}
              onActiveChange={handleActiveChange}
            />
          )}
        </section>

        <section className="space-y-4 overflow-y-auto bg-[#1D1D1D]/5 p-4">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-text-1 text-lg font-semibold">Sites</span>
            <span className="text-text-1 text-xs">
              selecr a client to view site
            </span>
          </div>

          <ClientSitesPanel client={activeClient} />
        </section>
      </div>

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
