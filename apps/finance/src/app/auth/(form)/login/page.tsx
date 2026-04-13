"use client";

import { LoadingView, LoginView } from "@workspace/auth";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useStore } from "@/store";

const FinanceLoginPage = observer(() => {
  const { AuthStore } = useStore();
  const router = useRouter();
  const isSubmitting = AuthStore.isLoading.login || AuthStore.isLoading.verify;

  const handleAuthSuccess = async (response: { message: string }) => {
    toast.success(response.message || "Login successful.");
    try {
      await AuthStore.fetchProfile();
    } catch (err) {
      toast.error("Unable to load profile. Please try again.");
    }
    router.replace("/dashboard");
  };

  const handleAuthError = (message: string) => {
    toast.error(message || "Login failed.");
  };

  return (
    <div className="relative flex w-full justify-center">
      <div
        className={isSubmitting ? "invisible" : "w-full flex justify-center"}
      >
        <LoginView
          login={AuthStore.login}
          verifyLogin={AuthStore.verifyLogin}
          onAuthSuccess={handleAuthSuccess}
          onAuthError={handleAuthError}
          isSubmitting={isSubmitting}
        />
      </div>
      {isSubmitting ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingView />
        </div>
      ) : null}
    </div>
  );
});

export default FinanceLoginPage;
