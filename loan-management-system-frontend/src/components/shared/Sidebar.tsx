"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertOctagon,
  BarChart2,
  Briefcase,
  Building2,
  ClipboardList,
  FileSearch,
  Flag,
  History,
  LayoutDashboard,
  Landmark,
  ScanLine,
  ScrollText,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  UserCircle,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getNavByRole,
  isNavItemActive,
  type AppRole,
} from "../../config/navigation";
import type { RootState } from "@/store";

const iconMap: Record<string, LucideIcon> = {
  Activity,
  AlertOctagon,
  BarChart2,
  Briefcase,
  Building2,
  ClipboardList,
  FileSearch,
  Flag,
  History,
  LayoutDashboard,
  Landmark,
  ScanLine,
  ScrollText,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  UserCircle,
  UserPlus,
  Users,
  Wallet,
};

const deptLabel: Record<string, string> = {
  LOAN_APPROVAL: "Loan Approval",
  LOAN_OPERATIONS: "Loan Operations",
  OPERATIONS: "Operations",
  COMPLIANCE: "Compliance",
  KYC_COMPLIANCE: "KYC Compliance",
  AUDIT: "Audit",
  FRAUD: "Fraud Detection",
  FULL: "Full Access",
};

const deptColorClass: Record<string, string> = {
  LOAN_APPROVAL: "bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-400",
  LOAN_OPERATIONS: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:text-indigo-400",
  OPERATIONS: "bg-violet-500/10 text-violet-700 border-violet-500/20 dark:text-violet-400",
  COMPLIANCE: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
  KYC_COMPLIANCE: "bg-teal-500/10 text-teal-700 border-teal-500/20 dark:text-teal-400",
  AUDIT: "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400",
  FRAUD: "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400",
  FULL: "bg-primary/10 text-primary border-primary/20",
};

type SidebarContentProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

export function SidebarContent({
  mobile = false,
  onNavigate,
}: SidebarContentProps) {
  const pathname = usePathname();
  const { role, user, isHome } = useSelector((state: RootState) => state.auth);
  const effectiveRole = role ? (role as AppRole) : null;
  const managerDepartment = user?.department ?? user?.managerType ?? null;
  const officerDesignation = user?.designation ?? null;
  const isManager = effectiveRole === "MANAGER";
  const deptKey = (managerDepartment ?? "").toUpperCase();
  const userName = user?.name ?? "";

  const navGroups = useMemo(() => {
    if (!effectiveRole) return [];

    const roleNav = getNavByRole(effectiveRole, {
      managerDepartment,
      officerDesignation,
    });

    if (effectiveRole !== "USER") return roleNav;

    if (isHome === false) {
      return roleNav.map((group) => ({
        ...group,
        items: group.items.filter((item) => item.href === "/user/onboarding"),
      }));
    }

    return roleNav.map((group) => ({
      ...group,
      items: group.items.map((item) => {
        if (item.href !== "/user/onboarding") return item;
        return { ...item, label: "Profile", href: "/user/profile", moduleKey: "profile" };
      }),
    }));
  }, [effectiveRole, managerDepartment, officerDesignation, isHome]);

  return (
    <div className={cn("flex h-full flex-col", mobile ? "px-3 py-3" : "px-3 py-4")}>
      {/* ── Header ─────────────────────────────────────── */}
      <div className="mb-5 px-2">
        <p
          className="text-sm font-semibold tracking-tight text-sidebar-foreground"
          suppressHydrationWarning
        >
          {isManager ? "Manager Portal" : `${effectiveRole ?? ""} Dashboard`}
        </p>
        {isManager && managerDepartment && (
          <span
            className={cn(
              "mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              deptColorClass[deptKey] ?? deptColorClass["FULL"],
            )}
          >
            {deptLabel[deptKey] ?? deptKey}
          </span>
        )}
      </div>

      {/* ── Nav groups ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto pr-0.5">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => !item.hideFromNav);
          if (visibleItems.length === 0) return null;

          const GroupIcon = group.icon ? iconMap[group.icon] : null;

          return (
            <div key={group.title}>
              {/* Section heading */}
              <div className="mb-1.5 flex items-center gap-1.5 px-3">
                {GroupIcon && (
                  <GroupIcon className="size-3 text-muted-foreground/50" />
                )}
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">
                  {group.title}
                </p>
              </div>

              <nav className="flex flex-col gap-0.5">
                {visibleItems.map((item) => {
                  const active = isNavItemActive(pathname, item);
                  const Icon = item.icon ? iconMap[item.icon] : null;

                  return (
                    <Link
                      key={item.moduleKey}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      {Icon && (
                        <Icon
                          className={cn(
                            "size-4 shrink-0",
                            active
                              ? "text-sidebar-primary-foreground"
                              : "text-muted-foreground/70 group-hover:text-sidebar-accent-foreground",
                          )}
                        />
                      )}
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      {/* ── Footer: user info ──────────────────────────── */}
      {userName && (
        <div className="mt-4 border-t border-sidebar-border/60 px-3 pt-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
              {userName
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-sidebar-foreground">
                {userName}
              </p>
              <p className="truncate text-[10px] text-muted-foreground/70">
                {effectiveRole}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border/80 bg-sidebar/90 lg:block">
      <SidebarContent />
    </aside>
  );
}
