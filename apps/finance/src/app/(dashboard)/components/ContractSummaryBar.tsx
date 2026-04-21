type Props = {
  clientName: string
  siteName: string | null
  contractRef: string
  contractTypeLabel: string
  systemModeLabel: string
  currency: string
  clientEmail?: string
}

export default function ContractSummaryBar({
  clientName,
  siteName,
  contractRef,
  contractTypeLabel,
  systemModeLabel,
  currency,
  clientEmail,
}: Props) {
  return (
    <div
      className="border-border grid border-b px-8 py-5 text-sm"
      style={{
        gridTemplateColumns: clientEmail ? "440px 290px 1fr" : "440px 1fr",
      }}
    >
      <div className="space-y-1.5">
        <div className="grid grid-cols-[140px_1fr] gap-1">
          <span className="text-text-1 font-semibold">Customer:</span>
          <span className="text-text-1">{clientName}</span>
        </div>
        <div className="grid grid-cols-[140px_1fr] gap-1">
          <span className="text-text-1 font-semibold">Site:</span>
          <span className="text-text-1">{siteName ?? "—"}</span>
        </div>
        <div className="grid grid-cols-[140px_1fr] gap-1">
          <span className="text-text-1 font-semibold">Contract reference:</span>
          <span className="text-text-1">{contractRef}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="grid grid-cols-[140px_1fr] gap-1">
          <span className="text-text-1 font-semibold">Contract Type</span>
          <span className="text-text-1">{contractTypeLabel}</span>
        </div>
        <div className="grid grid-cols-[140px_1fr] gap-1">
          <span className="text-text-1 font-semibold">System Mode</span>
          <span className="text-text-1">{systemModeLabel}</span>
        </div>
        <div className="grid grid-cols-[140px_1fr] gap-1">
          <span className="text-text-1 font-semibold">Currency</span>
          <span className="text-text-1">{currency}</span>
        </div>
      </div>

      {clientEmail !== undefined && (
        <div className="space-y-1.5">
          <div className="grid grid-cols-[170px_1fr] gap-1">
            <span className="text-text-1 font-semibold">
              Client email (for invoice)
            </span>
            <span className="text-text-1">{clientEmail || "—"}</span>
          </div>
        </div>
      )}
    </div>
  )
}
