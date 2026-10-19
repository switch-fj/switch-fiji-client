"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle } from "lucide-react"
import { Button, Input } from "@workspace/ui"
import Toggle from "@/app/(dashboard)/components/Toggle"
import {
  useSetXeroTaxMapping,
  useUpdateXeroSettings,
  useXeroSettings,
  useXeroTaxMappings,
} from "@/hooks/useXero"
import {
  XeroSettingsSchema,
  XeroTaxMappingSchema,
  type XeroSettingsInput,
  type XeroSettingsModel,
  type XeroTaxMappingInput,
} from "@/types/xero"
import FormField from "./FormField"

function toFormValues(s: XeroSettingsModel): XeroSettingsInput {
  return {
    create_invoices_enabled: s.create_invoices_enabled,
    sales_account_code: s.sales_account_code ?? "",
    tax_reporting_type: s.tax_reporting_type ?? "",
  }
}

function XeroSettingsForm() {
  const { data: settings, isLoading, isError } = useXeroSettings()
  const { mutate, isPending } = useUpdateXeroSettings()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<XeroSettingsInput>({
    resolver: zodResolver(XeroSettingsSchema),
    defaultValues: {
      create_invoices_enabled: false,
      sales_account_code: "",
      tax_reporting_type: "",
    },
  })

  useEffect(() => {
    if (settings) reset(toFormValues(settings))
  }, [settings, reset])

  const onSubmit = (values: XeroSettingsInput) =>
    mutate(
      {
        create_invoices_enabled: values.create_invoices_enabled,
        sales_account_code: values.sales_account_code || null,
        tax_reporting_type: values.tax_reporting_type || null,
        invoice_status: "DRAFT",
      },
      { onSuccess: (res) => reset(toFormValues(res.data)) }
    )

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading settings...</p>
  }

  if (isError) {
    return (
      <p className="text-muted-foreground text-sm">
        Unable to load Xero settings.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <p className="text-sm font-semibold">Invoice Creation</p>

      <div className="flex items-center gap-4">
        <span className="text-sm">Create invoices in Xero</span>
        <Controller
          name="create_invoices_enabled"
          control={control}
          render={({ field }) => (
            <Toggle checked={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <FormField
        label="Sales Account Code"
        error={errors.sales_account_code?.message}
        width="w-40"
      >
        <Input
          {...register("sales_account_code")}
          placeholder="e.g. 200"
          className="border-border border bg-white"
        />
      </FormField>

      <FormField
        label="Tax Reporting Type"
        error={errors.tax_reporting_type?.message}
        width="w-40"
      >
        <Input
          {...register("tax_reporting_type")}
          placeholder="e.g. OUTPUT"
          className="border-border border bg-white"
        />
      </FormField>

      <FormField label="Invoice Status" width="w-40">
        <Input
          value={settings?.invoice_status ?? "DRAFT"}
          disabled
          className="border-border border bg-neutral-50"
        />
      </FormField>

      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={isPending || !isDirty}
        className="flex max-w-44 items-center gap-2"
      >
        <CheckCircle className="h-4 w-4" />
        {isPending ? "Saving..." : "Save Xero settings"}
      </Button>
    </form>
  )
}

function XeroTaxMappings() {
  const { data: mappings = [], isLoading, isError } = useXeroTaxMappings()
  const { mutate, isPending } = useSetXeroTaxMapping()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<XeroTaxMappingInput>({
    resolver: zodResolver(XeroTaxMappingSchema),
    defaultValues: { vat_rate: "", xero_tax_type: "" },
  })

  const onSubmit = (values: XeroTaxMappingInput) =>
    mutate(values, {
      onSuccess: () => reset({ vat_rate: "", xero_tax_type: "" }),
    })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold">Tax Mappings</p>

      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-[#E8EEF2] text-left">
              <th className="px-4 py-3 font-semibold">VAT Rate</th>
              <th className="px-4 py-3 font-semibold">Reporting Type</th>
              <th className="px-4 py-3 font-semibold">Xero Tax Type</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [0, 1, 2].map((i) => (
                <tr
                  key={i}
                  className={i % 2 === 1 ? "bg-neutral-50" : "bg-white"}
                >
                  {[0, 1, 2, 3, 4].map((j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError || mappings.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-text-1 px-4 py-8 text-center text-sm"
                >
                  {isError
                    ? "Unable to load tax mappings."
                    : "No tax mappings yet"}
                </td>
              </tr>
            ) : (
              mappings.map((m, i) => (
                <tr
                  key={`${m.vat_rate}-${m.reporting_type}`}
                  className={i % 2 === 1 ? "bg-neutral-50" : "bg-white"}
                >
                  <td className="px-4 py-3 font-medium">{m.vat_rate}%</td>
                  <td className="text-text-1 px-4 py-3">{m.reporting_type}</td>
                  <td className="text-text-1 px-4 py-3">
                    {m.xero_tax_type ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {m.is_explicit ? (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        Explicit
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-500">
                        Default
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="text-sm font-medium text-orange-600 hover:underline"
                      onClick={() =>
                        reset({
                          vat_rate: m.vat_rate,
                          xero_tax_type: m.xero_tax_type ?? "",
                        })
                      }
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-wrap items-start gap-3"
      >
        <div className="flex w-32 flex-col gap-1">
          <Input
            {...register("vat_rate")}
            placeholder="VAT rate %"
            className="border-border border bg-white"
          />
          {errors.vat_rate && (
            <p className="text-destructive text-xs">
              {errors.vat_rate.message}
            </p>
          )}
        </div>
        <div className="flex w-48 flex-col gap-1">
          <Input
            {...register("xero_tax_type")}
            placeholder="Xero tax type"
            className="border-border border bg-white"
          />
          {errors.xero_tax_type && (
            <p className="text-destructive text-xs">
              {errors.xero_tax_type.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          variant="outlined"
          size="md"
          disabled={isPending}
          className="max-w-36"
        >
          {isPending ? "Saving..." : "Save mapping"}
        </Button>
      </form>
    </div>
  )
}

export default function XeroIntegrationSection() {
  return (
    <div className="border-t px-8 py-8">
      <div>
        <h2 className="text-lg font-semibold">Xero Integration</h2>
        <p className="text-text-1 mt-1 text-sm">
          Configure how invoices are created in Xero and map VAT rates to Xero
          tax types.
        </p>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="md:border-r md:pr-10">
          <XeroSettingsForm />
        </div>
        <XeroTaxMappings />
      </div>
    </div>
  )
}
