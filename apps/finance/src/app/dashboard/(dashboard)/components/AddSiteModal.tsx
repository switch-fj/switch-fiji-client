"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui";
import { CreateSiteSchema, type CreateSiteInput } from "@/types/site";
import { useAddSite } from "@/hooks/useSite";

type AddSiteModalProps = {
  open: boolean;
  clientUid: string;
  onClose: () => void;
};

export default function AddSiteModal({
  open,
  clientUid,
  onClose,
}: AddSiteModalProps) {
  const { mutate: addSite, isPending } = useAddSite();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSiteInput>({
    resolver: zodResolver(CreateSiteSchema),
    defaultValues: { client_uid: clientUid },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (values: CreateSiteInput) => {
    addSite(values, { onSuccess: () => handleClose() });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md rounded-2xl" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Site</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add a new site to this client.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
          <input type="hidden" {...register("client_uid")} />

          <div className="space-y-1">
            <label className="text-sm font-medium">Site Name</label>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="e.g. Nadi Resort Solar Plant"
              {...register("site_name")}
            />
            {errors.site_name && (
              <p className="text-xs text-destructive">
                {errors.site_name.message}
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
              {!isPending && "Add Site"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
