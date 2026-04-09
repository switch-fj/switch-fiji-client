"use client";

import { useState, type ReactNode } from "react";
import { Bell, CircleQuestionMark, LogOut } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export type DashboardLink = {
  label: string;
  href: string;
  icon?: ReactNode;
};

export type DashboardLayoutProps = {
  title?: string;
  logo?: ReactNode;
  links: DashboardLink[];
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
  notificationsHref?: string;
  notificationCount?: number;
  profileName?: string;
  profileEmail?: string;
  profileMenuItems?: Array<{
    label: string;
    href?: string;
    onSelect?: () => void;
  }>;
  onLogout?: () => void | Promise<void>;
  footerText?: string;
};

export default function DashboardLayout({
  title = "Dashboard",
  logo,
  links,
  children,
  className,
  headerRight,
  notificationsHref = "#",
  notificationCount,
  profileName = "Account",
  profileEmail,
  profileMenuItems,
  onLogout,
  footerText = "All rights reserved.",
}: DashboardLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuItems = profileMenuItems ?? [
    { label: "Profile", href: "#" },
    { label: "Settings", href: "#" },
    { label: "Sign out", onSelect: () => setIsLogoutOpen(true) },
  ];

  const handleMenuSelect = (item: (typeof menuItems)[number]) => {
    if (item.onSelect) {
      item.onSelect();
      return;
    }
    if (item.href) {
      window.location.href = item.href;
    }
  };

  return (
    <div
      className={cn("min-h-screen bg-background text-foreground", className)}
    >
      <header className="sticky top-0 w-full border-b bg-primary backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 pb-4 sm:h-26">
          <div className="flex items-center gap-3">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border md:hidden"
                  aria-label="Open menu"
                >
                  <span className="sr-only">Open menu</span>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 6h16M4 12h16M4 18h16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </DialogTrigger>
              <DialogContent
                className="fixed left-0 top-0 h-full w-72 max-w-[80vw] translate-x-0 translate-y-0 rounded-none border-r p-0 md:hidden"
                showCloseButton
              >
                <DialogHeader className="border-b px-4 py-4 text-left">
                  <DialogTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {title}
                  </DialogTitle>
                </DialogHeader>
                <nav className="flex flex-col gap-1 p-4">
                  {links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.icon}
                      {link.label}
                    </a>
                  ))}
                </nav>
              </DialogContent>
            </Dialog>
            <a
              href="/"
              className="text-sm font-semibold uppercase tracking-[0.3em]"
            >
              <img
                src="https://i.ibb.co/VWbGZ7p0/switchfj-white.png"
                alt="Switch Fiji"
                width={150}
                height={40}
              />
            </a>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#A1A1A1] hover:text-white"
              >
                {link.icon}
                {link.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 ">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Help"
              className="hover:text-primary text-white"
            >
              <CircleQuestionMark className="h-4 w-4 " />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Notifications"
              onClick={() => {
                window.location.href = notificationsHref;
              }}
              className="relative text-white"
            >
              <Bell className="h-6 w-6" aria-hidden="true" />
              {typeof notificationCount === "number" &&
                notificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-lg" className="p-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xs font-semibold text-white hover:text-primary">
                    {profileName.slice(0, 2)}
                  </span>
                  {/* <span className="hidden text-sm font-medium sm:inline">{profileName}</span> */}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="space-y-1">
                  <div className="text-sm font-medium leading-none">
                    {profileName}
                  </div>
                  {profileEmail && (
                    <div className="text-xs text-muted-foreground">
                      {profileEmail}
                    </div>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {menuItems.map((item) => (
                  <DropdownMenuItem
                    key={item.label}
                    onSelect={() => handleMenuSelect(item)}
                  >
                    <span className="w-full">{item.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {headerRight}
          </div>
        </div>
      </header>

      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent
          className="max-w-sm overflow-hidden rounded-2xl p-0"
          showCloseButton={false}
        >
          <div className="flex flex-col items-center gap-4 px-6 pt-8 pb-2 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <LogOut className="h-6 w-6 text-primary" aria-hidden="true" />
            </span>
            <div className="space-y-1.5">
              <DialogTitle className="text-xl font-semibold">
                Log out?
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                You are about to end your session. You can always log back in
                anytime.
              </DialogDescription>
            </div>
          </div>
          <div className="flex gap-3 px-6 py-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsLogoutOpen(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="flex-1"
              isLoading={isLoggingOut}
              disabled={isLoggingOut}
              onClick={async () => {
                setIsLoggingOut(true);
                try {
                  await onLogout?.();
                } finally {
                  setIsLoggingOut(false);
                  setIsLogoutOpen(false);
                }
              }}
            >
              {!isLoggingOut && "Log out"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <main className="relative z-10 -mt-5 w-full rounded-t-3xl bg-background px-4 py-6 shadow-sm sm:px-6 sm:py-8">
        <div className="max-w-7xl mx-auto w-full">{children}</div>
      </main>

      <footer className="border-t py-3">
        <div className="mx-auto w-full max-w-7xl px-4 text-xs text-muted-foreground">
          {footerText}
        </div>
      </footer>
    </div>
  );
}
