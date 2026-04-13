"use client";

import { LoginView } from "@workspace/auth";
import { useLogin, useVerifyLogin } from "@/hooks/useAuth";

export default function EngineerLoginPage() {
  const { login, isLoading: isLoginLoading } = useLogin();
  const { verifyLogin, isLoading: isVerifyLoading } = useVerifyLogin();

  return (
    <LoginView
      login={login}
      verifyLogin={verifyLogin}
      isSubmitting={isLoginLoading || isVerifyLoading}
    />
  );
}
