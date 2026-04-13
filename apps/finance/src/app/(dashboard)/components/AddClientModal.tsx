"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui"
import { CreateClientSchema, type CreateClientInput } from "@/types/client"
import { useAddClient } from "@/hooks/useClient"

type AddClientModalProps = {
  open: boolean
  onClose: () => void
}

export default function AddClientModal({ open, onClose }: AddClientModalProps) {
  const { mutate: addClient, isPending } = useAddClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClientInput>({
    resolver: zodResolver(CreateClientSchema),
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = (values: CreateClientInput) => {
    addClient(values, {
      onSuccess: () => handleClose(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md rounded-2xl" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add Client
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Create a new client account. They will receive an invitation email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Client Name</label>
            <input
              className="border-input bg-background focus:border-primary w-full rounded-md border px-3 py-2 text-sm outline-none"
              placeholder="e.g. Pacific Holdings"
              {...register("client_name")}
            />
            {errors.client_name && (
              <p className="text-destructive text-xs">
                {errors.client_name.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Client Email</label>
            <input
              type="email"
              className="border-input bg-background focus:border-primary w-full rounded-md border px-3 py-2 text-sm outline-none"
              placeholder="e.g. client@example.com"
              {...register("client_email")}
            />
            {errors.client_email && (
              <p className="text-destructive text-xs">
                {errors.client_email.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outlined"
              size="md"
              className="flex-1"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="flex-1"
              isLoading={isPending}
              disabled={isPending}
            >
              {!isPending && "Add Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
