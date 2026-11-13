"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { MpptChartView } from "./MpptChartView"
import { SETUP_VIEWS, type SetupViewKey } from "./setupViews"

export default function SystemSetupPage() {
  const router = useRouter()
  const params = useParams<{ siteId: string }>()
  const searchParams = useSearchParams()

  const raw = searchParams.get("view")
  const view: SetupViewKey = SETUP_VIEWS.some((v) => v.key === raw)
    ? (raw as SetupViewKey)
    : "mppt"

  // Keep the open section in the URL so refresh/back/shared links return to it.
  const setView = (next: SetupViewKey) => {
    const q = new URLSearchParams(searchParams.toString())
    q.set("view", next)
    router.replace(`?${q.toString()}`, { scroll: false })
  }

  return (
    <MpptChartView
      siteId={params.siteId}
      siteName={searchParams.get("name") ?? "Site"}
      view={view}
      onViewChange={setView}
      onBack={() => router.back()}
    />
  )
}
