"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui"
import { CreateContractSchema, type CreateContractInput } from "@/types/site"
import { EnumContractType, EnumContractSystemMode } from "@/constants/mangle"
import { useCreateContract } from "@/hooks/useContract"

type Props = {
  open: boolean
  onClose: () => void
  clientUid: string
  clientName: string
  siteUid: string
  siteName: string | null
  onContractCreated: (
    contractUid: string,
    contractType: EnumContractType,
    systemMode: EnumContractSystemMode,
    currency: string
  ) => void
}

const CONTRACT_TYPE_OPTIONS = [
  { label: "PPA", value: EnumContractType.PPA },
  { label: "Lease", value: EnumContractType.LEASE },
]

const SYSTEM_MODE_OPTIONS = [
  { label: "On Grid", value: EnumContractSystemMode.ON_GRID },
  { label: "Off Grid", value: EnumContractSystemMode.OFF_GRID },
]

const CURRENCY_OPTIONS = [{ label: "USD", value: "USD" }]

export default function CreateContractSheet({
  open,
  onClose,
  clientUid,
  clientName,
  siteUid,
  siteName,
  onContractCreated,
}: Props) {
  const mutation = useCreateContract(clientUid)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateContractInput>({
    resolver: zodResolver(CreateContractSchema),
    defaultValues: {
      client_uid: clientUid,
      site_uid: siteUid,
      currency: "USD",
    },
  })

  const selectedContractType = watch("contract_type")
  const isLease = selectedContractType === EnumContractType.LEASE
  const systemModeOptions = isLease
    ? SYSTEM_MODE_OPTIONS.filter(
        (o) => o.value === EnumContractSystemMode.ON_GRID
      )
    : SYSTEM_MODE_OPTIONS

  // Auto-select On Grid when Lease is chosen
  if (isLease) {
    setValue("system_mode", EnumContractSystemMode.ON_GRID)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = (values: CreateContractInput) => {
    mutation.mutate(values, {
      onSuccess: (response) => {
        handleClose()
        onContractCreated(
          response.data,
          values.contract_type,
          values.system_mode,
          values.currency
        )
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
      <SheetContent
        side="right"
        className="border-border w-screen! max-w-none! overflow-y-auto border bg-[#FAFAFA] p-10"
      >
        <div className="border-border/60 flex flex-1 flex-col items-center justify-center rounded-2xl border px-4 py-10">
          <div className="pb-8 text-center">
            <p className="text-text-1 text-2xl font-semibold">
              Welcome to Contract Wizard
            </p>
            <p className="text-text-1 mt-2 mb-6 text-sm font-normal">
              Create new contract per site
            </p>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-[280px] space-y-5"
          >
            {/* Site Owner — prefilled, read-only */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Site Owner</label>
              <div className="bg-muted/40 text-muted-foreground flex h-10 w-full items-center rounded-md border px-3 text-sm">
                {clientName}
              </div>
            </div>

            {/* Site Name — prefilled, read-only */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Site Name</label>
              <div className="bg-muted/40 text-muted-foreground flex h-10 w-full items-center rounded-md border px-3 text-sm">
                {siteName ?? "—"}
              </div>
            </div>

            {/* Contract Type */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Contract Type</label>
              <Controller
                name="contract_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full bg-white font-normal">
                      <SelectValue placeholder="Select contract type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRACT_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.contract_type && (
                <p className="text-destructive text-xs">
                  {errors.contract_type.message}
                </p>
              )}
            </div>

            {/* System Mode */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">System Mode</label>
              <Controller
                name="system_mode"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full bg-white font-normal">
                      <SelectValue placeholder="Select system mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {systemModeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.system_mode && (
                <p className="text-destructive text-xs">
                  {errors.system_mode.message}
                </p>
              )}
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Currency</label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full bg-white font-normal">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.currency && (
                <p className="text-destructive text-xs">
                  {errors.currency.message}
                </p>
              )}
            </div>

            <div className="flex pt-8">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="flex-1 rounded-sm"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Creating…" : "Create New Contract"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
