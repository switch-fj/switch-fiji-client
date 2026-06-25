"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
} from "@workspace/ui"
import { useUpdateSite } from "@/hooks/useEngineer"
import type { EngineeringDashboardSite } from "@/types/engineer"

type EditSiteDialogProps = {
  site: EngineeringDashboardSite
  clientUid: string
  isOpen: boolean
  onClose: () => void
}

export function EditSiteDialog({
  site,
  clientUid,
  isOpen,
  onClose,
}: EditSiteDialogProps) {
  const [siteName, setSiteName] = useState(site.site_name ?? "")
  const [gatewayId, setGatewayId] = useState(site.gateway_id)
  const [firmware, setFirmware] = useState(site.firmware ?? "")
  const [siteId, setSiteId] = useState("")

  const { mutate, isPending } = useUpdateSite(clientUid)

  useEffect(() => {
    if (isOpen) {
      setSiteName(site.site_name ?? "")
      setGatewayId(site.gateway_id)
      setFirmware(site.firmware ?? "")
      setSiteId("")
    }
  }, [isOpen, site])

  const handleSave = () => {
    mutate(
      {
        siteUid: site.uid,
        payload: {
          site_name: siteName || null,
          gateway_id: gatewayId || null,
          firmware: firmware || null,
          site_id: siteId || null,
        },
      },
      { onSuccess: onClose }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Site</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="site_name">Site Name</Label>
            <Input
              id="site_name"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Enter site name"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gateway_id">Gateway ID</Label>
            <Input
              id="gateway_id"
              value={gatewayId}
              onChange={(e) => setGatewayId(e.target.value)}
              placeholder="Enter gateway ID"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="firmware">Firmware</Label>
            <Input
              id="firmware"
              value={firmware}
              onChange={(e) => setFirmware(e.target.value)}
              placeholder="Enter firmware version (optional)"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="site_id">Site ID</Label>
            <Input
              id="site_id"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              placeholder="Enter site ID (optional)"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outlined" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
