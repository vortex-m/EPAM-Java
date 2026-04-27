"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  getHomeByRole,
  getModuleLabel,
  type AppRole,
} from "../../config/navigation";
import { SidebarContent } from "@/components/shared/Sidebar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import type { RootState } from "@/store";
import { ChevronDownIcon, LogOutIcon, MenuIcon, UserIcon } from "lucide-react";

function getProfilePath(role: AppRole | null) {
  if (role === "ADMIN") return "/admin/profile";
  if (role === "MANAGER") return "/manager/profile";
  if (role === "OFFICER") return "/officer/profile";
  if (role === "AGENT") return "/agent/profile";
  return "/user/profile";
}

function getInitials(name?: string, email?: string) {
  const source = (name?.trim() || email?.trim() || "User").toUpperCase();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`;
  return source.slice(0, 2);
}

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { role, user } = useSelector((state: RootState) => state.auth);
  const effectiveRole = role ? (role as AppRole) : null;
  const managerDepartment = user?.department ?? user?.managerType ?? null;
  const officerDesignation = user?.designation ?? null;
  const moduleLabel = effectiveRole
    ? getModuleLabel(effectiveRole, pathname, {
        managerDepartment,
        officerDesignation,
      })
    : "Loading";
  const profilePath = getProfilePath(effectiveRole);
  console.log("User info:", user);
  const userName = user?.name ?? "User";
  const userEmail = user?.email ?? "No email";
  const userInitials = getInitials(userName, userEmail);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/70 bg-card/75 px-3 backdrop-blur-md sm:px-5">
      <div className="flex items-center gap-2 sm:gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon-sm" className="lg:hidden">
              <MenuIcon />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-70 border-r border-sidebar-border bg-sidebar p-0"
          >
            <SidebarContent mobile />
          </SheetContent>
        </Sheet>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
            {effectiveRole ? (
              <Link
                href={getHomeByRole(effectiveRole)}
                className="hover:text-foreground"
              >
                Home
              </Link>
            ) : (
              <span>Home</span>
            )}
            <span>/</span>
            <span className="font-medium text-foreground">{moduleLabel}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <details className="group relative">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-border/80 bg-background/70 px-2 py-1.5 text-sm text-foreground outline-none transition-colors hover:bg-muted [&::-webkit-details-marker]:hidden">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {userInitials}
            </span>
            <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>

          <div className="absolute -right-4 z-50 mt-2 w-64 rounded-xl border border-border/80 bg-popover p-2 text-popover-foreground shadow-lg">
            <div className="border-b border-border/70 px-2 py-2">
              <p className="truncate text-sm font-semibold">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {userEmail}
              </p>
            </div>

            <div className="mt-1 flex flex-col gap-1">
              <Link
                href={profilePath}
                className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                <UserIcon className="size-4" />
                Profile
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
              >
                <LogOutIcon className="size-4" />
                Logout
              </button>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
