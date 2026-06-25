"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { VerifyView } from "@workspace/auth"
import { useVerifyAccount } from "@/hooks/useAuth"

type VerifyStatus = "loading" | "success" | "error"

function VerifyContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const { verifyAccount } = useVerifyAccount()
  const [status, setStatus] = useState<VerifyStatus>("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    if (!token) {
      setErrorMessage("No verification token provided.")
      setStatus("error")
      return
    }

    verifyAccount(token)
      .then(() => setStatus("success"))
      .catch((err: unknown) => {
        setErrorMessage(
          err instanceof Error ? err.message : "Verification failed."
        )
        setStatus("error")
      })
  }, [token, verifyAccount])

  return <VerifyView status={status} errorMessage={errorMessage} />
}

export default function EngineerVerifyPage() {
  return (
    <Suspense fallback={<VerifyView status="loading" errorMessage={null} />}>
      <VerifyContent />
    </Suspense>
  )
}
