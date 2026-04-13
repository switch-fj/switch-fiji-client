import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_PREFIXES = ["/auth"]
const AUTH_COOKIE = "access_token"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
const SESSION_SECRET = process.env.NEXT_PUBLIC_SESSION_SECRET ?? ""

const xorCipher = (input: string, key: string) => {
  if (!key) {
    return input
  }
  let output = ""
  for (let i = 0; i < input.length; i += 1) {
    output += String.fromCharCode(
      input.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    )
  }
  return output
}

const decodeToken = (token: string) => {
  if (!SESSION_SECRET) {
    return token
  }
  try {
    return xorCipher(atob(token), SESSION_SECRET)
  } catch {
    return token
  }
}

const isTokenValid = async (token: string) => {
  if (!API_BASE_URL) {
    return false
  }

  const normalizedBaseUrl = API_BASE_URL.replace(/\/$/, "")
  const profilePath = normalizedBaseUrl.endsWith("/api/v1")
    ? "/auth/profile"
    : "/api/v1/auth/profile"

  try {
    const response = await fetch(`${normalizedBaseUrl}${profilePath}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${decodeToken(token)}`,
      },
    })
    return response.ok
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value

  if (!token) {
    const loginUrl = new URL("/auth/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  const tokenIsValid = await isTokenValid(token)
  if (!tokenIsValid) {
    const loginUrl = new URL("/auth/login", request.url)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.set(AUTH_COOKIE, "", { path: "/", maxAge: 0 })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
