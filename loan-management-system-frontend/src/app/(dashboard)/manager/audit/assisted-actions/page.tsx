"use client";

import { useState } from "react";
import { Activity, AlertTriangle, Clock3, Flag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useManagerAuditActionsQuery,
  useManagerFlagAuditMutation,
} from "@/hooks/manager/useManagerWorkflow";
import { formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";

function severityClass(s?: string) {
  const v = (s ?? "").toUpperCase();
  if (v === "CRITICAL") return "bg-rose-500/10 text-rose-700 border-rose-500/20";
  if (v === "HIGH") return "bg-orange-500/10 text-orange-700 border-orange-500/20";
  if (v === "MEDIUM") return "bg-amber-500/10 text-amber-700 border-amber-500/20";
  return "bg-muted text-muted-foreground border-border/60";
}

export default function ManagerAuditAssistedActionsPage() {
  const actionsQuery = useManagerAuditActionsQuery();
  const flagMutation = useManagerFlagAuditMutation();
  const [busyId, setBusyId] = useState<number | null>(null);

  const rows = actionsQuery.data ?? [];

  const handleFlag = async (auditId: number) => {
    setBusyId(auditId);
    try {
      await flagMutation.mutateAsync({
        auditId,
        payload: {
          reason: "Suspicious assisted action flagged by manager",
          severity: "HIGH",
          category: "SUSPICIOUS_ACTIVITY",
        },
      });
    } finally {
      setBusyId(null);
    }
  };

  if (actionsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
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
            <Activity className="size-5 text-primary" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Assisted Actions</h1>
              <p className="text-sm text-muted-foreground">
                System-assisted and on-behalf actions taken by staff.
              </p>
            </div>
          </div>
          {rows.length > 0 && (
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {rows.length} records
            </span>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <Activity className="mx-auto mb-3 size-10 text-muted-foreground/30" />
            No assisted action records available.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {rows.map((row) => (
            <Card key={row.auditId} className="border-border/80 bg-card/85 py-0 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">#{row.auditId} · {row.action}</span>
                      {row.loanId && (
                        <span className="text-xs text-muted-foreground">Loan #{row.loanId}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {row.performedBy ?? "System"}{row.role ? ` · ${row.role}` : ""}
                    </p>
                    {row.details && (
                      <p className="text-sm text-muted-foreground">{row.details}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {row.severity && (
                      <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold", severityClass(row.severity))}>
                        {row.severity}
                      </span>
                    )}
                    {row.flagged && (
                      <Badge variant="destructive" className="inline-flex items-center gap-1 text-[10px]">
                        <AlertTriangle className="size-3" /> Flagged
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2.5">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="size-3" />{formatDateTime(row.createdAt)}
                  </span>
                  {!row.flagged && (
                    <Button size="sm" variant="outline" disabled={busyId === row.auditId}
                      onClick={() => handleFlag(row.auditId)} className="h-7 px-2.5 text-xs">
                      <Flag className="mr-1 size-3" />
                      {busyId === row.auditId ? "Flagging…" : "Flag"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
