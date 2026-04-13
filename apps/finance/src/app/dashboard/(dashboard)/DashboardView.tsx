"use client";

import { useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import DashboardHeaders from "./components/DashboardHeaders";
import ClientAccordion from "./components/ClientAccordion";
import ClientSitesPanel from "./components/ClientSitesPanel";
import AddClientModal from "./components/AddClientModal";
import { useClients } from "@/hooks/useClient";

export default function DashboardView() {
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [activeClientId, setActiveClientId] = useState("");

  const { data, isLoading, isError } = useClients();
  const clients = data?.data?.items ?? [];

  const activeClient = useMemo(
    () => clients.find((c) => c.uid === activeClientId),
    [clients, activeClientId],
  );

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-border/60 bg-white p-6">
      <DashboardHeaders
        totalCount={clients.length}
        onAddClient={() => setAddClientOpen(true)}
      />
      <AddClientModal
        open={addClientOpen}
        onClose={() => setAddClientOpen(false)}
      />

      <div className="grid lg:grid-cols-[540px_minmax(0,1fr)] lg:h-[calc(100vh-220px)]">
        <section className="space-y-3 border border-red p-4 bg-white overflow-y-auto">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-lg text-text-1">Clients</span>
            <span className="text-xs font-medium text-text-1">
              {isLoading ? "Loading…" : `${clients.length} total`}
            </span>
          </div>

          {isLoading && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Loading clients…
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-sm text-destructive">
              Failed to load clients. Please refresh.
            </div>
          )}

          {!isLoading && !isError && (
            <ClientAccordion
              clients={clients}
              activeClientId={activeClientId}
              onActiveChange={setActiveClientId}
            />
          )}
        </section>

        <section className="space-y-4 bg-[#1D1D1D]/5 p-4 overflow-y-auto">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Sites</span>
            <span className="text-xs font-medium text-muted-foreground">
              {activeClient ? activeClient.client_name : "Select a client"}
            </span>
          </div>

          <ClientSitesPanel client={activeClient} />
        </section>
      </div>

      <button
        onClick={() => setAddClientOpen(true)}
        className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:opacity-90 transition-opacity"
        aria-label="Add client"
      >
        <UserPlus className="h-6 w-6" />
      </button>
    </div>
  );
}
