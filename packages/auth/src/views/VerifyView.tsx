"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, Button } from "@workspace/ui"

type VerifyStatus = "loading" | "success" | "error"

type VerifyViewProps = {
  status: VerifyStatus
  errorMessage?: string | null
  loginPath?: string
}

export default function VerifyView({
  status,
  errorMessage,
  loginPath = "/auth/login",
}: VerifyViewProps) {
  return (
    <Card className="border-border/60 w-full max-w-lg rounded-2xl border bg-white px-10 py-12 shadow-sm">
      <CardHeader>
        <CardTitle className="text-primary text-center text-4xl font-semibold">
          {status === "loading" && "Verifying…"}
          {status === "success" && "Email verified"}
          {status === "error" && "Verification failed"}
        </CardTitle>
        <p className="text-text-1 mt-2 text-center text-sm font-normal">
          {status === "loading" && "Please wait while we verify your account."}
          {status === "success" &&
            "Your email has been verified. You can now log in."}
          {status === "error" &&
            (errorMessage ??
              "The verification link is invalid or has expired.")}
        </p>
      </CardHeader>

      {status !== "loading" && (
        <div className="mt-6 flex justify-center">
          <Link href={loginPath}>
            <Button variant="primary">Go to login</Button>
          </Link>
        </div>
      )}
    </Card>
  )
}
