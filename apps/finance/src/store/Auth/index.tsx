"use client";

import {
  createApiClient,
  defaultAuthStorage,
  getApiBaseUrl,
  getErrorMessage,
  type IdentityLoginInput,
  type ServerResponse,
  type TokenModel,
  type UserResponseModel,
  type VerifyLoginInput,
} from "@switch-fiji/api";
import { action, makeObservable, observable, runInAction } from "mobx";
import { AUTH } from "@/constants/api";
import initializer from "@/utils/initializer";
import type { RootStore } from "..";

type TokenResponse = ServerResponse<TokenModel>;
type ProfileResponse = ServerResponse<UserResponseModel>;

const api = createApiClient({
  baseUrl: getApiBaseUrl(),
  getToken: defaultAuthStorage.getToken,
});

const INIT_IS_LOADING = {
  login: false,
  verify: false,
  profile: false,
};

class AuthStore {
  rootStore: RootStore;
  isLoading = { ...INIT_IS_LOADING };
  errors = initializer(this.isLoading, "");
  accessToken = defaultAuthStorage.getToken();
  profile: UserResponseModel | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    makeObservable(this, {
      isLoading: observable,
      errors: observable,
      accessToken: observable,
      profile: observable,
      setAccessToken: action.bound,
      clearError: action.bound,
      reset: action.bound,
      login: action.bound,
      verifyLogin: action.bound,
      fetchProfile: action.bound,
    });
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  clearError(key: keyof typeof this.errors) {
    this.errors[key] = "";
  }

  reset() {
    this.isLoading = { ...INIT_IS_LOADING };
    this.errors = initializer(this.isLoading, "");
    this.accessToken = defaultAuthStorage.getToken();
    this.profile = null;
  }

  async login(payload: IdentityLoginInput): Promise<TokenResponse> {
    this.isLoading.login = true;
    this.errors.login = "";

    try {
      const response = await api.request<TokenResponse>(AUTH.LOGIN, {
        method: "POST",
        body: payload,
      });
      if (response.data.access_token) {
        defaultAuthStorage.setToken(response.data.access_token);
      }
      runInAction(() => {
        this.accessToken = response.data.access_token ?? this.accessToken;
      });
      return response;
    } catch (err) {
      const message = getErrorMessage(err);
      runInAction(() => {
        this.errors.login = message;
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading.login = false;
      });
    }
  }

  async verifyLogin(payload: VerifyLoginInput): Promise<TokenResponse> {
    this.isLoading.verify = true;
    this.errors.verify = "";

    try {
      const response = await api.request<TokenResponse>(AUTH.OTP, {
        method: "POST",
        body: payload,
      });
      if (response.data.access_token) {
        defaultAuthStorage.setToken(response.data.access_token);
      }
      runInAction(() => {
        this.accessToken = response.data.access_token ?? this.accessToken;
      });
      return response;
    } catch (err) {
      const message = getErrorMessage(err);
      runInAction(() => {
        this.errors.verify = message;
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading.verify = false;
      });
    }
  }

  async fetchProfile(): Promise<ProfileResponse> {
    this.isLoading.profile = true;
    this.errors.profile = "";

    try {
      const response = await api.request<ProfileResponse>(AUTH.GET_PROFILE, {
        method: "GET",
      });
      runInAction(() => {
        this.profile = response.data;
      });
      return response;
    } catch (err) {
      const message = getErrorMessage(err);
      runInAction(() => {
        this.errors.profile = message;
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading.profile = false;
      });
    }
  }
}

export default AuthStore;
