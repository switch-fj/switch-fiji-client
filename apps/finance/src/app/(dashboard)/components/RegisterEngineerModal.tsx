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
import {
  RegisterEngineerSchema,
  type RegisterEngineerInput,
} from "@/types/engineer"
import { useRegisterEngineer } from "@/hooks/useEngineer"

type RegisterEngineerModalProps = {
  open: boolean
  onClose: () => void
}

export default function RegisterEngineerModal({
  open,
  onClose,
}: RegisterEngineerModalProps) {
  const { mutate: registerEngineer, isPending } = useRegisterEngineer()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterEngineerInput>({
    resolver: zodResolver(RegisterEngineerSchema),
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = (values: RegisterEngineerInput) => {
    registerEngineer(values, {
      onSuccess: () => handleClose(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md rounded-2xl" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Register Engineer
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Invite an engineer to the platform. They will receive an invitation
            email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Engineer Email</label>
            <input
              type="email"
              className="border-input bg-background focus:border-primary w-full rounded-md border px-3 py-2 text-sm outline-none"
              placeholder="e.g. engineer@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email.message}</p>
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
              {!isPending && "Register"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
