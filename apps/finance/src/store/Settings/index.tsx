"use client"

import { action, makeObservable, observable, runInAction } from "mobx"
import { toast } from "sonner"
import {
  getContractSettings,
  updateContractSettings,
} from "@/requests/settings"
import type {
  ContractSettingsRespModel,
  ContractSettingsUpdateInput,
} from "@/types/settings"
import type { RootStore } from "@/store"

const INIT_IS_LOADING = {
  fetch: false,
  update: false,
}

class SettingsStore {
  rootStore: RootStore
  settings: ContractSettingsRespModel | null = null
  isLoading = { ...INIT_IS_LOADING }
  errors = { fetch: "", update: "" }

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore

    makeObservable(this, {
      settings: observable,
      isLoading: observable,
      errors: observable,
      fetchSettings: action.bound,
      updateSettings: action.bound,
    })
  }

  async fetchSettings() {
    if (this.settings !== null) return

    this.isLoading.fetch = true
    this.errors.fetch = ""

    try {
      const response = await getContractSettings()
      runInAction(() => {
        this.settings = response.data
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load settings"
      runInAction(() => {
        this.errors.fetch = message
      })
    } finally {
      runInAction(() => {
        this.isLoading.fetch = false
      })
    }
  }

  async updateSettings(payload: ContractSettingsUpdateInput): Promise<boolean> {
    this.isLoading.update = true
    this.errors.update = ""

    try {
      await updateContractSettings(payload)
      const fresh = await getContractSettings()
      runInAction(() => {
        this.settings = fresh.data
      })
      toast.success("Settings saved successfully")
      return true
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save settings"
      runInAction(() => {
        this.errors.update = message
      })
      toast.error(message)
      return false
    } finally {
      runInAction(() => {
        this.isLoading.update = false
      })
    }
  }
}

export default SettingsStore
