"use client";

import LoginView from "@workspace/auth/views/LoginView";
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
