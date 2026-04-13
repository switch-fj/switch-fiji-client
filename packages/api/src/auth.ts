import { createApiClient } from "./client";
import {
  EmailSchema,
  IdentityLoginSchema,
  VerifyLoginSchema,
  TokenSchema,
  UserResponseSchema,
  ServerResponseSchema,
} from "./schemas";
import { z } from "zod";
import type { AuthStorage } from "./storage";
import { defaultAuthStorage } from "./storage";
import type { EmailInput, IdentityLoginInput, VerifyLoginInput } from "./types";

export type AuthScope = "core" | "client";

const getAuthPaths = (scope: AuthScope) => {
  if (scope === "client") {
    return {
      login: "/api/v1/client/auth/login",
      requestLogin: "/api/v1/client/auth/login/request",
      verifyLogin: "/api/v1/client/login/verify",
      sendVerify: "/api/v1/client/verify/send",
      verifyAccount: (token: string) => `/api/v1/client/verify/acct/${token}`,
      profile: "/api/v1/client/profile",
    };
  }

  return {
    login: "/api/v1/auth/login",
    requestLogin: null,
    verifyLogin: "/api/v1/auth/login/verify",
    sendVerify: "/api/v1/auth/verify/send",
    verifyAccount: (token: string) => `/api/v1/auth/verify/acct/${token}`,
    profile: "/api/v1/auth/profile",
  };
};

export const createAuthClient = ({
  baseUrl,
  scope,
  storage = defaultAuthStorage,
}: {
  baseUrl: string;
  scope: AuthScope;
  storage?: AuthStorage;
}) => {
  const api = createApiClient({ baseUrl, getToken: storage.getToken });
  const paths = getAuthPaths(scope);

  const tokenResponse = ServerResponseSchema(TokenSchema);
  const userResponse = ServerResponseSchema(UserResponseSchema);
  const booleanResponse = ServerResponseSchema(z.boolean());

  const login = async (payload: IdentityLoginInput) => {
    const data = await api.request(paths.login, {
      method: "POST",
      body: IdentityLoginSchema.parse(payload),
    });
    const response = tokenResponse.parse(data);
    if (response.data.access_token) {
      storage.setToken(response.data.access_token);
    }
    return response;
  };

  const requestLogin = async (payload: EmailInput) => {
    if (!paths.requestLogin) {
      throw new Error("Request login is not available for this scope.");
    }
    const data = await api.request(paths.requestLogin, {
      method: "POST",
      body: EmailSchema.parse(payload),
    });
    return booleanResponse.parse(data);
  };

  const verifyLogin = async (payload: VerifyLoginInput) => {
    const data = await api.request(paths.verifyLogin, {
      method: "POST",
      body: VerifyLoginSchema.parse(payload),
    });
    const response = tokenResponse.parse(data);
    if (response.data.access_token) {
      storage.setToken(response.data.access_token);
    }
    return response;
  };

  const sendVerify = async (payload: EmailInput) => {
    const data = await api.request(paths.sendVerify, {
      method: "POST",
      body: EmailSchema.parse(payload),
    });
    return booleanResponse.parse(data);
  };

  const verifyAccount = async (token: string) => {
    const data = await api.request(paths.verifyAccount(token), {
      method: "GET",
    });
    return booleanResponse.parse(data);
  };

  const profile = async () => {
    const data = await api.request(paths.profile, {
      method: "GET",
    });
    return userResponse.parse(data);
  };

  const logout = () => {
    storage.clearToken();
  };

  return {
    login,
    requestLogin,
    verifyLogin,
    sendVerify,
    verifyAccount,
    profile,
    logout,
  };
};
