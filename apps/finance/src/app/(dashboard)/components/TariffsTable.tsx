"use client"

import { Controller, useWatch } from "react-hook-form"
import type {
  Control,
  UseFormRegister,
  FieldArrayWithId,
} from "react-hook-form"
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui"
import { VIS, TARIFF_SLOT_TYPE_OPTIONS } from "@/constants/contract"
import type { ContractDetailsValues } from "@/constants/contractDetails"

type Props = {
  show: (field: keyof typeof VIS) => boolean
  fields: FieldArrayWithId<ContractDetailsValues, "tariffs", "id">[]
  control: Control<ContractDetailsValues>
  register: UseFormRegister<ContractDetailsValues>
}

export default function TariffsTable({
  show,
  fields,
  control,
  register,
}: Props) {
  const tariffValues = useWatch({ control, name: "tariffs" })

  if (!show("tariffs_table")) return null

  return (
    <div className="border-border mt-5 overflow-hidden rounded-lg border">
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
        fields.map((field, index) => {
          const isVariable = tariffValues?.[index]?.slot_type === "Variable"
          return (
            <div
              key={field.id}
              className="border-border grid grid-cols-[200px_1fr_180px] items-center gap-3 border-t bg-white px-4 py-2.5"
            >
              <span className="text-foreground text-sm font-medium">
                Tariff {field.period_number}/{field.slot}
              </span>

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

              <div className="relative flex items-center">
                <Input
                  type="number"
                  step="0.01"
                  className="border-input h-9 border bg-white pr-14 text-sm"
                  placeholder="0.00"
                  {...register(`tariffs.${index}.rate`)}
                />
                <span className="text-muted-foreground pointer-events-none absolute right-2.5 text-xs">
                  {isVariable ? "%" : "$/kWh"}
                </span>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
