import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from "@switch-fiji/ui";
import type { ClientSummary } from "./clients";
import { ArrowRight, ChevronRight } from "lucide-react";

type ClientAccordionProps = {
  clients: ClientSummary[];
  activeClientId: string;
  onActiveChange: (value: string) => void;
};

export default function ClientAccordion({
  clients,
  activeClientId,
  onActiveChange,
}: ClientAccordionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      value={activeClientId}
      onValueChange={onActiveChange}
      className="space-y-2"
    >
      {clients.map((client) => (
        <AccordionItem
          key={client.id}
          value={client.id}
          className="rounded-lg border bg-neutral-50/70"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex w-full items-center justify-between gap-2 text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{client.name}</span>
                <span
                  className={`flex items-center rounded-xs px-2 py-0.5 font-semibold ${client.statusTone} space-x-1`}
                >
                  {" "}
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
                  <span className="text-[10px]">{client.status}</span>
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="border-t px-4 py-3">
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-[auto_auto] justify-start gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span>Expected Generation (YTD)</span>
                <span className="font-semibold text-foreground">
                  {client.metrics.expected}
                </span>

                <span>Actual Generation (YTD)</span>
                <span className="font-semibold text-foreground">
                  {client.metrics.actual}
                </span>

                <span>Billing Progress</span>
                <span className="font-semibold text-foreground">
                  {client.metrics.billing}
                </span>

                <span>Deviation</span>
                <span className="font-semibold text-red-500">
                  {client.metrics.deviation}
                </span>
              </div>
              <Button
                variant="outlined"
                size="lg"
                className="w-[320px] text-sm rounded-sm"
              >
                View all Sites <ChevronRight />
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
