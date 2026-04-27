"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BanknoteIcon,
  CheckCircle2,
  ClipboardList,
  ScanLine,
  UserCheck,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useManagerDisbursalMutation,
  useManagerLoanDecisionMutation,
  useManagerPendingLoansQuery,
} from "@/hooks/manager/useManagerWorkflow";
import type { ManagerLoanDecisionRequest } from "@/types/manager.types";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export default function ManagerLoanReviewPage() {
  const params = useParams<{ loanId: string }>();
  const loanId = Number(params.loanId);

  const loansQuery = useManagerPendingLoansQuery();
  const decisionMutation = useManagerLoanDecisionMutation();
  const disbursalMutation = useManagerDisbursalMutation();

  const [form, setForm] = useState<ManagerLoanDecisionRequest>({
    decision: "APPROVED",
    remarks: "",
    disbursal_mode: "BANK_TRANSFER",
    loan_tenure: 12,
    interest_rate: 18.5,
  });
  const [transactionReference, setTransactionReference] = useState("");

  const loan = useMemo(() => {
    const rows = loansQuery.data ?? [];
    return rows.find(
      (item) => Number(item.loanApplicationId ?? item.loanId) === loanId,
    );
  }, [loansQuery.data, loanId]);

  const handleDecision = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await decisionMutation.mutateAsync({ loanId, payload: form });
  };

  const handleDisbursal = async () => {
    if (!transactionReference.trim()) return;
    await disbursalMutation.mutateAsync({
      loanId,
      transactionReference: transactionReference.trim(),
    });
  };

  if (loansQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Page header ──────────────────────────────── */}
      <div className="rounded-xl border border-border/80 bg-fintech-surface bg-fintech-glow p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <ClipboardList className="size-5 text-primary" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Loan Review
              </h1>
              <p className="text-sm text-muted-foreground">
                Loan #{loanId} · Submit final decision and trigger disbursal.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/manager/loans/pending">
              <ArrowLeft className="mr-1.5 size-3.5" />
              Back to Queue
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Loan info banner ─────────────────────────── */}
      <Card className="border-border/80 bg-card/85 py-0 shadow-sm">
        <CardContent className="grid gap-4 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Applicant</p>
            <p className="mt-1 font-semibold">{loan?.applicantName ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="mt-1 font-semibold">
              {formatCurrency(loan?.loanAmount ?? loan?.requestedAmount ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <Badge variant="outline">{loan?.status ?? "—"}</Badge>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Last Updated</p>
            <p className="mt-1 text-sm font-medium">
              {formatDateTime(loan?.updatedAt ?? loan?.createdAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Quick links ──────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/manager/loans/${loanId}/verification-evidence`}>
            <ScanLine className="mr-1.5 size-3.5" />
            View Evidence
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/manager/loans/${loanId}/assign-agent`}>
            <UserCheck className="mr-1.5 size-3.5" />
            Assign / Reassign Agent
          </Link>
        </Button>
      </div>

      {/* ── Decision form ────────────────────────────── */}
      <Card className="border-border/80 bg-card/85 py-0 shadow-sm">
        <CardHeader className="border-b border-border/60 px-4 py-3">
          <CardTitle className="text-base">Manager Decision</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4">
          <form className="space-y-5" onSubmit={handleDecision}>
            {/* Decision selector with visual highlight */}
            <div className="space-y-2">
              <Label>Decision</Label>
              <div className="flex gap-2">
                {(["APPROVED", "REJECTED"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, decision: opt }))
                    }
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition-all",
                      form.decision === opt
                        ? opt === "APPROVED"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                        : "border-border bg-background text-muted-foreground hover:border-border/80 hover:bg-muted",
                    )}
                  >
                    {opt === "APPROVED" ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <XCircle className="size-4" />
                    )}
                    {opt === "APPROVED" ? "Approve" : "Reject"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Disbursal Mode</Label>
                <Select
                  value={form.disbursal_mode ?? "BANK_TRANSFER"}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      disbursal_mode: value as "BANK_TRANSFER" | "CASH" | "UPI",
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Disbursal mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loanTenure">Tenure (months)</Label>
                <Input
                  id="loanTenure"
                  type="number"
                  min={1}
                  value={form.loan_tenure ?? 12}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      loan_tenure: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  min={0}
                  value={form.interest_rate ?? 18.5}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      interest_rate: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Manager Remarks *</Label>
              <Textarea
                id="remarks"
                rows={3}
                value={form.remarks}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, remarks: e.target.value }))
                }
                placeholder="Approved based on stable repayment profile and verified documents."
                required
              />
            </div>

            <Button
              type="submit"
              disabled={decisionMutation.isPending}
              className={cn(
                form.decision === "REJECTED"
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "",
              )}
            >
              {decisionMutation.isPending
                ? "Submitting…"
                : `Submit ${form.decision === "APPROVED" ? "Approval" : "Rejection"}`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Bank Disbursal ───────────────────────────── */}
      <Card className="border-border/80 bg-card/85 py-0 shadow-sm">
        <CardHeader className="border-b border-border/60 px-4 py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BanknoteIcon className="size-4 text-indigo-600" />
            Bank Disbursal
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3 px-4 py-4">
          <div className="min-w-64 flex-1 space-y-2">
            <Label htmlFor="transactionReference">
              Transaction / UTR Reference
            </Label>
            <Input
              id="transactionReference"
              placeholder="Enter UTR / NEFT / IMPS reference"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
            />
          </div>
          <Button
            onClick={handleDisbursal}
            disabled={
              disbursalMutation.isPending || !transactionReference.trim()
            }
            variant="outline"
            className="border-indigo-500/30 text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400"
          >
            {disbursalMutation.isPending ? "Processing…" : "Mark Bank Disbursal"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
