export type AuthStorage = {
  getToken: () => string | null
  setToken: (token: string) => void
  clearToken: () => void
}

const SECRET = process.env.NEXT_PUBLIC_SESSION_SECRET ?? ""

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

const encodeToken = (token: string) => {
  if (!SECRET) {
    return token
  }
  try {
    return btoa(xorCipher(token, SECRET))
  } catch {
    return token
  }
}

const decodeToken = (token: string) => {
  if (!SECRET) {
    return token
  }
  try {
    return xorCipher(atob(token), SECRET)
  } catch {
    return token
  }
}

export const defaultAuthStorage: AuthStorage = {
  getToken: () => {
    if (typeof window === "undefined") {
      return null
    }
    const stored = window.localStorage.getItem("access_token")
    return stored ? decodeToken(stored) : null
  },
  setToken: (token: string) => {
    if (typeof window === "undefined") {
      return
    }
    window.localStorage.setItem("access_token", encodeToken(token))
  },
  clearToken: () => {
    if (typeof window === "undefined") {
      return
    }
    window.localStorage.removeItem("access_token")
  },
}
