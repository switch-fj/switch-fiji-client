"use client"

import { useParams, useRouter } from "next/navigation"
import { MpptChartView } from "./MpptChartView"

export default function MpptChartPage() {
  const router = useRouter()
  const params = useParams<{ siteId: string }>()

  return <MpptChartView siteId={params.siteId} onBack={() => router.back()} />
}
