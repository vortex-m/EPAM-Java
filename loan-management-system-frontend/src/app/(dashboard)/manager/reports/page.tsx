"use client";

import {
  BarChart2,
  CheckCircle2,
  Clock3,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useManagerDashboardQuery,
  useManagerDashboardSummaryQuery,
} from "@/hooks/manager/useManagerWorkflow";
import { formatNumber } from "@/lib/formatters";

export default function ManagerReportsPage() {
  const dashboardQuery = useManagerDashboardQuery();
  const summaryQuery = useManagerDashboardSummaryQuery();

  if (dashboardQuery.isLoading || summaryQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          Unable to load manager reports. Please try again.
        </CardContent>
      </Card>
    );
  }

  const d = dashboardQuery.data;
  const s = summaryQuery.data ?? d;
  const successRate = s.successRate ?? 0;

  const stats = [
    { label: "Total Processed", value: formatNumber(d.totalProcessed), icon: BarChart2, color: "text-primary", bg: "bg-primary/5" },
    { label: "Approved", value: formatNumber(d.approved), icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
    { label: "Disbursed", value: formatNumber(d.disbursed), icon: Wallet, color: "text-indigo-700", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
    { label: "Rejected", value: formatNumber(d.rejected), icon: XCircle, color: "text-rose-700", bg: "bg-rose-50 dark:bg-rose-950/40" },
    { label: "Closed", value: formatNumber(d.closed), icon: CheckCircle2, color: "text-cyan-700", bg: "bg-cyan-50 dark:bg-cyan-950/40" },
    { label: "Under Verification", value: formatNumber(d.underVerification ?? 0), icon: Clock3, color: "text-violet-700", bg: "bg-violet-50 dark:bg-violet-950/40" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────── */}
      <div className="rounded-xl border border-border/80 bg-fintech-surface bg-fintech-glow p-5">
        <div className="flex items-center gap-3">
          <BarChart2 className="size-5 text-primary" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Reports</h1>
            <p className="text-sm text-muted-foreground">
              Branch performance overview and processing metrics.
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat grid ────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/80 bg-card/85 py-0 shadow-sm">
              <CardContent className="flex items-center gap-4 px-4 py-4">
                <span className={`rounded-xl p-3 ${stat.bg}`}>
                  <Icon className={`size-5 ${stat.color}`} />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className={`mt-0.5 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Performance cards ────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Success rate */}
        <Card className="border-border/80 bg-card/85 py-0 shadow-sm">
          <CardHeader className="border-b border-border/60 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="size-4 text-emerald-600" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-5">
            <div className="mb-2 flex items-end justify-between">
              <p className="text-4xl font-bold text-emerald-700">{successRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">of total processed</p>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${Math.min(successRate, 100)}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>

        {/* Processing efficiency */}
        <Card className="border-border/80 bg-card/85 py-0 shadow-sm">
          <CardHeader className="border-b border-border/60 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock3 className="size-4 text-primary" />
              Processing Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-5 py-5">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
              <p className="text-xs text-muted-foreground">Avg Processing Time</p>
              <p className="mt-1 text-4xl font-bold text-primary">
                {(s.averageProcessingTime ?? 0).toFixed(1)}
                <span className="ml-1 text-lg font-medium text-muted-foreground">days</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-amber-500/20 bg-amber-50/50 px-3 py-2.5 text-center dark:bg-amber-950/20">
                <p className="text-xs text-amber-700 dark:text-amber-400">Pending (Mgr)</p>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{formatNumber(d.pendingManager)}</p>
              </div>
              <div className="rounded-lg border border-sky-500/20 bg-sky-50/50 px-3 py-2.5 text-center dark:bg-sky-950/20">
                <p className="text-xs text-sky-700 dark:text-sky-400">Pending (Off)</p>
                <p className="text-xl font-bold text-sky-700 dark:text-sky-400">{formatNumber(d.pendingOfficer)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
