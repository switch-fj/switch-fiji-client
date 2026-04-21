"use client"

import { useState } from "react"
import { Button } from "@workspace/ui"
import { Plus, Cpu, Radio } from "lucide-react"
import { useSites } from "@/hooks/useSite"
import type { ClientModel } from "@/types/client"
import { EnumContractType, EnumContractSystemMode } from "@/constants/mangle"
import AddSiteModal from "./AddSiteModal"
import CreateContractSheet from "./CreateContractSheet"
import ContractDetailsSheet from "./ContractDetailsSheet"
import ViewContractSheet from "./ViewContractSheet"

type ClientSitesPanelProps = {
  client?: ClientModel
}

export default function ClientSitesPanel({ client }: ClientSitesPanelProps) {
  const [addSiteOpen, setAddSiteOpen] = useState(false)
  const [contractSheet, setContractSheet] = useState<{
    siteUid: string
    siteName: string | null
  } | null>(null)
  const [detailsSheet, setDetailsSheet] = useState<{
    contractUid: string
    contractType: EnumContractType
    systemMode: EnumContractSystemMode
    currency: string
    siteName: string | null
  } | null>(null)
  const [viewSheet, setViewSheet] = useState<{
    contractUid: string
    siteName: string | null
  } | null>(null)
  const { data, isLoading, isError } = useSites(client?.uid)
  const sites = data?.data ?? []

  if (!client) {
    return (
      <div className="text-muted-foreground rounded-lg border bg-neutral-50/70 px-4 py-6 text-sm">
        Select a client to view their sites.
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            {isLoading
              ? "Loading sites..."
              : `${sites.length} site${sites.length !== 1 ? "s" : ""}`}
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setAddSiteOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Site
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
            <div className="rounded-sm bg-white py-3">
              <div className="flex items-center justify-between gap-2 px-4 py-3">
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="text-sm font-semibold">
                    {site.site_name ?? "Unnamed Site"}
                  </span>
                  {site.contract && (
                    <span className="bg-blue rounded-xs px-3 py-0.5 text-sm font-medium text-white">
                      {site.contract.contract_type} {site.contract.system_mode}
                    </span>
                  )}
                </div>
                {site.site_id && (
                  <span className="bg-primary rounded-xs px-3 py-1 text-xs font-semibold text-white">
                    {site.site_id}
                  </span>
                )}
              </div>

              <div className="mx-4 bg-neutral-100">
                <div className="text-muted-foreground space-y-3 px-4 py-3 text-xs">
                  <div className="grid grid-cols-[auto_auto] justify-start gap-x-6 gap-y-2">
                    <span>Site UID</span>
                    <span className="text-foreground font-mono font-semibold">
                      {site.uid.slice(0, 8)}…
                    </span>

                    <span>Client UID</span>
                    <span className="text-foreground font-mono font-semibold">
                      {site.client_uid.slice(0, 8)}…
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2">
                      <Radio className="text-primary h-4 w-4" />
                      <div>
                        <p className="text-muted-foreground text-[10px]">
                          Gateway ID
                        </p>
                        <p className="text-foreground text-xs font-semibold">
                          {site.gateway_id ?? "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2">
                      <Cpu className="text-primary h-4 w-4" />
                      <div>
                        <p className="text-muted-foreground text-[10px]">
                          Firmware
                        </p>
                        <p className="text-foreground text-xs font-semibold">
                          {site.firmware ?? "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 border-t px-4 py-3">
                  <Button
                    className="min-w-[140px] rounded-sm text-sm"
                    size="lg"
                    variant="primary"
                  >
                    View Invoice
                  </Button>
                  {site.contract ? (
                    <Button
                      variant="outlined"
                      className="min-w-[140px] rounded-sm text-sm"
                      size="lg"
                      onClick={() =>
                        setViewSheet({
                          contractUid: site.contract!.uid,
                          siteName: site.site_name,
                        })
                      }
                    >
                      View Contract
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      className="min-w-[140px] rounded-sm text-sm"
                      size="lg"
                      onClick={() =>
                        setContractSheet({
                          siteUid: site.uid,
                          siteName: site.site_name,
                        })
                      }
                    >
                      Create Contract
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddSiteModal
        open={addSiteOpen}
        clientUid={client.uid}
        onClose={() => setAddSiteOpen(false)}
      />

      {contractSheet && (
        <CreateContractSheet
          open={!!contractSheet}
          onClose={() => setContractSheet(null)}
          clientUid={client.uid}
          clientName={client.client_name}
          siteUid={contractSheet.siteUid}
          siteName={contractSheet.siteName}
          onContractCreated={(
            contractUid,
            contractType,
            systemMode,
            currency
          ) => {
            setDetailsSheet({
              contractUid,
              contractType,
              systemMode,
              currency,
              siteName: contractSheet.siteName,
            })
          }}
        />
      )}

      {viewSheet && (
        <ViewContractSheet
          open={!!viewSheet}
          onClose={() => setViewSheet(null)}
          contractUid={viewSheet.contractUid}
          clientName={client.client_name}
          clientEmail={client.client_email}
          siteName={viewSheet.siteName}
        />
      )}

      {detailsSheet && (
        <ContractDetailsSheet
          open={!!detailsSheet}
          onClose={() => setDetailsSheet(null)}
          clientUid={client.uid}
          contractUid={detailsSheet.contractUid}
          contractType={detailsSheet.contractType}
          systemMode={detailsSheet.systemMode}
          currency={detailsSheet.currency}
          clientName={client.client_name}
          siteName={detailsSheet.siteName}
        />
      )}
    </>
  )
}
