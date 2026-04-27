"use client";

import { useState } from "react";
import { Flag, History } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useManagerAuditTrailQuery,
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

export default function ManagerAuditTrailPage() {
  const trailQuery = useManagerAuditTrailQuery();
  const flagMutation = useManagerFlagAuditMutation();
  const [busyId, setBusyId] = useState<number | null>(null);

  const rows = (trailQuery.data ?? []).slice().sort((a, b) => {
    return (
      new Date(b.createdAt ?? 0).getTime() -
      new Date(a.createdAt ?? 0).getTime()
    );
  });

  const handleFlag = async (auditId: number) => {
    setBusyId(auditId);
    try {
      await flagMutation.mutateAsync({
        auditId,
        payload: {
          reason: "Flagged via audit trail review",
          severity: "MEDIUM",
          category: "SUSPICIOUS_ACTIVITY",
        },
      });
    } finally {
      setBusyId(null);
    }
  };

  if (trailQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        {Array.from({ length: 5 }).map((_, i) => (
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
            <History className="size-5 text-primary" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Audit Trail</h1>
              <p className="text-sm text-muted-foreground">
                Chronological log of all system-level actions.
              </p>
            </div>
          </div>
          {rows.length > 0 && (
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {rows.length} entries
            </span>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <History className="mx-auto mb-3 size-10 text-muted-foreground/30" />
            No audit trail entries available.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/80 bg-card/85 py-0 shadow-sm">
          <CardContent className="px-0 py-0">
            <div className="relative px-6 py-4">
              {/* Timeline line */}
              <div className="absolute left-10 top-4 bottom-4 w-px bg-border/60" />

              <div className="space-y-5">
                {rows.map((row, idx) => (
                  <div key={row.auditId} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                        row.flagged
                          ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40"
                          : "border-border bg-background text-muted-foreground",
                      )}
                    >
                      {idx + 1}
                    </div>

                    {/* Entry content */}
                    <div className="flex-1 rounded-lg border border-border/60 bg-background/60 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold">
                              #{row.auditId} · {row.action}
                            </span>
                            {row.loanId && (
                              <span className="text-xs text-muted-foreground">
                                Loan #{row.loanId}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {row.performedBy ?? "System"}{" "}
                            {row.role && `· ${row.role}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {row.severity && (
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                                severityClass(row.severity),
                              )}
                            >
                              {row.severity}
                            </span>
                          )}
                          {row.flagged ? (
                            <Badge variant="destructive" className="text-[10px]">
                              Flagged
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busyId === row.auditId}
                              onClick={() => handleFlag(row.auditId)}
                              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <Flag className="mr-1 size-3" />
                              {busyId === row.auditId ? "…" : "Flag"}
                            </Button>
                          )}
                        </div>
                      </div>
                      {row.details && (
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {row.details}
                        </p>
                      )}
                      <p className="mt-1.5 text-[10px] text-muted-foreground/70">
                        {formatDateTime(row.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
