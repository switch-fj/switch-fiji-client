"use client"

import { useEffect, useState } from "react"
import RegisterEngineerModal from "../components/RegisterEngineerModal"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle } from "lucide-react"
import { observer } from "mobx-react-lite"
import { Button, Input } from "@workspace/ui"
import { useStore } from "@/store"
import {
  CURRENCY_OPTIONS,
  TIME_FORMAT_OPTIONS,
  DATE_FORMAT_OPTIONS,
} from "@/constants/mangle"
import {
  ContractSettingsSchema,
  type ContractSettingsInput,
  type ContractSettingsRespModel,
} from "@/types/settings"
import FormField from "./FormField"
import SettingsSelect from "./SettingsSelect"
import NotificationRow from "./NotificationRow"
import RateHistoryTable from "./RateHistoryTable"
import UsersTable from "./UsersTable"
import { useUsers } from "@/hooks/useEngineer"

function toFormValues(s: ContractSettingsRespModel): ContractSettingsInput {
  return {
    vat_rate: String(s.vat_rate ?? ""),
    efl_standard_rate_kwh: String(s.efl_standard_rate_kwh ?? ""),
    primary_currency: String(s.primary_currency ?? ""),
    asset_performance: Boolean(s.asset_performance),
    invoice_generated: Boolean(s.invoice_generated),
    invoice_emailed: Boolean(s.invoice_emailed),
    time_format: String(s.time_format ?? ""),
    date_format: s.date_format as "dmy" | "mdy",
  }
}

const NOTIFICATION_FIELDS = [
  { name: "asset_performance" as const, label: "Asset performance" },
  { name: "invoice_generated" as const, label: "Invoice generated" },
  { name: "invoice_emailed" as const, label: "Invoice emailed" },
] as const

const SettingsPage = observer(() => {
  const { SettingsStore } = useStore()

  const [formReady, setFormReady] = useState(false)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const { data: usersData, isLoading: usersLoading } = useUsers()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<ContractSettingsInput>({
    resolver: zodResolver(ContractSettingsSchema),
  })

  useEffect(() => {
    SettingsStore.fetchSettings()
    SettingsStore.fetchHistory()
  }, [SettingsStore])

  useEffect(() => {
    const s = SettingsStore.settings
    if (!s) return
    reset(toFormValues(s))
    setFormReady(true)
  }, [SettingsStore.settings, reset])

  const onSubmit = async (values: ContractSettingsInput) => {
    const changed = Object.fromEntries(
      Object.keys(dirtyFields).map((key) => [
        key,
        values[key as keyof ContractSettingsInput],
      ])
    )
    if (Object.keys(changed).length === 0) return
    const ok = await SettingsStore.updateSettings(changed)
    if (ok && SettingsStore.settings) {
      reset(toFormValues(SettingsStore.settings))
      SettingsStore.fetchHistory()
    }
  }

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

  if (!SettingsStore.settings || !formReady) return null

  const eflRows = (SettingsStore.eflHistory ?? []).map((r) => ({
    uid: r.uid,
    rate: r.efl_standard_rate_kwh,
    effective_from: r.effective_from,
    effective_to: r.effective_to,
  }))

  const vatRows = (SettingsStore.vatHistory ?? []).map((r) => ({
    uid: r.uid,
    rate: r.vat_rate,
    effective_from: r.effective_from,
    effective_to: r.effective_to,
  }))

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <div className="mx-auto flex max-w-xs flex-col items-center gap-1 pt-20 pb-10">
        <h1 className="text-center text-2xl font-semibold">General Settings</h1>
        <p className="text-text-1 text-center text-sm">
          Change general settings to update all contracts at once.
        </p>
      </div>

      <div className="rounded-none p-8 shadow-none">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="border-r pr-10">
              <div className="flex max-w-sm flex-col gap-5">
                <FormField
                  label="VAT Rate:"
                  error={errors.vat_rate?.message}
                  position="right"
                  width="w-36"
                >
                  <Input
                    {...register("vat_rate")}
                    placeholder="15%"
                    className="border-border border bg-white"
                  />
                </FormField>

                <FormField
                  label="EFL Standard Rate ($/kWh):"
                  error={errors.efl_standard_rate_kwh?.message}
                  position="right"
                  width="w-36"
                >
                  <Input
                    {...register("efl_standard_rate_kwh")}
                    placeholder="e.g. 0.32"
                    className="border-border border bg-white"
                  />
                </FormField>

                <FormField
                  label="Primary Currency"
                  error={errors.primary_currency?.message}
                  position="right"
                  width="w-36"
                >
                  <Controller
                    name="primary_currency"
                    control={control}
                    render={({ field }) => (
                      <SettingsSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={CURRENCY_OPTIONS}
                        placeholder="Select currency"
                      />
                    )}
                  />
                </FormField>
              </div>
            </div>
            <div className="border-r pr-10">
              <div className="flex flex-col gap-4">
                <p className="text-sm font-medium">Notifications settings</p>

                {NOTIFICATION_FIELDS.map(({ name, label }) => (
                  <Controller
                    key={name}
                    name={name}
                    control={control}
                    render={({ field }) => (
                      <NotificationRow
                        label={label}
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="flex max-w-sm flex-col gap-4">
                <FormField
                  label="Time format"
                  error={errors.time_format?.message}
                  position="left"
                >
                  <Controller
                    name="time_format"
                    control={control}
                    render={({ field }) => (
                      <SettingsSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={TIME_FORMAT_OPTIONS}
                        placeholder="Select format"
                      />
                    )}
                  />
                </FormField>

                <FormField
                  label="Date format"
                  error={errors.date_format?.message}
                >
                  <Controller
                    name="date_format"
                    control={control}
                    render={({ field }) => (
                      <SettingsSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={DATE_FORMAT_OPTIONS}
                        placeholder="Select format"
                      />
                    )}
                  />
                </FormField>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-10 flex max-w-xs justify-center">
            <Button
              type="submit"
              variant="primary"
              disabled={SettingsStore.isLoading.update}
              className="flex items-center gap-2 px-8"
              size="md"
            >
              <CheckCircle className="h-4 w-4" />
              {SettingsStore.isLoading.update ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>

      {/* Rate history */}
      <div className="border-t px-8 pb-10">
        <div className="pt-8">
          <h2 className="mb-6 text-lg font-semibold">Rate History</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <RateHistoryTable
              title="EFL Rate History"
              rows={eflRows}
              rateLabel="Rate ($/kWh)"
              formatRate={(r) =>
                r != null ? `$${parseFloat(String(r)).toFixed(4)}` : "—"
              }
              isLoading={SettingsStore.isLoading.history}
            />
            <RateHistoryTable
              title="VAT Rate History"
              rows={vatRows}
              rateLabel="Rate (%)"
              formatRate={(r) => (r != null ? `${r}%` : "—")}
              isLoading={SettingsStore.isLoading.history}
            />
          </div>
        </div>
      </div>

      {/* Engineer access */}
      <div className="border-t px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Engineer Access</h2>
            <p className="text-text-1 mt-1 text-sm">
              Invite an engineer to the platform.
            </p>
          </div>
          <Button
            type="button"
            variant="outlined"
            className="max-w-42"
            size="md"
            onClick={() => setRegisterModalOpen(true)}
          >
            Register Engineer
          </Button>
        </div>
        <div className="mt-6">
          <UsersTable
            users={usersData?.data.items ?? []}
            isLoading={usersLoading}
          />
        </div>
      </div>
      <RegisterEngineerModal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </div>
  )
})

export default SettingsPage
