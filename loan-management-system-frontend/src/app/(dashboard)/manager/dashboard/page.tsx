"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Landmark,
  ShieldAlert,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useSelector } from "react-redux";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useManagerDashboardQuery,
  useManagerDashboardSummaryQuery,
} from "@/hooks/manager/useManagerWorkflow";
import type { RootState } from "@/store";
import { formatNumber } from "@/lib/formatters";

const departmentLabel: Record<string, string> = {
  LOAN_APPROVAL: "Loan Approval",
  LOAN_OPERATIONS: "Loan Operations",
  OPERATIONS: "Operations",
  COMPLIANCE: "Compliance",
  AUDIT: "Audit",
  FRAUD: "Fraud Detection",
};

const deptColorClass: Record<string, string> = {
  LOAN_APPROVAL: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  LOAN_OPERATIONS: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
  OPERATIONS: "bg-violet-500/10 text-violet-700 border-violet-500/20",
  COMPLIANCE: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  AUDIT: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  FRAUD: "bg-rose-500/10 text-rose-700 border-rose-500/20",
};

type QuickAction = { label: string; href: string; variant?: "default" | "outline" };

function getQuickActions(department: string): QuickAction[] {
  const dept = (department ?? "").toUpperCase();
  if (dept === "LOAN_APPROVAL" || dept === "LOAN_OPERATIONS") {
    return [
      { label: "Review Pending Loans", href: "/manager/loans/pending" },
      { label: "Audit Logs", href: "/manager/audit/logs", variant: "outline" },
      ...(dept === "LOAN_OPERATIONS"
        ? [{ label: "Staff Hub", href: "/manager/staff", variant: "outline" as const }]
        : []),
      { label: "Profile", href: "/manager/profile", variant: "outline" },
    ];
  }
  if (dept === "OPERATIONS") {
    return [
      { label: "Create Agent", href: "/manager/staff/agents/create" },
      { label: "Create Officer", href: "/manager/staff/officers/create", variant: "outline" },
      { label: "Create Manager", href: "/manager/staff/managers/create", variant: "outline" },
    ];
  }
  if (dept === "COMPLIANCE" || dept === "AUDIT") {
    return [
      { label: "Audit Logs", href: "/manager/audit/logs" },
      { label: "Flagged Entries", href: "/manager/audit/flags", variant: "outline" },
      { label: "Audit Trail", href: "/manager/audit/trail", variant: "outline" },
    ];
  }
  if (dept === "FRAUD") {
    return [
      { label: "Fraud Alerts", href: "/manager/fraud/alerts" },
      { label: "Fraud Cases", href: "/manager/fraud/cases", variant: "outline" },
      { label: "Assisted Actions", href: "/manager/audit/assisted-actions", variant: "outline" },
    ];
  }
  return [
    { label: "Pending Loans", href: "/manager/loans/pending" },
    { label: "Audit Logs", href: "/manager/audit/logs", variant: "outline" },
  ];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ManagerDashboardPage() {
  const dashboardQuery = useManagerDashboardQuery();
  const summaryQuery = useManagerDashboardSummaryQuery();
  const department = useSelector(
    (state: RootState) => state.auth.user?.department ?? "",
  );
  const deptKey = department.toUpperCase();

  if (dashboardQuery.isLoading || summaryQuery.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          Unable to load manager dashboard. Please try again.
        </CardContent>
      </Card>
    );
  }

  const d = dashboardQuery.data;
  const s = summaryQuery.data ?? d;
  const successRate = s.successRate ?? 0;
  const quickActions = getQuickActions(department);

  const metrics = [
    {
      title: "Pending Officer",
      value: d.pendingOfficer,
      icon: ClipboardList,
      iconColor: "text-sky-600",
      bg: "bg-sky-50 dark:bg-sky-950/40",
      trend: "At officer stage",
    },
    {
      title: "Pending Manager",
      value: d.pendingManager,
      icon: Clock3,
      iconColor: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      trend: "Awaiting your decision",
    },
    {
      title: "Approved",
      value: d.approved,
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      trend: "Manager approved",
    },
    {
      title: "Disbursed",
      value: d.disbursed,
      icon: Wallet,
      iconColor: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
      trend: "Funds released",
    },
    {
      title: "Rejected",
      value: d.rejected,
      icon: AlertTriangle,
      iconColor: "text-rose-600",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      trend: "Declined applications",
    },
    {
      title: "Closed",
      value: d.closed,
      icon: Landmark,
      iconColor: "text-cyan-600",
      bg: "bg-cyan-50 dark:bg-cyan-950/40",
      trend: "Fully closed loans",
    },
    {
      title: "Under Verification",
      value: d.underVerification ?? 0,
      icon: ShieldAlert,
      iconColor: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-950/40",
      trend: "Field agent active",
    },
    {
      title: "Total Processed",
      value: d.totalProcessed,
      icon: BarChart2,
      iconColor: "text-primary",
      bg: "bg-primary/5",
      trend: "All-time handled",
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* ── Hero banner ──────────────────────────────── */}
      <div className="rounded-xl border border-border/80 bg-fintech-surface bg-fintech-glow p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Manager Command Center
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Branch-level overview for approvals, risk, and operations.
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
              deptColorClass[deptKey] ?? "bg-primary/10 text-primary border-primary/20"
            }`}
          >
            {departmentLabel[deptKey] ?? "Manager"} Department
          </span>
        </div>
      </div>

      {/* ── Metric cards ─────────────────────────────── */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <Card
            key={item.title}
            className="border-border/80 bg-card/85 py-0 shadow-sm transition-shadow hover:shadow-md"
          >
            <CardHeader className="border-b border-border/60 px-4 py-3">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                <span>{item.title}</span>
                <span className={`rounded-md p-1.5 ${item.bg}`}>
                  <item.icon className={`size-4 ${item.iconColor}`} />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-4">
              <p className={`text-3xl font-bold tracking-tight ${item.iconColor}`}>
                {formatNumber(item.value)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{item.trend}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ── Efficiency + Quick Actions ───────────────── */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* Efficiency snapshot */}
        <Card className="border-border/80 bg-card/85 py-0 shadow-sm">
          <CardHeader className="border-b border-border/60 px-4 py-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="size-4 text-emerald-600" />
              Efficiency Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-4 py-4">
            {/* Success rate */}
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-bold text-emerald-600">
                  {successRate.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${Math.min(successRate, 100)}%` }}
                />
              </div>
            </div>
            {/* Avg processing time */}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Avg Processing Time
                </p>
                <p className="mt-0.5 text-xl font-bold text-primary">
                  {(s.averageProcessingTime ?? 0).toFixed(1)}{" "}
                  <span className="text-sm font-medium text-muted-foreground">
                    days
                  </span>
                </p>
              </div>
              <Clock3 className="size-8 text-primary/20" />
            </div>
            {/* Pending breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-amber-500/20 bg-amber-50/50 px-3 py-2.5 dark:bg-amber-950/20">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Pending (Manager)
                </p>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-400">
                  {formatNumber(d.pendingManager)}
                </p>
              </div>
              <div className="rounded-lg border border-sky-500/20 bg-sky-50/50 px-3 py-2.5 dark:bg-sky-950/20">
                <p className="text-xs text-sky-700 dark:text-sky-400">
                  Pending (Officer)
                </p>
                <p className="text-xl font-bold text-sky-700 dark:text-sky-400">
                  {formatNumber(d.pendingOfficer)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="border-border/80 bg-card/85 py-0 shadow-sm">
          <CardHeader className="border-b border-border/60 px-4 py-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="size-4 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 px-4 py-4">
            {quickActions.map((action) => (
              <Button
                key={action.href}
                asChild
                variant={action.variant ?? "default"}
                size="sm"
                className="h-9"
              >
                <Link href={action.href}>
                  {action.label}
                  {action.variant !== "outline" && (
                    <ArrowRight className="ml-1.5 size-3.5" />
                  )}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
