import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_PREFIXES = ["/auth"]
const AUTH_COOKIE = "access_token"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
const SESSION_SECRET = process.env.NEXT_PUBLIC_SESSION_SECRET ?? ""

const xorCipher = (input: string, key: string) => {
  if (!key) return input
  let output = ""
  for (let i = 0; i < input.length; i += 1) {
    output += String.fromCharCode(
      input.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    )
  }
  return output
}

const encodeToken = (token: string) => {
  if (!SESSION_SECRET) return token
  try {
    return btoa(xorCipher(token, SESSION_SECRET))
  } catch {
    return token
  }
}

const decodeToken = (token: string) => {
  if (!SESSION_SECRET) return token
  try {
    return xorCipher(atob(token), SESSION_SECRET)
  } catch {
    return token
  }
}

const baseUrl = () => {
  const url = API_BASE_URL.replace(/\/$/, "")
  const prefix = url.endsWith("/api/v1") ? "" : "/api/v1"
  return `${url}${prefix}`
}

const isTokenValid = async (token: string) => {
  if (!API_BASE_URL) return false
  try {
    const response = await fetch(`${baseUrl()}/auth/profile`, {
      method: "GET",
      headers: { Authorization: `Bearer ${decodeToken(token)}` },
    })
    return response.ok
  } catch {
    return false
  }
}

const refreshAccessToken = async (
  request: NextRequest
): Promise<string | null> => {
  if (!API_BASE_URL) return null
  try {
    const response = await fetch(`${baseUrl()}/auth/new-access-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") ?? "",
      },
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.data?.access_token ?? null
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value
  const tokenValid = token ? await isTokenValid(token) : false

  if (!tokenValid) {
    const newToken = await refreshAccessToken(request)

    if (!newToken) {
      const loginUrl = new URL("/auth/login", request.url)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.set(AUTH_COOKIE, "", { path: "/", maxAge: 0 })
      return response
    }

    const encoded = encodeToken(newToken)
    const response = NextResponse.next()
    response.cookies.set(AUTH_COOKIE, encoded, {
      path: "/",
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
