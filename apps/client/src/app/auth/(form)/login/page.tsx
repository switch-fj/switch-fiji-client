"use client";

import LoginView from "@switch-fiji/auth/views/LoginView";
import { useLogin, useVerifyLogin } from "@/hooks/useAuth";

export default function ClientLoginPage() {
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
