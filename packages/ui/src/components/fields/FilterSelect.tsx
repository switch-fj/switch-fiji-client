"use client";

import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../../lib/utils";

export type FilterOption = {
  label: string;
  value: string;
  icon?: ReactNode;
};

export type FilterSelectProps = {
  value?: string;
  placeholder?: string;
  options: FilterOption[];
  onChange?: (value: string) => void;
  className?: string;
};

export default function FilterSelect({
  value,
  placeholder = "All",
  options,
  onChange,
  className,
}: FilterSelectProps) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Select value={value} onValueChange={(nextValue) => onChange?.(nextValue)}>
      <SelectTrigger
        className={cn(
          "bg-white border border-[#A1A1A1]/40 text-[#1D1D1D] font-light",
          className,
        )}
      >
        {selectedOption?.icon ? (
          <span className="inline-flex items-center text-muted-foreground">
            {selectedOption.icon}
          </span>
        ) : null}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.icon ? (
              <span className="inline-flex items-center text-muted-foreground">
                {option.icon}
              </span>
            ) : null}
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
