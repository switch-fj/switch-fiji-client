"use client"

import {
  defaultAuthStorage,
  getErrorMessage,
  type IdentityLoginInput,
  type ServerResponse,
  type TokenModel,
  type UserResponseModel,
  type VerifyLoginInput,
} from "@workspace/api"
import { action, makeObservable, observable, runInAction } from "mobx"
import api from "@/lib/axios"
import initializer from "@/utils/initializer"
import type { RootStore } from ".."

type TokenResponse = ServerResponse<TokenModel>
type ProfileResponse = ServerResponse<UserResponseModel>

const INIT_IS_LOADING = {
  login: false,
  verify: false,
  profile: false,
}

class AuthStore {
  rootStore: RootStore
  isLoading = { ...INIT_IS_LOADING }
  errors = initializer(this.isLoading, "")
  accessToken = defaultAuthStorage.getToken()
  profile: UserResponseModel | null = null

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore

    makeObservable(this, {
      isLoading: observable,
      errors: observable,
      accessToken: observable,
      profile: observable,
      setAccessToken: action.bound,
      clearError: action.bound,
      reset: action.bound,
      logout: action.bound,
      login: action.bound,
      verifyLogin: action.bound,
      fetchProfile: action.bound,
    })
  }

  setAccessToken(token: string | null) {
    this.accessToken = token
  }

  clearError(key: keyof typeof this.errors) {
    this.errors[key] = ""
  }

  logout() {
    defaultAuthStorage.clearToken()
    this.accessToken = null
    this.profile = null
  }

  reset() {
    this.isLoading = { ...INIT_IS_LOADING }
    this.errors = initializer(this.isLoading, "")
    this.accessToken = defaultAuthStorage.getToken()
    this.profile = null
  }

  async login(payload: IdentityLoginInput): Promise<TokenResponse> {
    this.isLoading.login = true
    this.errors.login = ""

    try {
      const { data: response } = await api.post<TokenResponse>(
        "/api/v1/auth/login",
        payload
      )
      if (response.data.access_token) {
        defaultAuthStorage.setToken(response.data.access_token)
      }
      runInAction(() => {
        this.accessToken = response.data.access_token ?? this.accessToken
      })
      console.log("[Auth] Login cookies:", document.cookie)
      return response
    } catch (err) {
      const message = getErrorMessage(err)
      runInAction(() => {
        this.errors.login = message
      })
      throw err
    } finally {
      runInAction(() => {
        this.isLoading.login = false
      })
    }
  }

  async verifyLogin(payload: VerifyLoginInput): Promise<TokenResponse> {
    this.isLoading.verify = true
    this.errors.verify = ""

    try {
      const { data: response } = await api.post<TokenResponse>(
        "/api/v1/auth/login/verify",
        payload
      )
      if (response.data.access_token) {
        defaultAuthStorage.setToken(response.data.access_token)
      }
      runInAction(() => {
        this.accessToken = response.data.access_token ?? this.accessToken
      })
      console.log("[Auth] VerifyLogin cookies:", document.cookie)
      return response
    } catch (err) {
      const message = getErrorMessage(err)
      runInAction(() => {
        this.errors.verify = message
      })
      throw err
    } finally {
      runInAction(() => {
        this.isLoading.verify = false
      })
    }
  }

  async fetchProfile(): Promise<ProfileResponse> {
    this.isLoading.profile = true
    this.errors.profile = ""

    try {
      const { data: response } = await api.get<ProfileResponse>(
        "/api/v1/auth/profile"
      )
      runInAction(() => {
        this.profile = response.data
      })
      return response
    } catch (err) {
      const message = getErrorMessage(err)
      runInAction(() => {
        this.errors.profile = message
      })
      throw err
    } finally {
      runInAction(() => {
        this.isLoading.profile = false
      })
    }
  }
}

export default AuthStore
