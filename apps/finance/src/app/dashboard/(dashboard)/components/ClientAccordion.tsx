import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@switch-fiji/ui";
import type { ClientModel } from "@/types/client";

type ClientAccordionProps = {
  clients: ClientModel[];
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
          key={client.uid}
          value={client.uid}
          className="rounded-lg border bg-neutral-50/70"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex w-full items-center justify-between gap-2 text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {client.client_name}
                </span>
                <span className="flex items-center space-x-1 rounded-xs bg-primary/10 px-2 py-0.5 font-semibold">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-[10px] text-primary">
                    {client.sites_count ?? 0} site
                    {client.sites_count !== 1 ? "s" : ""}
                  </span>
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="border-t px-4 py-3">
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-[auto_auto] justify-start gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span>Email</span>
                <span className="font-semibold text-foreground">
                  {client.client_email}
                </span>

                <span>Client ID</span>
                <span className="font-semibold text-foreground">
                  {client.client_id ?? "—"}
                </span>

                <span>Sites</span>
                <span className="font-semibold text-foreground">
                  {client.sites_count ?? 0}
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
