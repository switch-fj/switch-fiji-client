"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle } from "lucide-react"
import { observer } from "mobx-react-lite"
import {
  Button,
  Card,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui"
import { useStore } from "@/store"
import {
  ContractSettingsSchema,
  type ContractSettingsInput,
  type ContractSettingsRespModel,
} from "@/types/settings"

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "FJD", label: "FJD" },
  { value: "AUD", label: "AUD" },
  { value: "NZD", label: "NZD" },
]

const TIME_FORMAT_OPTIONS = [
  { value: "24", label: "24-hour" },
  { value: "12", label: "12-hour" },
]

const DATE_FORMAT_OPTIONS = [
  { value: "dmy", label: "DD-MMM-YYYY" },
  { value: "mdy", label: "MM/DD/YYYY" },
]

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none ${
        checked ? "bg-orange-500" : "bg-neutral-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  )
}

function SettingsForm({ settings }: { settings: ContractSettingsRespModel }) {
  const { SettingsStore } = useStore()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, dirtyFields },
  } = useForm<ContractSettingsInput>({
    resolver: zodResolver(ContractSettingsSchema),
    defaultValues: {
      vat_rate: String(settings.vat_rate ?? ""),
      efl_standard_rate_kwh: String(settings.efl_standard_rate_kwh ?? ""),
      primary_currency: String(settings.primary_currency ?? ""),
      asset_performance: Boolean(settings.asset_performance),
      invoice_generated: Boolean(settings.invoice_generated),
      invoice_emailed: Boolean(settings.invoice_emailed),
      time_format: String(settings.time_format ?? ""),
      date_format: settings.date_format as "dmy" | "mdy",
    },
  })

  const onSubmit = (values: ContractSettingsInput) => {
    const changed = Object.fromEntries(
      Object.keys(dirtyFields).map((key) => [
        key,
        values[key as keyof ContractSettingsInput],
      ])
    )
    if (Object.keys(changed).length === 0) return
    SettingsStore.updateSettings(changed)
  }

  return (
    <Card className="p-8">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* ── Column 1: Rates & Currency ── */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">VAT Rate:</label>
              <Input {...register("vat_rate")} placeholder="15%" />
              {errors.vat_rate && (
                <p className="text-destructive text-xs">
                  {errors.vat_rate.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                EFL Standard Rate ($/kWh):
              </label>
              <Input
                {...register("efl_standard_rate_kwh")}
                placeholder="e.g. 0.32"
              />
              {errors.efl_standard_rate_kwh && (
                <p className="text-destructive text-xs">
                  {errors.efl_standard_rate_kwh.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Primary Currency</label>
              <Controller
                name="primary_currency"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
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
              {errors.primary_currency && (
                <p className="text-destructive text-xs">
                  {errors.primary_currency.message}
                </p>
              )}
            </div>
          </div>

          {/* ── Column 2: Notifications ── */}
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium">Notifications settings</p>

            {(
              [
                {
                  name: "asset_performance" as const,
                  label: "Asset performance",
                },
                {
                  name: "invoice_generated" as const,
                  label: "Invoice generated",
                },
                { name: "invoice_emailed" as const, label: "Invoice emailed" },
              ] as const
            ).map(({ name, label }) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm">{label}</span>
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <Toggle checked={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
            ))}
          </div>

          {/* ── Column 3: Format ── */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Time format</label>
              <Controller
                name="time_format"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_FORMAT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.time_format && (
                <p className="text-destructive text-xs">
                  {errors.time_format.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Date format</label>
              <Controller
                name="date_format"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {DATE_FORMAT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.date_format && (
                <p className="text-destructive text-xs">
                  {errors.date_format.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Button
            type="submit"
            variant="primary"
            disabled={SettingsStore.isLoading.update}
            className="flex items-center gap-2 px-8"
          >
            <CheckCircle className="h-4 w-4" />
            {SettingsStore.isLoading.update ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </Card>
  )
}

const SettingsPage = observer(() => {
  const { SettingsStore } = useStore()

  useEffect(() => {
    SettingsStore.fetchSettings()
  }, [SettingsStore])

  if (SettingsStore.isLoading.fetch) {
    return (
      <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center text-sm">
        Loading settings...
      </div>
    )
  }

  if (SettingsStore.errors.fetch) {
    return (
      <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center text-sm">
        Unable to load settings.
      </div>
    )
  }

  if (!SettingsStore.settings) return null

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">General Settings</h1>
        <p className="text-muted-foreground text-sm">
          Change general settings to update all contracts at once.
        </p>
      </div>

      <SettingsForm settings={SettingsStore.settings} />
    </div>
  )
})

export default SettingsPage
