"use client"

import { Controller } from "react-hook-form"
import type {
  Control,
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
} from "react-hook-form"
import {
  Input,
  DatePickerInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui"
import {
  VIS,
  BILLING_FREQUENCY_OPTIONS,
  TARIFF_PERIOD_OPTIONS,
  IMPLEMENTATION_PERIOD_OPTIONS,
  TARIFF_INDEXED_RULE_TYPE_OPTIONS,
} from "@/constants/contract"
import { localDate, toDateStr } from "@/constants/contractDetails"
import type { ContractDetailsValues } from "@/constants/contractDetails"

const LABEL = "shrink-0 whitespace-nowrap text-sm text-text-1 font-medium"

type Props = {
  show: (field: keyof typeof VIS) => boolean
  register: UseFormRegister<ContractDetailsValues>
  control: Control<ContractDetailsValues>
  errors: FieldErrors<ContractDetailsValues>
  watch: UseFormWatch<ContractDetailsValues>
  contractEnd: string
  actualEnd: string
  computedTotal: string
}

export default function ContractFieldsGrid({
  show,
  register,
  control,
  errors,
  watch,
  contractEnd,
  actualEnd,
  computedTotal,
}: Props) {
  return (
    <div className="grid grid-cols-[400px_350px_350px] gap-x-12 gap-y-5">
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

      {show("signing_date") && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <label className={LABEL}>Contract Signing Date</label>
            <Controller
              name="signing_date"
              control={control}
              render={({ field }) => (
                <DatePickerInput
                  value={field.value ? localDate(field.value) : undefined}
                  onChange={(d) => field.onChange(d ? toDateStr(d) : "")}
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

      {show("billing_frequency") && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <label className={LABEL}>Billing Frequency</label>
            <Controller
              name="billing_frequency"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
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

      {show("tariff_periods") && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <label className={LABEL}>Tariff Periods</label>
            <Controller
              name="tariff_periods"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
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

      {show("tariff_indexed_rule_type") && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <label className={LABEL}>Tariff Rule Type</label>
            <Controller
              name="tariff_indexed_rule_type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full bg-white font-normal">
                    <SelectValue placeholder="Select rule type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TARIFF_INDEXED_RULE_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {errors.tariff_indexed_rule_type && (
            <p className="text-destructive text-xs">
              {errors.tariff_indexed_rule_type.message}
            </p>
          )}
        </div>
      )}

      {show("commissioning_date") && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <label className={LABEL}>Expected Commissioning Date</label>
            <Controller
              name="commissioning_date"
              control={control}
              render={({ field }) => (
                <DatePickerInput
                  value={field.value ? localDate(field.value) : undefined}
                  className="flex-1"
                  onChange={(d) => field.onChange(d ? toDateStr(d) : "")}
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

      {show("contract_end") && (
        <div className="flex items-center gap-3">
          <label className={LABEL}>Expected End Date</label>
          <DatePickerInput
            value={contractEnd ? localDate(contractEnd) : undefined}
            className="flex-1"
            disabled
          />
        </div>
      )}

      {show("actual_commissioned_at") && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <label className={LABEL}>
              Actual Commissioned Date{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Controller
              name="actual_commissioned_at"
              control={control}
              render={({ field }) => (
                <DatePickerInput
                  value={field.value ? localDate(field.value) : undefined}
                  className="flex-1"
                  onChange={(d) => field.onChange(d ? toDateStr(d) : "")}
                />
              )}
            />
          </div>
        </div>
      )}

      {show("actual_end_at") && (
        <div className="flex items-center gap-3">
          <label className={LABEL}>
            Actual End Date{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </label>
          <DatePickerInput
            value={
              watch("actual_end_at")
                ? localDate(watch("actual_end_at")!)
                : actualEnd
                  ? localDate(actualEnd)
                  : undefined
            }
            className="flex-1"
            disabled
          />
        </div>
      )}

      {show("implementation_period") && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <label className={LABEL}>Implementation Period</label>
            <Controller
              name="implementation_period"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
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

      {show("client_email") && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <label className={LABEL}>
              Client email <span className="opacity-60">(for invoice)</span>
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

      {show("grid_meter_reading") && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <label className={LABEL}>Grid Meter Reading at Commissioning</label>
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

      {show("guaranteed_production") && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <label className={LABEL}>Guaranteed Production (kWh/kWp)</label>
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

      {show("solar_production_month") && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <label className={LABEL}>Solar Production this Month</label>
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

      {show("monthly_baseline_consumption") && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <label className={LABEL}>Monthly Baseline Consumption (kWh)</label>
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

      {show("minimum_consumption_monthly") && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <label className={LABEL}>Minimum Monthly Consumption (kWh)</label>
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
  )
}
