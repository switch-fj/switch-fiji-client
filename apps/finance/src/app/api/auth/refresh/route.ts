import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""

export async function POST(request: NextRequest) {
  const baseUrl = API_BASE_URL.replace(/\/$/, "")
  const endpoint = baseUrl.endsWith("/api/v1")
    ? `${baseUrl}/auth/new-access-token`
    : `${baseUrl}/api/v1/auth/new-access-token`

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") ?? "",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ message: "Refresh failed" }, { status: 500 })
  }
}
