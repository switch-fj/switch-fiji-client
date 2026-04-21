"use client"

import { useMemo, useEffect } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  Button,
  Input,
  DatePickerInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui"
import { EnumContractType, EnumContractSystemMode } from "@/constants/mangle"
import {
  type Combo,
  getCombo,
  VIS,
  BILLING_FREQUENCY_OPTIONS,
  TARIFF_PERIOD_OPTIONS,
  IMPLEMENTATION_PERIOD_OPTIONS,
  TARIFF_SLOT_TYPE_OPTIONS,
} from "@/constants/contract"
import { useCreateContractDetails } from "@/hooks/useContract"
import type { ContractDetailsPayload } from "@/types/site"
import ContractSummaryBar from "./ContractSummaryBar"

// ─── Schema ───────────────────────────────────────────────────────────────────

const TariffRowSchema = z.object({
  period_number: z.string(),
  slot: z.string(),
  slot_type: z.string().min(1, "Required"),
  rate: z.string().min(1, "Required"),
  time_start: z.string().optional(),
  time_end: z.string().optional(),
})

// Keep a loose type for TypeScript (all optional) — runtime validation is
// handled by the dynamic schema produced by makeDetailsSchema below.
const ContractDetailsSchema = z.object({
  term_years: z.string().optional(),
  signing_date: z.string().optional(),
  billing_frequency: z.string().optional(),
  tariff_periods: z.string().optional(),
  commissioning_date: z.string().optional(),
  implementation_period: z.string().optional(),
  client_email: z.string().optional(),
  grid_meter_reading: z.string().optional(),
  system_size_kwp: z.string().optional(),
  guaranteed_production: z.string().optional(),
  equipment_lease: z.string().optional(),
  maintenance: z.string().optional(),
  solar_production_month: z.string().optional(),
  estimated_utility: z.string().optional(),
  monthly_baseline_consumption: z.string().optional(),
  minimum_consumption_monthly: z.string().optional(),
  minimum_spend: z.string().optional(),
  tariffs: z.array(TariffRowSchema),
})

type ContractDetailsValues = z.infer<typeof ContractDetailsSchema>

function makeDetailsSchema(combo: Combo | null) {
  const req = (msg: string) => z.string().min(1, msg)
  const opt = z.string().optional()
  const f = (key: keyof typeof VIS, msg: string) =>
    combo && VIS[key][combo] ? req(msg) : opt

  return z.object({
    term_years: f("term_years", "Term years is required"),
    signing_date: f("signing_date", "Signing date is required"),
    billing_frequency: f("billing_frequency", "Billing frequency is required"),
    tariff_periods: f("tariff_periods", "Tariff periods is required"),
    commissioning_date: f(
      "commissioning_date",
      "Commissioning date is required"
    ),
    implementation_period: f(
      "implementation_period",
      "Implementation period is required"
    ),
    client_email:
      combo && VIS.client_email[combo]
        ? z.string().min(1, "Client email is required").email("Invalid email")
        : opt,
    grid_meter_reading: f(
      "grid_meter_reading",
      "Grid meter reading is required"
    ),
    system_size_kwp: f("system_size_kwp", "System size is required"),
    guaranteed_production: f(
      "guaranteed_production",
      "Guaranteed production is required"
    ),
    equipment_lease: f("equipment_lease", "Equipment lease is required"),
    maintenance: f("maintenance", "Maintenance is required"),
    solar_production_month: f(
      "solar_production_month",
      "Solar production is required"
    ),
    estimated_utility: f("estimated_utility", "Estimated utility is required"),
    monthly_baseline_consumption: f(
      "monthly_baseline_consumption",
      "Monthly baseline consumption is required"
    ),
    minimum_consumption_monthly: f(
      "minimum_consumption_monthly",
      "Minimum monthly consumption is required"
    ),
    minimum_spend: f("minimum_spend", "Minimum spend is required"),
    tariffs:
      combo && VIS.tariffs_table[combo]
        ? z.array(TariffRowSchema).min(1, "Add at least one tariff row")
        : z.array(TariffRowSchema),
  })
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  open: boolean
  onClose: () => void
  clientUid: string
  contractUid: string
  contractType: EnumContractType
  systemMode: EnumContractSystemMode
  currency: string
  clientName: string
  siteName: string | null
}

// ─── Shared input styles ──────────────────────────────────────────────────────

const LABEL = "shrink-0 whitespace-nowrap text-sm text-text-1 font-medium"

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContractDetailsSheet({
  open,
  onClose,
  clientUid,
  contractUid,
  contractType,
  systemMode,
  currency,
  clientName,
  siteName,
}: Props) {
  const combo = useMemo(
    () => getCombo(contractType, systemMode),
    [contractType, systemMode]
  )

  const show = (field: keyof typeof VIS) => (combo ? VIS[field][combo] : false)

  const schema = useMemo(() => makeDetailsSchema(combo), [combo])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContractDetailsValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      term_years: "",
      signing_date: "",
      billing_frequency: "",
      tariff_periods: "",
      commissioning_date: "",
      implementation_period: "",
      client_email: "",
      grid_meter_reading: "",
      system_size_kwp: "",
      guaranteed_production: "",
      equipment_lease: "",
      maintenance: "",
      solar_production_month: "",
      estimated_utility: "",
      monthly_baseline_consumption: "",
      minimum_consumption_monthly: "",
      minimum_spend: "",
      tariffs: [],
    },
  })

  const { fields, replace } = useFieldArray({ control, name: "tariffs" })

  // Auto-generate tariff rows whenever tariff period count changes
  const tariffPeriods = watch("tariff_periods")
  useEffect(() => {
    const count = parseInt(tariffPeriods ?? "0", 10)
    if (!count || isNaN(count)) {
      replace([])
      return
    }
    replace(
      Array.from({ length: count }, (_, p) =>
        (["A", "B"] as const).map((slot) => ({
          period_number: String(p + 1),
          slot,
          slot_type: "",
          rate: "",
          time_start: "",
          time_end: "",
        }))
      ).flat()
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tariffPeriods])

  // Auto-compute contract end date (commissioning date + term years)
  const commissioningDate = watch("commissioning_date")
  const termYears = watch("term_years")
  const contractEnd = useMemo(() => {
    if (!commissioningDate || !termYears) return ""
    const d = new Date(commissioningDate)
    d.setFullYear(d.getFullYear() + parseInt(termYears, 10))
    return d.toISOString().split("T")[0]
  }, [commissioningDate, termYears])

  // Auto-compute total
  const equipmentLease = watch("equipment_lease")
  const maintenance = watch("maintenance")
  const computedTotal = useMemo(() => {
    const a = parseFloat(equipmentLease ?? "0") || 0
    const b = parseFloat(maintenance ?? "0") || 0
    return a + b > 0 ? (a + b).toFixed(2) : ""
  }, [equipmentLease, maintenance])

  const mutation = useCreateContractDetails(clientUid, contractUid)

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = (values: ContractDetailsValues) => {
    const num = (v: string | undefined) => parseFloat(v ?? "0") || 0
    const int = (v: string | undefined) => parseInt(v ?? "0", 10) || 0
    const dt = (d: string | undefined) => (d ? `${d}T00:00:00` : undefined)

    const payload: ContractDetailsPayload = {}
    if (show("term_years")) payload.term_years = int(values.term_years)
    if (show("signing_date")) payload.signed_at = dt(values.signing_date)
    if (show("billing_frequency"))
      payload.billing_frequency = values.billing_frequency
    if (show("tariff_periods"))
      payload.tariff_periods = int(values.tariff_periods)
    if (show("commissioning_date"))
      payload.commissioned_at = dt(values.commissioning_date)
    if (show("contract_end") && contractEnd)
      payload.end_at = `${contractEnd}T00:00:00`
    if (show("implementation_period"))
      payload.implementation_period = int(values.implementation_period)
    if (show("grid_meter_reading"))
      payload.grid_meter_reading_at_commissioning = num(
        values.grid_meter_reading
      )
    if (show("system_size_kwp"))
      payload.system_size_kwp = num(values.system_size_kwp)
    if (show("guaranteed_production"))
      payload.guaranteed_production_kwh_per_kwp = num(
        values.guaranteed_production
      )
    if (show("equipment_lease"))
      payload.equipment_lease_amount = num(values.equipment_lease)
    if (show("maintenance"))
      payload.maintenance_amount = num(values.maintenance)
    if (show("total") && computedTotal)
      payload.total = parseFloat(computedTotal)
    if (show("solar_production_month"))
      payload.monthly_baseline_consumption_kwh = num(
        values.solar_production_month
      )
    if (show("estimated_utility"))
      payload.estimated_utility = int(values.estimated_utility)
    if (show("monthly_baseline_consumption"))
      payload.monthly_baseline_consumption_kwh = num(
        values.monthly_baseline_consumption
      )
    if (show("minimum_consumption_monthly"))
      payload.minimum_consumption_monthly_kwh = num(
        values.minimum_consumption_monthly
      )
    if (show("minimum_spend")) payload.minimum_spend = num(values.minimum_spend)
    if (show("tariffs_table")) {
      payload.tariffs = values.tariffs.map((t) => ({
        period_number: parseInt(t.period_number, 10),
        slot: t.slot,
        slot_type: t.slot_type,
        rate: num(t.rate),
      }))
    }

    mutation.mutate(payload, {
      onSuccess: () => handleClose(),
    })
  }

  const contractTypeLabel =
    contractType === EnumContractType.PPA ? "PPA" : "Lease"
  const systemModeLabel =
    systemMode === EnumContractSystemMode.ON_GRID ? "On Grid" : "Off Grid"

  return (
    <Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
      <SheetContent
        side="right"
        className="border-border w-screen! max-w-none! overflow-y-auto rounded-t-3xl border bg-[#FAFAFA] p-10"
      >
        <div className=" ">
          <div className="border-border overflow-hidden rounded-2xl border bg-[#fafafa]">
            {/* ── Header ── */}
            <div className="border-border flex items-center justify-between border-b px-8 py-5">
              <p className="text-text-1 text-lg font-semibold">
                New Contract Wizard
              </p>
              <Button
                type="button"
                variant="primary"
                size="md"
                className="max-w-[140px] gap-2 rounded-sm"
                onClick={handleSubmit(onSubmit, () =>
                  toast.error("Please fill all required fields.")
                )}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving…" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* ── Summary ── */}
            <ContractSummaryBar
              clientName={clientName}
              siteName={siteName}
              contractRef="—"
              contractTypeLabel={contractTypeLabel}
              systemModeLabel={systemModeLabel}
              currency={currency}
            />

            {/* ── Form ── */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-6 px-8 py-6"
            >
              {/* 3-column field grid */}
              <div className="grid grid-cols-[400px_350px_350px] gap-x-12 gap-y-5">
                {/* Term Years */}
                {show("term_years") && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <label className={LABEL}>Term years</label>
                      <Input
                        type="number"
                        min={1}
                        className="border-input border bg-white"
                        placeholder="10"
                        {...register("term_years")}
                      />
                    </div>
                    {errors.term_years && (
                      <p className="text-destructive text-xs">
                        {errors.term_years.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Contract Signing Date */}
                {show("signing_date") && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <label className={LABEL}>Contract Signing Date</label>
                      <Controller
                        name="signing_date"
                        control={control}
                        render={({ field }) => (
                          <DatePickerInput
                            value={
                              field.value ? new Date(field.value) : undefined
                            }
                            onChange={(d) =>
                              field.onChange(
                                d?.toISOString().split("T")[0] ?? ""
                              )
                            }
                            className="flex-1"
                          />
                        )}
                      />
                    </div>
                    {errors.signing_date && (
                      <p className="text-destructive text-xs">
                        {errors.signing_date.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Billing Frequency */}
                {show("billing_frequency") && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <label className={LABEL}>Billing Frequency</label>
                      <Controller
                        name="billing_frequency"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full bg-white font-normal">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {BILLING_FREQUENCY_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    {errors.billing_frequency && (
                      <p className="text-destructive text-xs">
                        {errors.billing_frequency.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Tariff Periods */}
                {show("tariff_periods") && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <label className={LABEL}>Tariff Periods</label>
                      <Controller
                        name="tariff_periods"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full bg-white font-normal">
                              <SelectValue placeholder="#" />
                            </SelectTrigger>
                            <SelectContent>
                              {TARIFF_PERIOD_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    {errors.tariff_periods && (
                      <p className="text-destructive text-xs">
                        {errors.tariff_periods.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Commissioning Date */}
                {show("commissioning_date") && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <label className={LABEL}>Commissioning Date</label>
                      <Controller
                        name="commissioning_date"
                        control={control}
                        render={({ field }) => (
                          <DatePickerInput
                            value={
                              field.value ? new Date(field.value) : undefined
                            }
                            className="flex-1"
                            onChange={(d) =>
                              field.onChange(
                                d?.toISOString().split("T")[0] ?? ""
                              )
                            }
                          />
                        )}
                      />
                    </div>
                    {errors.commissioning_date && (
                      <p className="text-destructive text-xs">
                        {errors.commissioning_date.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Contract End (auto-calculated) */}
                {show("contract_end") && (
                  <div className="flex items-center gap-3">
                    <label className={LABEL}>Contract End</label>
                    <DatePickerInput
                      value={contractEnd ? new Date(contractEnd) : undefined}
                      className="flex-1"
                      disabled
                    />
                  </div>
                )}

                {/* Implementation Period */}
                {show("implementation_period") && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <label className={LABEL}>Implementation Period</label>
                      <Controller
                        name="implementation_period"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full bg-white font-normal">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {IMPLEMENTATION_PERIOD_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    {errors.implementation_period && (
                      <p className="text-destructive text-xs">
                        {errors.implementation_period.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Client Email */}
                {show("client_email") && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <label className={LABEL}>
                        Client email{" "}
                        <span className="opacity-60">(for invoice)</span>
                      </label>
                      <Input
                        type="email"
                        className="border-input flex-1 border bg-white"
                        placeholder="billing@example.com"
                        {...register("client_email")}
                      />
                    </div>
                    {errors.client_email && (
                      <p className="text-destructive text-xs">
                        {errors.client_email.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Grid Meter Reading */}
                {show("grid_meter_reading") && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <label className={LABEL}>
                        Grid Meter Reading at Commissioning
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        className="border-input border bg-white"
                        placeholder="0.00"
                        {...register("grid_meter_reading")}
                      />
                    </div>
                    {errors.grid_meter_reading && (
                      <p className="text-destructive text-xs">
                        {errors.grid_meter_reading.message}
                      </p>
                    )}
                  </div>
                )}

                {/* System Size kWp */}
                {show("system_size_kwp") && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <label className={LABEL}>System Size (kWp)</label>
                      <Input
                        type="number"
                        step="0.01"
                        className="border-input border bg-white"
                        placeholder="0.00"
                        {...register("system_size_kwp")}
                      />
                    </div>
                    {errors.system_size_kwp && (
                      <p className="text-destructive text-xs">
                        {errors.system_size_kwp.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Guaranteed Production */}
                {show("guaranteed_production") && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <label className={LABEL}>
                        Guaranteed Production (kWh/kWp)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        className="border-input border bg-white"
                        placeholder="0.00"
                        {...register("guaranteed_production")}
                      />
                    </div>
                    {errors.guaranteed_production && (
                      <p className="text-destructive text-xs">
                        {errors.guaranteed_production.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Equipment Lease */}
                {show("equipment_lease") && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <label className={LABEL}>Equipment Lease</label>
                      <Input
                        type="number"
                        step="0.01"
                        className="border-input border bg-white"
                        placeholder="0.00"
                        {...register("equipment_lease")}
                      />
                    </div>
                    {errors.equipment_lease && (
                      <p className="text-destructive text-xs">
                        {errors.equipment_lease.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Maintenance */}
                {show("maintenance") && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <label className={LABEL}>Maintenance</label>
                      <Input
                        type="number"
                        step="0.01"
                        className="border-input border bg-white"
                        placeholder="0.00"
                        {...register("maintenance")}
                      />
                    </div>
                    {errors.maintenance && (
                      <p className="text-destructive text-xs">
                        {errors.maintenance.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Total (auto-calculated) */}
                {show("total") && (
                  <div className="flex items-center gap-3">
                    <label className={LABEL}>Total</label>
                    <Input
                      type="text"
                      className="bg-muted/40 border-input border"
                      value={computedTotal || "0.00"}
                      disabled
                      readOnly
                    />
                  </div>
                )}

                {/* Solar Production this Month */}
                {show("solar_production_month") && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <label className={LABEL}>
                        Solar Production this Month
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        className="border-input border bg-white"
                        placeholder="0.00"
                        {...register("solar_production_month")}
                      />
                    </div>
                    {errors.solar_production_month && (
                      <p className="text-destructive text-xs">
                        {errors.solar_production_month.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Estimated Utility */}
                {show("estimated_utility") && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <label className={LABEL}>Estimated Utility</label>
                      <Input
                        type="number"
                        step="0.01"
                        className="border-input border bg-white"
                        placeholder="0.00"
                        {...register("estimated_utility")}
                      />
                    </div>
                    {errors.estimated_utility && (
                      <p className="text-destructive text-xs">
                        {errors.estimated_utility.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Monthly Baseline Consumption */}
                {show("monthly_baseline_consumption") && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <label className={LABEL}>
                        Monthly Baseline Consumption (kWh)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        className="border-input border bg-white"
                        placeholder="0.00"
                        {...register("monthly_baseline_consumption")}
                      />
                    </div>
                    {errors.monthly_baseline_consumption && (
                      <p className="text-destructive text-xs">
                        {errors.monthly_baseline_consumption.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Minimum Monthly Consumption */}
                {show("minimum_consumption_monthly") && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <label className={LABEL}>
                        Minimum Monthly Consumption (kWh)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        className="border-input border bg-white"
                        placeholder="0.00"
                        {...register("minimum_consumption_monthly")}
                      />
                    </div>
                    {errors.minimum_consumption_monthly && (
                      <p className="text-destructive text-xs">
                        {errors.minimum_consumption_monthly.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Minimum Spend */}
                {show("minimum_spend") && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <label className={LABEL}>Minimum Spend</label>
                      <Input
                        type="number"
                        step="0.01"
                        className="border-input border bg-white"
                        placeholder="0.00"
                        {...register("minimum_spend")}
                      />
                    </div>
                    {errors.minimum_spend && (
                      <p className="text-destructive text-xs">
                        {errors.minimum_spend.message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ── Tariffs Table ── */}
              {show("tariffs_table") && (
                <div className="border-border mt-5 overflow-hidden rounded-lg border">
                  {/* Table header */}
                  <div className="bg-blue/40 grid grid-cols-[200px_1fr_180px] px-4 py-2.5 text-xs font-semibold text-[#2C6B6B]">
                    <span>Tariffs</span>
                    <span>Type</span>
                    <span>Rate/%</span>
                  </div>

                  {fields.length === 0 ? (
                    <div className="text-muted-foreground bg-white px-4 py-6 text-center text-sm">
                      Select tariff periods above to generate rows.
                    </div>
                  ) : (
                    fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="border-border grid grid-cols-[200px_1fr_180px] items-center gap-3 border-t bg-white px-4 py-2.5"
                      >
                        {/* Label — e.g. "Tariff 1/A" */}
                        <span className="text-foreground text-sm font-medium">
                          Tariff {field.period_number}/{field.slot}
                        </span>

                        {/* Slot Type */}
                        <Controller
                          name={`tariffs.${index}.slot_type`}
                          control={control}
                          render={({ field: f }) => (
                            <Select value={f.value} onValueChange={f.onChange}>
                              <SelectTrigger className="h-9 bg-white text-xs font-normal">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                {TARIFF_SLOT_TYPE_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />

                        {/* Rate */}
                        <Input
                          type="number"
                          step="0.01"
                          className="border-input h-9 border bg-white text-sm"
                          placeholder="0.00"
                          {...register(`tariffs.${index}.rate`)}
                        />
                      </div>
                    ))
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
