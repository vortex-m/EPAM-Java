"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Eye,
  ScanLine,
  UserCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useManagerPendingLoansQuery } from "@/hooks/manager/useManagerWorkflow";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";

function statusVariant(
  status: string,
): { label: string; cls: string } {
  const s = status.toUpperCase();
  if (s.includes("APPROVED"))
    return { label: "Approved", cls: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" };
  if (s.includes("REJECT"))
    return { label: "Rejected", cls: "bg-rose-500/10 text-rose-700 border-rose-500/20" };
  if (s.includes("DISBU"))
    return { label: "Disbursed", cls: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20" };
  if (s.includes("VERIF"))
    return { label: "Under Verification", cls: "bg-violet-500/10 text-violet-700 border-violet-500/20" };
  return { label: status, cls: "bg-amber-500/10 text-amber-700 border-amber-500/20" };
}

function verificationBadge(vs?: string) {
  if (!vs) return null;
  const v = vs.toUpperCase();
  if (v === "COMPLETED")
    return <span className="text-xs font-medium text-emerald-600">✓ Verified</span>;
  if (v === "FAILED")
    return <span className="text-xs font-medium text-rose-600">✗ Failed</span>;
  return <span className="text-xs text-muted-foreground">{vs}</span>;
}

export default function ManagerPendingLoansPage() {
  const loansQuery = useManagerPendingLoansQuery({ status: "PENDING" });

  if (loansQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (loansQuery.isError) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          Unable to load pending loans. Please try again.
        </CardContent>
      </Card>
    );
  }

  const queue = loansQuery.data ?? [];

  if (queue.length === 0) {
    return (
      <div className="space-y-4">
        {/* Page header */}
        <div className="rounded-xl border border-border/80 bg-fintech-surface bg-fintech-glow p-5">
          <div className="flex items-center gap-3">
            <ClipboardList className="size-5 text-primary" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Loan Queue</h1>
              <p className="text-sm text-muted-foreground">
                Review, approve/reject, inspect evidence, and assign agents.
              </p>
            </div>
          </div>
        </div>
        <EmptyState
          title="No pending loans"
          description="There are no loan applications awaiting manager decision right now."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Page header ──────────────────────────────── */}
      <div className="rounded-xl border border-border/80 bg-fintech-surface bg-fintech-glow p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ClipboardList className="size-5 text-primary" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Loan Queue</h1>
              <p className="text-sm text-muted-foreground">
                Review, approve/reject, inspect evidence, and assign agents.
              </p>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10">
            {queue.length} pending
          </Badge>
        </div>
      </div>

      {/* ── Loan cards ───────────────────────────────── */}
      <div className="grid gap-3">
        {queue.map((loan) => {
          const loanId = loan.loanApplicationId ?? loan.loanId;
          const { label, cls } = statusVariant(loan.status);

          return (
            <Card
              key={loanId}
              className="border-border/80 bg-card/85 py-0 shadow-sm transition-shadow hover:shadow-md"
            >
              <CardContent className="px-4 py-4">
                {/* Top row: IDs + status badge */}
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground">
                      #{loanId}
                    </span>
                    {loan.applicationNumber && (
                      <span className="text-xs text-muted-foreground">
                        · App {loan.applicationNumber}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                      cls,
                    )}
                  >
                    {label}
                  </span>
                </div>

                {/* Detail grid */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Applicant</p>
                    <p className="mt-0.5 font-semibold">
                      {loan.applicantName ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Loan Amount</p>
                    <p className="mt-0.5 font-semibold">
                      {formatCurrency(
                        loan.loanAmount ?? loan.requestedAmount ?? 0,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Assigned Agent
                    </p>
                    <p className="mt-0.5 font-medium">
                      {loan.assignedAgentName ?? (
                        <span className="text-muted-foreground">
                          Not assigned
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Verification</p>
                    <div className="mt-0.5">
                      {verificationBadge(loan.verificationStatus)}
                    </div>
                  </div>
                </div>

                {/* Footer: timestamp + actions */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3">
                  <p className="text-xs text-muted-foreground">
                    Updated {formatDateTime(loan.updatedAt ?? loan.createdAt)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <Link href={`/manager/loans/${loanId}/review`}>
                        <Eye className="mr-1.5 size-3.5" />
                        Review
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/manager/loans/${loanId}/verification-evidence`}>
                        <ScanLine className="mr-1.5 size-3.5" />
                        Evidence
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/manager/loans/${loanId}/assign-agent`}>
                        <UserCheck className="mr-1.5 size-3.5" />
                        Agent
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
