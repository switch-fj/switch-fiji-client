"use client"

import { action, makeObservable, observable, runInAction } from "mobx"
import { toast } from "sonner"
import {
  getContractSettings,
  updateContractSettings,
  getEFLRateHistory,
  getVATRateHistory,
} from "@/requests/settings"
import type {
  ContractSettingsRespModel,
  ContractSettingsUpdateInput,
  EFLRateHistoryRespModel,
  VATRateHistoryRespModel,
} from "@/types/settings"
import type { RootStore } from "@/store"

const INIT_IS_LOADING = {
  fetch: false,
  update: false,
  history: false,
}

class SettingsStore {
  rootStore: RootStore
  settings: ContractSettingsRespModel | null = null
  eflHistory: EFLRateHistoryRespModel[] | null = null
  vatHistory: VATRateHistoryRespModel[] | null = null
  isLoading = { ...INIT_IS_LOADING }
  errors = { fetch: "", update: "", history: "" }

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore

    makeObservable(this, {
      settings: observable,
      eflHistory: observable,
      vatHistory: observable,
      isLoading: observable,
      errors: observable,
      fetchSettings: action.bound,
      updateSettings: action.bound,
      fetchHistory: action.bound,
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

  async fetchHistory() {
    if (this.eflHistory !== null && this.vatHistory !== null) return

    this.isLoading.history = true
    this.errors.history = ""

    try {
      const [efl, vat] = await Promise.all([
        getEFLRateHistory(),
        getVATRateHistory(),
      ])
      runInAction(() => {
        this.eflHistory = efl.data
        this.vatHistory = vat.data
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load rate history"
      runInAction(() => {
        this.errors.history = message
      })
    } finally {
      runInAction(() => {
        this.isLoading.history = false
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
        // invalidate history so it re-fetches fresh rates after a save
        this.eflHistory = null
        this.vatHistory = null
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
