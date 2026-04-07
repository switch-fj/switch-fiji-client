"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@switch-fiji/ui";
import { useLogout } from "@/hooks/useAuth";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const links = [
  { label: "Overview", href: "/dashboard" },
  { label: "Invoices", href: "/dashboard/invoices" },
  { label: "Payments", href: "/dashboard/payments" },
  { label: "Payouts", href: "/dashboard/payouts" },
  { label: "Reports", href: "/dashboard/reports" },
];

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
    <DashboardLayout title="Finance" links={links} onLogout={handleLogout}>
      {children}
    </DashboardLayout>
  );
}
