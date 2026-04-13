"use client";

import { Input } from "../ui/input";
import type { ChangeEvent, ReactNode } from "react";
import { cn } from "../../lib/utils";

export type SearchInputProps = {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  icon?: ReactNode;
};

export default function SearchInput({
  value,
  placeholder = "Search",
  onChange,
  className,
  icon,
}: SearchInputProps) {
  return (
    <div className="relative border border-[#A1A1A1]/40 rounded-md">
      {icon ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
      ) : null}
      <Input
        value={value}
        placeholder={placeholder}
        className={cn(
          icon
            ? "pl-10 bg-white placeholder:text-[#1D1D1D] placeholder:text-sm text-[#1D1D1D] font-light"
            : "",
          className,
        )}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange?.(event.target.value);
        }}
      />
    </div>
  );
}
