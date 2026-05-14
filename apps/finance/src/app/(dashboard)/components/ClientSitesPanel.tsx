"use client"

import { Fragment, Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@workspace/ui"
import { Plus, ExternalLink } from "lucide-react"
import { useSites, useSiteStats } from "@/hooks/useSite"
import type { ClientModel } from "@/types/client"
import { EnumContractType, EnumContractSystemMode } from "@/constants/mangle"
import AddSiteModal from "./AddSiteModal"
import CreateContractSheet from "./CreateContractSheet"
import ContractDetailsSheet from "./ContractDetailsSheet"
import ViewContractSheet from "./ViewContractSheet"
import ViewInvoiceSheet from "./ViewInvoiceSheet"

type ClientSitesPanelProps = {
  client?: ClientModel
}

const STAT_LABELS: Record<string, string> = {
  power_kw: "Power (kW)",
  energy_today_kwh: "Energy Today (kWh)",
  energy_month_kwh: "Energy This Month (kWh)",
  energy_total_kwh: "Total Energy (kWh)",
  voltage: "Voltage (V)",
  current: "Current (A)",
  frequency: "Frequency (Hz)",
  state_of_charge: "State of Charge (%)",
  grid_power: "Grid Power (kW)",
  status: "Status",
}

const EXCLUDED_KEYS = new Set(["site_uid", "status"])

const formatKey = (key: string) =>
  STAT_LABELS[key] ??
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

const isIsoDate = (v: string) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)

const formatStatValue = (v: string | number | null | undefined): string => {
  if (typeof v !== "string" || !isIsoDate(v)) return String(v)
  const d = new Date(v)
  if (isNaN(d.getTime())) return v
  return d.toLocaleString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  })
}

function SiteStatsGrid({ siteUid }: { siteUid: string }) {
  const { stats, error } = useSiteStats(siteUid)

  if (error) {
    return <p className="text-muted-foreground text-xs">Stats unavailable.</p>
  }

  if (!stats || stats.status === "computing") {
    return <p className="text-muted-foreground text-xs">Computing stats…</p>
  }

  const entries = Object.entries(stats).filter(
    ([k, v]) => !EXCLUDED_KEYS.has(k) && v !== null && v !== undefined
  )

  if (entries.length === 0) {
    return <p className="text-muted-foreground text-xs">No stats available.</p>
  }

  return (
    <div className="grid grid-cols-[auto_auto] justify-start gap-x-6 gap-y-2">
      {entries.map(([key, value]) => (
        <Fragment key={key}>
          <span>{formatKey(key)}</span>
          <span className="text-foreground font-mono font-semibold">
            {formatStatValue(value)}
          </span>
        </Fragment>
      ))}
    </div>
  )
}

function ClientSitesPanelInner({ client }: ClientSitesPanelProps) {
  const [addSiteOpen, setAddSiteOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Client info: prefer live prop, fall back to URL params (survives refresh)

  const clientUid = client?.uid ?? searchParams.get("clientUid") ?? ""
  const clientName = client?.client_name ?? searchParams.get("clientName") ?? ""
  const clientEmail =
    client?.client_email ?? searchParams.get("clientEmail") ?? ""

  const openSheet = (params: Record<string, string>) => {
    router.replace(
      "?" +
        new URLSearchParams({
          clientUid,
          clientName,
          clientEmail,
          ...params,
        }).toString()
    )
  }

  const closeSheet = () => {
    const params = new URLSearchParams()
    if (clientUid) params.set("clientUid", clientUid)
    const qs = params.toString()
    router.replace(qs ? "?" + qs : "?")
  }

  const sheet = searchParams.get("sheet")

  const contractSheet =
    sheet === "create"
      ? {
          siteUid: searchParams.get("siteUid")!,
          siteName: searchParams.get("siteName"),
        }
      : null

  const viewSheet =
    sheet === "view"
      ? {
          contractUid: searchParams.get("contractUid")!,
          siteName: searchParams.get("siteName"),
        }
      : null

  const detailsSheet =
    sheet === "details"
      ? {
          contractUid: searchParams.get("contractUid")!,
          contractType: searchParams.get("contractType") as EnumContractType,
          systemMode: searchParams.get("systemMode") as EnumContractSystemMode,
          currency: searchParams.get("currency")!,
          siteName: searchParams.get("siteName"),
        }
      : null

  const invoiceSheet =
    sheet === "invoice"
      ? {
          siteUid: searchParams.get("siteUid")!,
          siteName: searchParams.get("siteName"),
          contractUid: searchParams.get("contractUid") || null,
        }
      : null

  const { data, isLoading, isError } = useSites(client?.uid)
  const sites = data?.data ?? []

  return (
    <>
      {!client ? (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center">
          <span className="text-text-1 text-2xl font-semibold">
            No Client Selected
          </span>
          <span className="text-text-1 text-sm">
            Select a client to view site
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outlined"
              className="w-36"
              size="md"
              onClick={() => setAddSiteOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add more Site
            </Button>
          </div>

          {isLoading && (
            <div className="text-muted-foreground rounded-lg border bg-neutral-50/70 px-4 py-6 text-sm">
              Loading sites…
            </div>
          )}

          {isError && (
            <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-6 text-sm">
              Failed to load sites. Please try again.
            </div>
          )}

          {!isLoading && !isError && sites.length === 0 && (
            <div className="text-muted-foreground rounded-lg border bg-neutral-50/70 px-4 py-6 text-sm">
              No sites yet for{" "}
              <span className="text-foreground font-medium">
                {client.client_name}
              </span>
              . Add one to get started.
            </div>
          )}

          {sites.map((site) => (
            <div key={site.uid} className="bg-text-1 rounded-lg border">
              <div className="rounded-md bg-white pb-3">
                <div className="flex items-center justify-between gap-2 px-4 py-2">
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="text-sm font-semibold">
                      {site.site_name ?? "Unnamed Site"}
                    </span>
                    {site.contract && (
                      <span className="bg-blue rounded-xs px-3 py-0.5 text-sm font-medium text-white">
                        {site.contract.contract_type}{" "}
                        {site.contract.system_mode}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mx-4 rounded-md bg-neutral-100">
                  <div className="text-muted-foreground space-y-3 px-4 py-3 text-xs">
                    <SiteStatsGrid siteUid={site.uid} />
                  </div>

                  <div className="flex gap-2 border-t px-4 py-3">
                    <Button
                      className="max-w-34 gap-2 rounded-sm text-sm"
                      size="lg"
                      variant="primary"
                      onClick={() =>
                        router.push(
                          `/sites/${site.uid}?` +
                            new URLSearchParams({
                              clientUid,
                              ...(site.contract?.uid
                                ? { contractUid: site.contract.uid }
                                : {}),
                            }).toString()
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Site
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {client && (
        <AddSiteModal
          open={addSiteOpen}
          clientUid={client.uid}
          onClose={() => setAddSiteOpen(false)}
        />
      )}

      {contractSheet && clientUid && (
        <CreateContractSheet
          open={!!contractSheet}
          onClose={closeSheet}
          clientUid={clientUid}
          clientName={clientName}
          siteUid={contractSheet.siteUid}
          siteName={contractSheet.siteName}
          onContractCreated={(
            contractUid,
            contractType,
            systemMode,
            currency
          ) => {
            openSheet({
              sheet: "details",
              contractUid,
              contractType,
              systemMode,
              currency,
              siteName: contractSheet.siteName ?? "",
            })
          }}
        />
      )}

      {viewSheet && clientUid && (
        <ViewContractSheet
          open={!!viewSheet}
          onClose={closeSheet}
          contractUid={viewSheet.contractUid}
          clientName={clientName}
          clientEmail={clientEmail}
          siteName={viewSheet.siteName}
        />
      )}

      {invoiceSheet && clientUid && (
        <ViewInvoiceSheet
          open={!!invoiceSheet}
          onClose={closeSheet}
          clientName={clientName}
          siteName={invoiceSheet.siteName}
          billingEmail={clientEmail}
          contractUid={invoiceSheet.contractUid}
        />
      )}

      {detailsSheet && clientUid && (
        <ContractDetailsSheet
          open={!!detailsSheet}
          onClose={closeSheet}
          clientUid={clientUid}
          contractUid={detailsSheet.contractUid}
          contractType={detailsSheet.contractType}
          systemMode={detailsSheet.systemMode}
          currency={detailsSheet.currency}
          clientName={clientName}
          siteName={detailsSheet.siteName}
        />
      )}
    </>
  )
}

export default function ClientSitesPanel({ client }: ClientSitesPanelProps) {
  return (
    <Suspense fallback={null}>
      <ClientSitesPanelInner client={client} />
    </Suspense>
  )
}
