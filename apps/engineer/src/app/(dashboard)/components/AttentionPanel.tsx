"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronRight,
  CircleAlert,
  CircleCheck,
  TrendingDown,
  WifiOff,
  type LucideIcon,
} from "lucide-react"
import type { AttentionKind, SiteOverview } from "@/hooks/useSiteOverviews"

const KIND_META: Record<AttentionKind, { icon: LucideIcon; tone: string }> = {
  offline: { icon: WifiOff, tone: "bg-[#FA4F19]/10 text-[#FA4F19]" },
  data: { icon: CircleAlert, tone: "bg-amber-100 text-amber-700" },
  drop: { icon: TrendingDown, tone: "bg-[#024159]/10 text-[#024159]" },
}

const SEVERITY: Record<AttentionKind, number> = { offline: 0, data: 1, drop: 2 }

const COLLAPSED_COUNT = 5

export function AttentionPanel({
  overviews,
  isLoading,
  isCheckingProduction,
}: {
  overviews: SiteOverview[]
  isLoading: boolean
  isCheckingProduction: boolean
}) {
  const router = useRouter()
  const [showAll, setShowAll] = useState(false)

  // One line per issue, most severe kind first, then by site name.
  const rows = overviews
    .flatMap((o) => o.attention.map((item) => ({ overview: o, item })))
    .sort(
      (a, b) =>
        SEVERITY[a.item.kind] - SEVERITY[b.item.kind] ||
        (a.overview.site.site_name ?? "").localeCompare(
          b.overview.site.site_name ?? ""
        )
    )
  const visible = showAll ? rows : rows.slice(0, COLLAPSED_COUNT)

  return (
    <div className="border-border/60 rounded-xl border bg-white shadow-sm">
      <div className="border-border/60 flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-baseline gap-2">
          <h2 className="text-base font-semibold text-[#1D1D1D]">
            Needs attention
          </h2>
          {rows.length > 0 && (
            <span className="text-muted-foreground text-sm">{rows.length}</span>
          )}
        </div>
        {isCheckingProduction && !isLoading && (
          <span className="text-muted-foreground text-xs">
            Checking production data…
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 p-5">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="bg-muted h-10 w-full animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        isCheckingProduction ? null : (
          <p className="flex items-center gap-2 px-5 py-4 text-sm text-green-700">
            <CircleCheck className="h-4 w-4" />
            All sites are online and reporting production.
          </p>
        )
      ) : (
        <>
          <ul className="divide-border/40 divide-y">
            {visible.map(({ overview, item }, i) => {
              const { icon: Icon, tone } = KIND_META[item.kind]
              const siteName = overview.site.site_name ?? "Unnamed site"
              return (
                <li key={`${overview.site.uid}-${item.kind}-${i}`}>
                  <button
                    onClick={() =>
                      router.push(
                        `/sites/${overview.site.uid}?name=${encodeURIComponent(siteName)}`
                      )
                    }
                    className="hover:bg-muted/30 flex w-full items-center gap-3 px-5 py-3 text-left transition-colors"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-[#1D1D1D]">
                        <span className="font-semibold">{siteName}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          · {overview.client.client_name}
                        </span>
                      </span>
                      <span className="block truncate text-sm">
                        {item.title}
                        {item.detail && (
                          <span className="text-muted-foreground">
                            {" "}
                            — {item.detail}
                          </span>
                        )}
                      </span>
                    </span>
                    <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
                  </button>
                </li>
              )
            })}
          </ul>
          {rows.length > COLLAPSED_COUNT && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="border-border/60 w-full border-t px-5 py-2.5 text-sm font-medium text-[#024159] hover:bg-neutral-50"
            >
              {showAll ? "Show fewer" : `Show all ${rows.length}`}
            </button>
          )}
        </>
      )}
    </div>
  )
}
