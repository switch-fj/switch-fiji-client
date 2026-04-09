"use client";

import { useMemo, useState } from "react";
import {
  Button,
  FilterSelect,
  SearchInput,
  type FilterOption,
} from "@switch-fiji/ui";
import { Search, Plus } from "lucide-react";

type DashboardHeadersProps = {
  totalLabel?: string;
  totalCount?: number;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  onAddClient?: () => void;
};

const defaultFilterOptions: FilterOption[] = [
  { label: "All clients", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export default function DashboardHeaders({
  totalLabel = "Total Clients",
  totalCount = 4,
  searchPlaceholder = "Search Sites, clients",
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions,
  onAddClient,
}: DashboardHeadersProps) {
  const [localSearch, setLocalSearch] = useState("");
  const [localFilter, setLocalFilter] = useState("all");

  const resolvedSearch = searchValue ?? localSearch;
  const resolvedFilter = filterValue ?? localFilter;
  const options = useMemo(
    () => filterOptions ?? defaultFilterOptions,
    [filterOptions],
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3 ">
      <div className="flex items-center bg-primary rounded-md px-4 py-3">
        <div className="flex flex-row items-center gap-4">
          <span className="text-3xl tracking-wide text-white font-normal">
            {totalLabel}
          </span>
          <span className="text-lg h-7 w-7 flex items-center justify-center font-semibold rounded-full bg-white text-primary">
            {totalCount}
          </span>
        </div>
      </div>
      <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
        <div className="w-full sm:w-64">
          <SearchInput
            icon={<Search className="h-4 w-4 text-primary" />}
            value={resolvedSearch}
            placeholder={searchPlaceholder}
            onChange={(value) => {
              setLocalSearch(value);
              onSearchChange?.(value);
            }}
          />
        </div>
        <FilterSelect
          value={resolvedFilter}
          options={options}
          placeholder="All clients"
          className="min-w-[170px]"
          onChange={(value) => {
            setLocalFilter(value);
            onFilterChange?.(value);
          }}
        />
      </div>
    </div>
  );
}
