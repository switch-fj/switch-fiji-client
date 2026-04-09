import { Button } from "@switch-fiji/ui";
import type { ClientSummary } from "./clients";
import { EnumContractDetailsStatus } from "@/constants/mangle";
import { ChartLine } from "lucide-react";

const formatStatus = (status: EnumContractDetailsStatus) =>
  status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

type ClientSitesPanelProps = {
  client?: ClientSummary;
};

export default function ClientSitesPanel({ client }: ClientSitesPanelProps) {
  if (!client?.sites?.length) {
    return (
      <div className="rounded-lg border bg-neutral-50/70 px-4 py-6 text-sm text-muted-foreground">
        No sites available for this client yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {client.sites.map((site) => (
        <div key={site.name} className="rounded-lg border bg-text-1 0">
          <div className="bg-white rounded-sm py-3">
            <div className="flex items-center justify-between gap-2  px-4 py-3">
              <span className="text-sm font-semibold">{site.name}</span>
              <span
                className={`rounded-xs px-4 py-2 text-xs font-semibold text-white flex items-center gap-2 ${site.tagTone}`}
              >
                <ChartLine size={16} />
                {site.contractMode} {site.contractType}
              </span>
            </div>
            <div className="bg-neutral-100 mx-4">
              <div className="space-y-3 px-4 py-3 text-xs text-muted-foreground">
                <div className="grid grid-cols-[auto_auto] justify-start gap-x-6 gap-y-2">
                  <span>Expected Generation (YTD)</span>
                  <span className="font-semibold text-foreground">
                    {site.expected}
                  </span>

                  <span>Actual Generation (YTD)</span>
                  <span className="font-semibold text-foreground">
                    {site.actual}
                  </span>

                  <span>Billing Progress</span>
                  <span className="font-semibold text-foreground">
                    {site.billing}
                  </span>

                  <span>Cumulative kWh (YTD)</span>
                  <span className="font-semibold text-foreground">
                    {site.cumulative}
                  </span>
                </div>
                <div
                  className={`rounded-md px-3 py-2 text-xs font-semibold ${site.alertTone}`}
                >
                  {site.alert}
                </div>
                <div className="rounded-md border bg-white px-3 py-2">
                  <div className="text-xs font-semibold text-foreground">
                    Contract details
                  </div>
                  <div className="mt-2 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                    <div className="flex items-center justify-between gap-3">
                      <span>Type</span>
                      <span className="font-semibold text-foreground">
                        {site.contractType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>System mode</span>
                      <span className="font-semibold text-foreground">
                        {site.contractMode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Status</span>
                      <span className="font-semibold text-foreground">
                        {formatStatus(site.contractStatus)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Billing frequency</span>
                      <span className="font-semibold text-foreground">
                        {site.billingFrequency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 border-t px-4 py-3 max-w-[500px] ">
                <Button
                  className="min-w-[140px] text-sm rounded-sm "
                  size="lg"
                  variant="primary"
                >
                  View invoice
                </Button>
                <Button
                  variant="outlined"
                  className="min-w-[140px] text-sm rounded-sm"
                  size="lg"
                >
                  View Site Contract
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
