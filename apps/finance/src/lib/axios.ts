import axios from "axios"
import {
  defaultAuthStorage,
  getApiBaseUrl,
  type ServerResponse,
  type TokenModel,
} from "@workspace/api"

const baseURL = getApiBaseUrl().replace(/\/api\/v1\/?$/, "")

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = defaultAuthStorage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let queue: Array<(token: string) => void> = []

const processQueue = (token: string) => {
  queue.forEach((resolve) => resolve(token))
  queue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(api(original))
          })
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const { data } = await api.post<ServerResponse<TokenModel>>(
          "/api/v1/auth/new-access-token"
        )
        const newToken = data.data.access_token
        defaultAuthStorage.setToken(newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        processQueue(newToken)
        return api(original)
      } catch {
        queue = []
        defaultAuthStorage.clearToken()
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login"
        }
        return Promise.reject(
          new Error("Session expired. Please log in again.")
        )
      } finally {
        isRefreshing = false
      }
    }

    const message =
      error.response?.data?.message ?? error.message ?? "Request failed"
    return Promise.reject(new Error(message))
  }
)

export default api
