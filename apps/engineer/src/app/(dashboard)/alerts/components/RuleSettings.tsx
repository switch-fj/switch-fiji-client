"use client"

import { useState } from "react"
import { RotateCcw } from "lucide-react"
import {
  useAlertConfiguration,
  useResetRuleConfig,
  useUpdateRuleConfig,
} from "@/hooks/useAlerts"
import type { ConfigSource, RuleConfig } from "@/types/alerts"
import {
  RULE_META,
  SOURCE_LABEL,
  formatMinutes,
  humanizeKey,
} from "@/utils/alerts"

/**
 * Alert rule settings. Without `siteUid` these are the defaults for every
 * site; with it, they're overrides for that one site — each value shows
 * where it currently comes from (default, all sites, or this site).
 */
export function RuleSettings({ siteUid = null }: { siteUid?: string | null }) {
  const { data, isLoading, isError, error } = useAlertConfiguration(siteUid)
  const rules = data?.data.rules ?? []

  return (
    <div className="border-border/60 rounded-xl border bg-white">
      <div className="border-border/60 border-b px-5 py-4">
        <h3 className="text-base font-semibold text-[#1D1D1D]">
          {siteUid ? "Alert rules for this site" : "Alert rules"}
        </h3>
        <p className="text-muted-foreground text-sm">
          {siteUid
            ? "Override the all-sites settings for this site only. Reset a rule to follow the all-sites setting again."
            : "Defaults for every site. Individual sites can override these from their Alerts tab."}
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 p-5">
          {[0, 1].map((i) => (
            <div key={i} className="bg-muted h-20 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <p className="p-5 text-sm text-red-600">
          Couldn&apos;t load alert rules. {error.message}
        </p>
      ) : rules.length === 0 ? (
        <p className="text-muted-foreground p-5 text-sm">
          No alert rules are configured.
        </p>
      ) : (
        <ul className="divide-border/40 divide-y">
          {rules.map((rule) => (
            <RuleRow key={rule.rule_key} rule={rule} siteUid={siteUid} />
          ))}
        </ul>
      )}
    </div>
  )
}

function RuleRow({
  rule,
  siteUid,
}: {
  rule: RuleConfig
  siteUid: string | null
}) {
  const update = useUpdateRuleConfig(siteUid)
  const reset = useResetRuleConfig(siteUid)
  const { effective, saved } = rule
  const meta = RULE_META[rule.rule_key]
  const [draft, setDraft] = useState<string | null>(null)

  const minutes = draft ?? String(effective.silence_minutes)
  const parsed = Number(minutes)
  const valid = Number.isInteger(parsed) && parsed >= 1
  const dirty = draft !== null && parsed !== effective.silence_minutes
  const hasOverride = saved.enabled != null || saved.silence_minutes != null
  const busy = update.isPending || reset.isPending

  const saveMinutes = () => {
    if (!dirty || !valid) return
    update.mutate(
      { ruleKey: rule.rule_key, patch: { silence_minutes: parsed } },
      { onSuccess: () => setDraft(null) }
    )
  }

  return (
    <li className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-md">
        <p className="text-sm font-semibold text-[#1D1D1D]">
          {meta?.label ?? humanizeKey(rule.rule_key)}
        </p>
        <p className="text-muted-foreground text-sm">
          {meta?.description ?? rule.rule_key}
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Alerts</span>
          <div className="flex items-center gap-2">
            <button
              role="switch"
              aria-checked={effective.enabled}
              aria-label={`${meta?.label ?? rule.rule_key} alerts`}
              disabled={busy}
              onClick={() =>
                update.mutate({
                  ruleKey: rule.rule_key,
                  patch: { enabled: !effective.enabled },
                })
              }
              className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${effective.enabled ? "bg-[#024159]" : "bg-neutral-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${effective.enabled ? "translate-x-5" : ""}`}
              />
            </button>
            <span className="text-sm text-[#1D1D1D]">
              {effective.enabled ? "On" : "Off"}
            </span>
          </div>
          <Source source={effective.enabled_source} />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={`silence-${rule.rule_key}`}
            className="text-muted-foreground text-xs"
          >
            Alert after silent for
          </label>
          <div className="flex items-center gap-2">
            <input
              id={`silence-${rule.rule_key}`}
              type="number"
              min={1}
              step={1}
              value={minutes}
              disabled={busy}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveMinutes()
                if (e.key === "Escape") setDraft(null)
              }}
              className={`h-9 w-24 rounded-lg border px-3 text-sm tabular-nums outline-none focus:ring-1 focus:ring-[#024159] ${valid ? "border-border/60" : "border-[#FA4F19]"}`}
            />
            <span className="text-muted-foreground text-sm">min</span>
            {dirty && (
              <>
                <button
                  onClick={saveMinutes}
                  disabled={!valid || busy}
                  className="rounded-lg bg-[#024159] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setDraft(null)}
                  className="text-muted-foreground text-sm hover:text-[#1D1D1D]"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
          {!valid ? (
            <span className="text-xs text-[#B8380D]">
              Whole minutes, 1 or more
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">
              {formatMinutes(effective.silence_minutes)} ·{" "}
              {SOURCE_LABEL[effective.silence_minutes_source]}
            </span>
          )}
        </div>

        {hasOverride && (
          <button
            onClick={() => reset.mutate(rule.rule_key)}
            disabled={busy}
            className="text-muted-foreground mt-5 flex items-center gap-1.5 text-sm hover:text-[#024159] disabled:opacity-50"
            title={
              siteUid
                ? "Remove this site's overrides and follow the all-sites setting"
                : "Go back to the built-in defaults"
            }
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {siteUid ? "Use all-sites setting" : "Reset to default"}
          </button>
        )}
      </div>
    </li>
  )
}

function Source({ source }: { source: ConfigSource }) {
  return (
    <span className="text-muted-foreground text-xs">
      {SOURCE_LABEL[source]}
    </span>
  )
}
