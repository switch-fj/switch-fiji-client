"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@workspace/ui";
import { useLogout } from "@/hooks/useAuth";
import { DASHBOARD_LINKS } from "@/constants/routes";
import QueryProvider from "@/providers/QueryProvider";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function FinanceDashboardLayout({
  children,
}: DashboardLayoutProps) {
  const router = useRouter();
  const logout = useLogout();

  const handleLogout = useCallback(async () => {
    logout();
    await new Promise((resolve) => setTimeout(resolve, 800));
    router.replace("/auth/login");
  }, [logout, router]);

  return (
    <QueryProvider>
      <DashboardLayout
        title="Finance"
        links={DASHBOARD_LINKS}
        onLogout={handleLogout}
      >
        {children}
      </DashboardLayout>
    </QueryProvider>
  );
}
