"use client";

import { useCallback, useState } from "react";
import {
  createAuthClient,
  defaultAuthStorage,
  getApiBaseUrl,
  getErrorMessage,
  type EmailInput,
  type IdentityLoginInput,
  type VerifyLoginInput,
  type TokenModel,
  type UserResponseModel,
} from "@workspace/api";

const authClient = createAuthClient({
  baseUrl: getApiBaseUrl(),
  scope: "core",
  storage: defaultAuthStorage,
});

const useAsyncAction = <TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
) => {
  const [data, setData] = useState<TResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (...args: TArgs) => {
      setLoading(true);
      setError(null);
      try {
        const result = await action(...args);
        setData(result);
        return result;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [action],
  );

  return { data, error, loading, run };
};

export const useLogin = () => {
  const action = useAsyncAction<
    [IdentityLoginInput],
    { data: TokenModel; message: string }
  >(authClient.login);

  return {
    login: action.run,
    data: action.data,
    error: action.error,
    isLoading: action.loading,
  };
};

export const useVerifyLogin = () => {
  const action = useAsyncAction<
    [VerifyLoginInput],
    { data: TokenModel; message: string }
  >(authClient.verifyLogin);

  return {
    verifyLogin: action.run,
    data: action.data,
    error: action.error,
    isLoading: action.loading,
  };
};

export const useSendVerify = () => {
  const action = useAsyncAction<
    [EmailInput],
    { data: boolean; message: string }
  >(authClient.sendVerify);

  return {
    sendVerify: action.run,
    data: action.data,
    error: action.error,
    isLoading: action.loading,
  };
};

export const useVerifyAccount = () => {
  const action = useAsyncAction<[string], { data: boolean; message: string }>(
    authClient.verifyAccount,
  );

  return {
    verifyAccount: action.run,
    data: action.data,
    error: action.error,
    isLoading: action.loading,
  };
};

export const useProfile = () => {
  const action = useAsyncAction<
    [],
    { data: UserResponseModel; message: string }
  >(authClient.profile);

  return {
    fetchProfile: action.run,
    data: action.data,
    error: action.error,
    isLoading: action.loading,
  };
};

export const useLogout = () => {
  return useCallback(() => {
    authClient.logout();
  }, []);
};
