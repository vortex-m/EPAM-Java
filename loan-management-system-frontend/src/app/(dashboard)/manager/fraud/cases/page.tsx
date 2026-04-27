"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Clock3,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useManagerFraudCasesQuery } from "@/hooks/manager/useManagerWorkflow";
import { formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";

function severityClass(severity?: string) {
  const s = (severity ?? "").toUpperCase();
  if (s === "CRITICAL") return "bg-rose-500/10 text-rose-700 border-rose-500/20";
  if (s === "HIGH") return "bg-orange-500/10 text-orange-700 border-orange-500/20";
  if (s === "MEDIUM") return "bg-amber-500/10 text-amber-700 border-amber-500/20";
  return "bg-muted text-muted-foreground border-border/60";
}

function caseStatusClass(status?: string) {
  const s = (status ?? "").toUpperCase();
  if (s === "RESOLVED") return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
  if (s === "ESCALATED") return "bg-rose-500/10 text-rose-700 border-rose-500/20";
  if (s === "INVESTIGATING") return "bg-sky-500/10 text-sky-700 border-sky-500/20";
  if (s === "CLOSED") return "bg-muted text-muted-foreground border-border/60";
  return "bg-amber-500/10 text-amber-700 border-amber-500/20";
}

export default function ManagerFraudCasesPage() {
  const casesQuery = useManagerFraudCasesQuery();
  const cases = casesQuery.data ?? [];

  if (casesQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
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
            <ShieldAlert className="size-5 text-orange-600" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Fraud Cases
              </h1>
              <p className="text-sm text-muted-foreground">
                Active fraud investigation cases across branches.
              </p>
            </div>
          </div>
          {cases.length > 0 && (
            <span className="inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-700">
              {cases.length} cases
            </span>
          )}
        </div>
      </div>

      {cases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <ShieldAlert className="mx-auto mb-3 size-10 text-muted-foreground/30" />
            No active fraud cases at this time.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {cases.map((item) => (
            <Card
              key={item.caseId}
              className="border-border/80 bg-card/85 py-0 shadow-sm transition-shadow hover:shadow-md"
            >
              <CardContent className="px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">
                        Case #{item.caseId}
                      </span>
                      {item.loanId && (
                        <span className="text-xs text-muted-foreground">
                          · Loan #{item.loanId}
                        </span>
                      )}
                      {item.applicantName && (
                        <span className="text-xs text-muted-foreground">
                          · {item.applicantName}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium">
                      {item.caseType ?? "Fraud Investigation"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.description ?? "No description provided."}
                    </p>
                    {item.assignedTo && (
                      <p className="text-xs text-muted-foreground">
                        Assigned to: <span className="font-medium">{item.assignedTo}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                        severityClass(item.severity),
                      )}
                    >
                      {item.severity ?? "LOW"}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                        caseStatusClass(item.status),
                      )}
                    >
                      {item.status ?? "OPEN"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="size-3" />
                    {formatDateTime(item.createdAt)}
                  </span>
                  {item.loanId && (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/manager/audit/loan/${item.loanId}`}>
                        <ExternalLink className="mr-1.5 size-3.5" />
                        Loan Audit Trail
                      </Link>
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
