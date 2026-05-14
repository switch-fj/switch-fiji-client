"use client"

import { useMemo, useState } from "react"
import { FilterSelect, SearchInput, type FilterOption } from "@workspace/ui"
import { Search, Zap, FileText } from "lucide-react"
import type { PortfolioStats } from "@/types/portfolio"

type DashboardHeadersProps = {
  portfolioStats?: PortfolioStats | null
  isLoadingStats?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filterValue?: string
  onFilterChange?: (value: string) => void
  filterOptions?: FilterOption[]
}

const defaultFilterOptions: FilterOption[] = [
  { label: "All clients", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

function StatTile({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="bg-primary flex items-center gap-3 rounded-md px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-white/70">{label}</p>
        <p className="text-xl font-semibold text-white">{value}</p>
        {sub && <p className="text-xs text-white/60">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardHeaders({
  portfolioStats,
  isLoadingStats,
  searchPlaceholder = "Search Sites, clients",
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions,
}: DashboardHeadersProps) {
  const [localSearch, setLocalSearch] = useState("")
  const [localFilter, setLocalFilter] = useState("all")

  const resolvedSearch = searchValue ?? localSearch
  const resolvedFilter = filterValue ?? localFilter
  const options = useMemo(
    () => filterOptions ?? defaultFilterOptions,
    [filterOptions]
  )

  const fmt = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toFixed(1)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex flex-wrap gap-3">
        {isLoadingStats ? (
          <>
            <div className="bg-primary/20 h-16 w-56 animate-pulse rounded-md" />
            <div className="bg-primary/20 h-16 w-56 animate-pulse rounded-md" />
          </>
        ) : (
          <>
            <StatTile
              icon={<Zap className="h-4 w-4 text-white" />}
              label="Production this month"
              value={
                portfolioStats ? `${fmt(portfolioStats.produced_kwh)} kWh` : "—"
              }
              sub={
                portfolioStats
                  ? `Baseline ${fmt(portfolioStats.baseline_kwh)} kWh`
                  : undefined
              }
            />
            <StatTile
              icon={<FileText className="h-4 w-4 text-white" />}
              label="Invoice total this month"
              value={
                portfolioStats
                  ? `FJD ${portfolioStats.invoice_total.toLocaleString()}`
                  : "—"
              }
              sub={
                portfolioStats
                  ? `${portfolioStats.invoice_count} invoice${portfolioStats.invoice_count !== 1 ? "s" : ""}`
                  : undefined
              }
            />
          </>
        )}
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
