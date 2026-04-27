"use client";

import { useState } from "react";
import { Flag, Flag as FlagIcon, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useManagerAuditFlagsQuery,
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

export default function ManagerAuditFlagsPage() {
  const flagsQuery = useManagerAuditFlagsQuery();
  const flagMutation = useManagerFlagAuditMutation();
  const [busyId, setBusyId] = useState<number | null>(null);

  const rows = flagsQuery.data ?? [];

  const handleFlag = async (auditId: number) => {
    setBusyId(auditId);
    try {
      await flagMutation.mutateAsync({
        auditId,
        payload: {
          reason: "Escalated from flagged entries review",
          severity: "HIGH",
          category: "COMPLIANCE_BREACH",
        },
      });
    } finally {
      setBusyId(null);
    }
  };

  if (flagsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
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
            <FlagIcon className="size-5 text-amber-600" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Flagged Entries
              </h1>
              <p className="text-sm text-muted-foreground">
                Audit entries marked for compliance or fraud escalation.
              </p>
            </div>
          </div>
          {rows.length > 0 && (
            <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700">
              {rows.length} flagged
            </span>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <ShieldCheck className="mx-auto mb-3 size-10 text-emerald-500/40" />
            No flagged audit entries. The system looks clean.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/80 bg-card/85 py-0 shadow-sm">
          <CardHeader className="border-b border-border/60 px-4 py-3">
            <CardTitle className="text-sm text-muted-foreground">
              {rows.length} entries require attention
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 py-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border/60 text-left text-[10px] uppercase tracking-widest text-muted-foreground/60">
                    <th className="px-4 py-3">Audit ID</th>
                    <th className="px-4 py-3">Loan</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.auditId}
                      className="border-b border-border/50 text-sm transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium">#{row.auditId}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.loanId ? `#${row.loanId}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{row.action}</p>
                        {row.details && (
                          <p className="mt-0.5 max-w-[200px] truncate text-xs text-muted-foreground">
                            {row.details}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p>{row.performedBy ?? "System"}</p>
                        {row.role && (
                          <p className="text-xs text-muted-foreground">{row.role}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
                            severityClass(row.severity),
                          )}
                        >
                          {row.severity ?? "LOW"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDateTime(row.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {row.flagged ? (
                          <Badge variant="destructive" className="text-[10px]">
                            Flagged
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busyId === row.auditId}
                            onClick={() => handleFlag(row.auditId)}
                            className="h-7 px-2.5 text-xs"
                          >
                            <Flag className="mr-1 size-3" />
                            {busyId === row.auditId ? "…" : "Flag"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
