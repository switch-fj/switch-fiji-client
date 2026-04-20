"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarDays, CalendarPlus2 } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

type DatePickerInputProps = {
  value?: Date
  onChange?: (date: Date | undefined) => void
  /** Placeholder text shown when no date is selected. Defaults to "MM/DD/YYYY". */
  placeholder?: string
  /** Format string for date-fns. Defaults to "MM/dd/yyyy". */
  dateFormat?: string
  disabled?: boolean
  className?: string
  /** Any lucide-react icon component. Defaults to CalendarDays. */
  icon?: React.ElementType
}

function DatePickerInput({
  value,
  onChange,
  placeholder = "12/25/2025",
  dateFormat = "MM/dd/yyyy",
  disabled = false,
  className,
  icon: Icon = CalendarDays,
}: DatePickerInputProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          disabled={disabled}
          className={cn(
            "border-input h-11 justify-between border bg-white text-left font-normal",
            !value && "text-muted-foreground",
            disabled && "bg-muted/40 pointer-events-none",
            className
          )}
        >
          <span className="text-xs">
            {value ? format(value, dateFormat) : placeholder}
          </span>
          <CalendarPlus2 className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePickerInput }
export type { DatePickerInputProps }
