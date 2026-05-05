"use client"

import { useMemo, useEffect, useRef, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, CheckCircle, ChevronLeft } from "lucide-react"
import { toast } from "sonner"
import { Sheet, SheetContent, Button } from "@workspace/ui"
import { EnumContractType, EnumContractSystemMode } from "@/constants/mangle"
import { getCombo, VIS } from "@/constants/contract"
import {
  useCreateContractDetails,
  useUpdateContractDetails,
} from "@/hooks/useContract"
import type { ContractDetailsPayload } from "@/types/site"
import type { ContractDetailsSheetProps } from "@/types/site"
import {
  localDate,
  toDateStr,
  makeDetailsSchema,
  detailsToDefaults,
} from "@/constants/contractDetails"
import type { ContractDetailsValues } from "@/constants/contractDetails"
import { toUtcIso } from "@/utils/date"
import ContractSummaryBar from "./ContractSummaryBar"
import ContractFieldsGrid from "./ContractFieldsGrid"
import TariffsTable from "./TariffsTable"
import ContractDetailsReview from "./ContractDetailsReview"

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
  existingDetails,
}: ContractDetailsSheetProps) {
  const [step, setStep] = useState<"form" | "review">("form")

  const combo = useMemo(
    () => getCombo(contractType, systemMode),
    [contractType, systemMode]
  )

  const show = (field: keyof typeof VIS) => (combo ? VIS[field][combo] : false)

  const schema = useMemo(() => makeDetailsSchema(combo), [combo])

  const emptyDefaults: ContractDetailsValues = {
    term_years: "",
    signing_date: "",
    billing_frequency: "",
    tariff_periods: "",
    tariff_indexed_rule_type: "",
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
    actual_commissioned_at: "",
    actual_end_at: "",
    tariffs: [],
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<ContractDetailsValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: existingDetails
      ? detailsToDefaults(existingDetails)
      : emptyDefaults,
  })

  const skipTariffReplace = useRef(!!existingDetails)

  useEffect(() => {
    if (existingDetails) {
      skipTariffReplace.current = true
      reset(detailsToDefaults(existingDetails))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingDetails?.uid])

  const { fields, replace } = useFieldArray({ control, name: "tariffs" })

  // Auto-generate tariff rows whenever tariff period count changes.
  // Skip when the change comes from a pre-fill reset so we don't wipe existing rows.
  const tariffPeriods = watch("tariff_periods")
  useEffect(() => {
    if (skipTariffReplace.current) {
      skipTariffReplace.current = false
      return
    }
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

  const commissioningDate = watch("commissioning_date")
  const termYears = watch("term_years")
  const contractEnd = useMemo(() => {
    if (!commissioningDate || !termYears) return ""
    const d = localDate(commissioningDate)
    d.setFullYear(d.getFullYear() + parseInt(termYears, 10))
    return toDateStr(d)
  }, [commissioningDate, termYears])

  const actualCommissionedAt = watch("actual_commissioned_at")
  const actualEnd = useMemo(() => {
    if (!actualCommissionedAt || !termYears) return ""
    const d = localDate(actualCommissionedAt)
    d.setFullYear(d.getFullYear() + parseInt(termYears, 10))
    return toDateStr(d)
  }, [actualCommissionedAt, termYears])

  const equipmentLease = watch("equipment_lease")
  const maintenance = watch("maintenance")
  const computedTotal = useMemo(() => {
    const a = parseFloat(equipmentLease ?? "0") || 0
    const b = parseFloat(maintenance ?? "0") || 0
    return a + b > 0 ? (a + b).toFixed(2) : ""
  }, [equipmentLease, maintenance])

  const createMutation = useCreateContractDetails(clientUid, contractUid)
  const updateMutation = useUpdateContractDetails(
    clientUid,
    contractUid,
    existingDetails?.uid ?? ""
  )
  const mutation = existingDetails ? updateMutation : createMutation

  const handleClose = () => {
    reset()
    setStep("form")
    onClose()
  }

  const onSubmit = (values: ContractDetailsValues) => {
    const num = (v: string | undefined) => parseFloat(v ?? "0") || 0
    const int = (v: string | undefined) => parseInt(v ?? "0", 10) || 0
    const dt = (d: string | undefined) => (d ? toUtcIso(d) : undefined)

    const payload: ContractDetailsPayload = {}
    if (show("term_years")) payload.term_years = int(values.term_years)
    if (show("signing_date")) payload.signed_at = dt(values.signing_date)
    if (show("billing_frequency"))
      payload.billing_frequency = values.billing_frequency
    if (show("tariff_periods"))
      payload.tariff_periods = int(values.tariff_periods)
    if (show("tariff_indexed_rule_type") && values.tariff_indexed_rule_type)
      payload.tariff_indexed_rule_type = values.tariff_indexed_rule_type
    if (show("commissioning_date"))
      payload.commissioned_at = dt(values.commissioning_date)
    if (show("contract_end") && contractEnd)
      payload.end_at = toUtcIso(contractEnd)
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
    if (values.actual_commissioned_at)
      payload.actual_commissioned_at = dt(values.actual_commissioned_at)
    const resolvedActualEnd = values.actual_end_at || actualEnd
    if (resolvedActualEnd) payload.actual_end_at = dt(resolvedActualEnd)
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
        className="border-border w-screen! max-w-none! overflow-y-auto border bg-[#FAFAFA] p-10"
      >
        <div className=" ">
          <div className="border-border overflow-hidden rounded-2xl border bg-[#fafafa]">
            {/* ── Header ── */}
            <div className="border-border flex items-center justify-between border-b px-8 py-5">
              <p className="text-text-1 text-lg font-semibold">
                {step === "review"
                  ? "Review Contract Details"
                  : existingDetails
                    ? "Edit Contract Details"
                    : "New Contract Wizard"}
              </p>

              {step === "form" ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className="max-w-32 gap-2 rounded-sm"
                  onClick={handleSubmit(
                    () => setStep("review"),
                    () => toast.error("Please fill all required fields.")
                  )}
                >
                  Review
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outlined"
                    size="md"
                    className="gap-2 rounded-sm"
                    onClick={() => setStep("form")}
                    disabled={mutation.isPending}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    className="gap-2 rounded-sm"
                    onClick={() => onSubmit(getValues())}
                    disabled={mutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {mutation.isPending ? "Saving…" : "Confirm & Submit"}
                  </Button>
                </div>
              )}
            </div>

            <ContractSummaryBar
              clientName={clientName}
              siteName={siteName}
              contractRef="—"
              contractTypeLabel={contractTypeLabel}
              systemModeLabel={systemModeLabel}
              currency={currency}
            />

            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-6 px-8 py-6"
            >
              {step === "form" ? (
                <>
                  <ContractFieldsGrid
                    show={show}
                    register={register}
                    control={control}
                    errors={errors}
                    watch={watch}
                    contractEnd={contractEnd}
                    actualEnd={actualEnd}
                    computedTotal={computedTotal}
                  />
                  <TariffsTable
                    show={show}
                    fields={fields}
                    control={control}
                    register={register}
                  />
                </>
              ) : (
                <ContractDetailsReview
                  values={getValues()}
                  show={show}
                  contractEnd={contractEnd}
                  actualEnd={actualEnd}
                  computedTotal={computedTotal}
                  currency={currency}
                  contractTypeLabel={contractTypeLabel}
                  systemModeLabel={systemModeLabel}
                  siteName={siteName}
                  clientName={clientName}
                />
              )}
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
