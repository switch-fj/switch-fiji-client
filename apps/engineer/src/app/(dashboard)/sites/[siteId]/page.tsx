"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { SiteDetailView } from "./SiteDetailView"

export default function SiteDetailPage() {
  const router = useRouter()
  const params = useParams<{ siteId: string }>()
  const searchParams = useSearchParams()

  return (
    <SiteDetailView
      siteId={params.siteId}
      siteName={searchParams.get("name") ?? "Site"}
      location={searchParams.get("location") ?? undefined}
      onBack={() => router.back()}
    />
  )
}
