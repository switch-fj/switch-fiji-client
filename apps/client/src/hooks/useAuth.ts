"use client"

import { useCallback, useState } from "react"
import {
  defaultAuthStorage,
  getErrorMessage,
  type EmailInput,
  type IdentityLoginInput,
  type VerifyLoginInput,
  type TokenModel,
  type UserResponseModel,
  type ServerResponse,
} from "@workspace/api"
import api from "@/lib/axios"

type TokenResponse = ServerResponse<TokenModel>
type ProfileResponse = ServerResponse<UserResponseModel>

const useAsyncAction = <TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>
) => {
  const [data, setData] = useState<TResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const run = useCallback(
    async (...args: TArgs) => {
      setLoading(true)
      setError(null)
      try {
        const result = await action(...args)
        setData(result)
        return result
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [action]
  )

  return { data, error, loading, run }
}

const login = async (payload: IdentityLoginInput): Promise<TokenResponse> => {
  const { data } = await api.post<TokenResponse>(
    "/api/v1/client/auth/login",
    payload
  )
  if (data.data.access_token) {
    defaultAuthStorage.setToken(data.data.access_token)
  }
  return data
}

const requestLogin = async (
  payload: EmailInput
): Promise<ServerResponse<boolean>> => {
  const { data } = await api.post<ServerResponse<boolean>>(
    "/api/v1/client/auth/login/request",
    payload
  )
  return data
}

const verifyLogin = async (
  payload: VerifyLoginInput
): Promise<TokenResponse> => {
  const { data } = await api.post<TokenResponse>(
    "/api/v1/client/login/verify",
    payload
  )
  if (data.data.access_token) {
    defaultAuthStorage.setToken(data.data.access_token)
  }
  return data
}

const sendVerify = async (
  payload: EmailInput
): Promise<ServerResponse<boolean>> => {
  const { data } = await api.post<ServerResponse<boolean>>(
    "/api/v1/client/verify/send",
    payload
  )
  return data
}

const verifyAccount = async (
  token: string
): Promise<ServerResponse<boolean>> => {
  const { data } = await api.get<ServerResponse<boolean>>(
    `/api/v1/client/verify/acct/${token}`
  )
  return data
}

const fetchProfile = async (): Promise<ProfileResponse> => {
  const { data } = await api.get<ProfileResponse>("/api/v1/client/profile")
  return data
}

export const useLogin = () => {
  const action = useAsyncAction<[IdentityLoginInput], TokenResponse>(login)
  return {
    login: action.run,
    data: action.data,
    error: action.error,
    isLoading: action.loading,
  }
}

export const useRequestLogin = () => {
  const action = useAsyncAction<[EmailInput], ServerResponse<boolean>>(
    requestLogin
  )
  return {
    requestLogin: action.run,
    data: action.data,
    error: action.error,
    isLoading: action.loading,
  }
}

export const useVerifyLogin = () => {
  const action = useAsyncAction<[VerifyLoginInput], TokenResponse>(verifyLogin)
  return {
    verifyLogin: action.run,
    data: action.data,
    error: action.error,
    isLoading: action.loading,
  }
}

export const useSendVerify = () => {
  const action = useAsyncAction<[EmailInput], ServerResponse<boolean>>(
    sendVerify
  )
  return {
    sendVerify: action.run,
    data: action.data,
    error: action.error,
    isLoading: action.loading,
  }
}

export const useVerifyAccount = () => {
  const action = useAsyncAction<[string], ServerResponse<boolean>>(
    verifyAccount
  )
  return {
    verifyAccount: action.run,
    data: action.data,
    error: action.error,
    isLoading: action.loading,
  }
}

export const useProfile = () => {
  const action = useAsyncAction<[], ProfileResponse>(fetchProfile)
  return {
    fetchProfile: action.run,
    data: action.data,
    error: action.error,
    isLoading: action.loading,
  }
}

export const useLogout = () => {
  return useCallback(() => {
    defaultAuthStorage.clearToken()
  }, [])
}
