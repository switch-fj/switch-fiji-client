"use client";

"use client";
import { useMemo, useState } from "react";
import DashboardHeaders from "./components/DashboardHeaders";
import ClientAccordion from "./components/ClientAccordion";
import ClientSitesPanel from "./components/ClientSitesPanel";
import { clients } from "./components/clients";

export default function DashboardView() {
  const [activeClientId, setActiveClientId] = useState(clients[0]?.id ?? "");
  const activeClient = useMemo(
    () =>
      activeClientId
        ? clients.find((client) => client.id === activeClientId)
        : undefined,
    [activeClientId],
  );

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-border/60 bg-white p-6">
      <DashboardHeaders />
      <div className="grid lg:grid-cols-[540px_minmax(0,1fr)]">
        <section className="space-y-3 border border-red p-4 bg-white">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-lg text-text-1">Clients</span>
            <span className="text-xs font-medium text-text-1">
              All clients will display here
            </span>
          </div>

          <ClientAccordion
            clients={clients}
            activeClientId={activeClientId}
            onActiveChange={setActiveClientId}
          />
        </section>

        <section className="space-y-4 bg-[#1D1D1D]/5 p-4">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Sites</span>
            <span className="text-xs font-medium text-muted-foreground">
              Select a Client to view site
            </span>
          </div>

          <ClientSitesPanel client={activeClient} />
        </section>
      </div>
    </div>
  );
}
