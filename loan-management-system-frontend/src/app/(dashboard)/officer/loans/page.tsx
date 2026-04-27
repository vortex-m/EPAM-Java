"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfficerPendingLoansQuery } from "@/hooks/officer/useOfficerWorkflow";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

export default function OfficerLoanQueuePage() {
  const loansQuery = useOfficerPendingLoansQuery();

  if (loansQuery.isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (loansQuery.isError) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-destructive">Unable to load pending loans.</CardContent>
      </Card>
    );
  }

  const queue = loansQuery.data ?? [];

  if (queue.length === 0) {
    return (
      <EmptyState
        title="No pending loans"
        description="Officer loan review queue is currently empty."
      />
    );
  }

  return (
    <div className="space-y-5">
      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-lg">Pending Loan Review Queue</CardTitle>
        </CardHeader>
      </Card>

      <div className="grid gap-3">
        {queue.map((loan) => (
          <Card key={loan.loanApplicationId} className="py-0">
            <CardContent className="space-y-3 px-4 py-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <p className="text-xs text-muted-foreground">Application</p>
                  <p className="font-medium">{loan.applicationNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Applicant</p>
                  <p className="font-medium">{loan.userName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Requested Amount</p>
                  <p className="font-medium">{formatCurrency(loan.requestedAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tenure</p>
                  <p className="font-medium">{loan.tenureMonths} months</p>
                </div>
                <div className="flex items-start justify-between gap-2 lg:justify-end">
                  <Badge variant="outline">{loan.status}</Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>Verification: {loan.verificationTaskStatus ?? "-"}</span>
                <span>|</span>
                <span>Evidence: {loan.verificationEvidenceAvailable ? "Available" : "Pending"}</span>
                <span>|</span>
                <span>Applied: {formatDateTime(loan.appliedAt)}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/officer/loans/${loan.loanApplicationId}`}>View Details</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/officer/loans/${loan.loanApplicationId}`}>Start Review</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
