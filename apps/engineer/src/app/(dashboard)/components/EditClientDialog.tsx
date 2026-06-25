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
import { useUpdateClient } from "@/hooks/useEngineer"
import type { EngineeringDashboardClient } from "@/types/engineer"

type EditClientDialogProps = {
  client: EngineeringDashboardClient
  isOpen: boolean
  onClose: () => void
}

export function EditClientDialog({
  client,
  isOpen,
  onClose,
}: EditClientDialogProps) {
  const [clientName, setClientName] = useState(client.client_name)
  const [clientId, setClientId] = useState(client.client_id ?? "")

  const { mutate, isPending } = useUpdateClient()

  useEffect(() => {
    if (isOpen) {
      setClientName(client.client_name)
      setClientId(client.client_id ?? "")
    }
  }, [isOpen, client])

  const handleSave = () => {
    mutate(
      {
        clientUid: client.uid,
        payload: {
          client_name: clientName || null,
          client_id: clientId || null,
        },
      },
      { onSuccess: onClose }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client_name">Client Name</Label>
            <Input
              id="client_name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter client name"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client_id">Client ID</Label>
            <Input
              id="client_id"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Enter client ID (optional)"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
