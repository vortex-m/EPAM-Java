"use client";

import { useState } from "react";
import {
  AlertOctagon,
  Clock3,
  Flag,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useManagerFraudAlertsQuery,
  useManagerFlagAuditMutation,
} from "@/hooks/manager/useManagerWorkflow";
import type { FraudAlert } from "@/types/manager.types";
import { formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";

function severityClass(severity?: string) {
  const s = (severity ?? "").toUpperCase();
  if (s === "CRITICAL")
    return "bg-rose-500/10 text-rose-700 border-rose-500/20";
  if (s === "HIGH")
    return "bg-orange-500/10 text-orange-700 border-orange-500/20";
  if (s === "MEDIUM")
    return "bg-amber-500/10 text-amber-700 border-amber-500/20";
  return "bg-muted text-muted-foreground border-border/60";
}

function statusClass(status?: string) {
  const s = (status ?? "").toUpperCase();
  if (s === "RESOLVED") return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
  if (s === "UNDER_REVIEW") return "bg-sky-500/10 text-sky-700 border-sky-500/20";
  if (s === "DISMISSED") return "bg-muted text-muted-foreground border-border/60";
  return "bg-amber-500/10 text-amber-700 border-amber-500/20";
}

export default function ManagerFraudAlertsPage() {
  const alertsQuery = useManagerFraudAlertsQuery();
  const flagMutation = useManagerFlagAuditMutation();
  const [busyId, setBusyId] = useState<number | null>(null);

  const alerts = alertsQuery.data ?? [];

  const handleFlag = async (alertId: number) => {
    setBusyId(alertId);
    try {
      await flagMutation.mutateAsync({
        auditId: alertId,
        payload: {
          reason: "Fraud alert flagged by manager",
          severity: "HIGH",
          category: "FRAUD_ALERT",
        },
      });
    } finally {
      setBusyId(null);
    }
  };

  if (alertsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Page header ──────────────────────────────── */}
      <div className="rounded-xl border border-border/80 bg-fintech-surface bg-fintech-glow p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertOctagon className="size-5 text-rose-600" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Fraud Alerts
              </h1>
              <p className="text-sm text-muted-foreground">
                High-risk and flagged alerts requiring immediate attention.
              </p>
            </div>
          </div>
          {alerts.length > 0 && (
            <span className="inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-700">
              {alerts.length} alerts
            </span>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <AlertOctagon className="mx-auto mb-3 size-10 text-muted-foreground/30" />
            No fraud alerts at this time.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {alerts.map((alert) => (
            <Card
              key={alert.alertId}
              className="border-border/80 bg-card/85 py-0 shadow-sm"
            >
              <CardContent className="px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">
                        Alert #{alert.alertId}
                      </span>
                      {alert.loanId && (
                        <span className="text-xs text-muted-foreground">
                          · Loan #{alert.loanId}
                        </span>
                      )}
                    </div>
                    {alert.applicantName && (
                      <p className="text-sm text-muted-foreground">
                        {alert.applicantName}
                      </p>
                    )}
                    <p className="text-sm">
                      {alert.description ?? alert.alertType ?? "No description"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
                        severityClass(alert.severity),
                      )}
                    >
                      {alert.severity ?? "LOW"}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
                        statusClass(alert.status),
                      )}
                    >
                      {alert.status ?? "OPEN"}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="size-3" />
                    {formatDateTime(alert.createdAt)}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === alert.alertId}
                    onClick={() => handleFlag(alert.alertId)}
                    className="border-rose-500/30 text-rose-700 hover:bg-rose-50 dark:text-rose-400"
                  >
                    <Flag className="mr-1.5 size-3.5" />
                    {busyId === alert.alertId ? "Flagging…" : "Flag"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
