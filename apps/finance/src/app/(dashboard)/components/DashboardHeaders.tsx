"use client"

import { useMemo, useState } from "react"
import {
  Button,
  FilterSelect,
  SearchInput,
  type FilterOption,
} from "@workspace/ui"
import { Search, Plus } from "lucide-react"

type DashboardHeadersProps = {
  totalLabel?: string
  totalCount?: number
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filterValue?: string
  onFilterChange?: (value: string) => void
  filterOptions?: FilterOption[]
  onAddClient?: () => void
}

const defaultFilterOptions: FilterOption[] = [
  { label: "All clients", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

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
  const [localSearch, setLocalSearch] = useState("")
  const [localFilter, setLocalFilter] = useState("all")

  const resolvedSearch = searchValue ?? localSearch
  const resolvedFilter = filterValue ?? localFilter
  const options = useMemo(
    () => filterOptions ?? defaultFilterOptions,
    [filterOptions]
  )

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="bg-primary flex items-center rounded-md px-4 py-3">
        <div className="flex flex-row items-center gap-4">
          <span className="text-3xl font-normal tracking-wide text-white">
            {totalLabel}
          </span>
          <span className="text-primary flex h-7 w-7 items-center justify-center rounded-full bg-white text-lg font-semibold">
            {totalCount}
          </span>
        </div>
      </div>
      <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
        <div className="w-full sm:w-64">
          <SearchInput
            icon={<Search className="text-primary h-4 w-4" />}
            value={resolvedSearch}
            placeholder={searchPlaceholder}
            onChange={(value) => {
              setLocalSearch(value)
              onSearchChange?.(value)
            }}
          />
        </div>
        <FilterSelect
          value={resolvedFilter}
          options={options}
          placeholder="All clients"
          className="min-w-[170px]"
          onChange={(value) => {
            setLocalFilter(value)
            onFilterChange?.(value)
          }}
        />
      </div>
    </div>
  )
}
