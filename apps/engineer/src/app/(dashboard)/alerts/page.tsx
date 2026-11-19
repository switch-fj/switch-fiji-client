import { Suspense } from "react"
import AlertsView from "./AlertsView"

export default function AlertsPage() {
  return (
    <Suspense fallback={null}>
      <AlertsView />
    </Suspense>
  )
}
