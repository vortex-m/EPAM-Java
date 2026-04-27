"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllLoansQuery } from "@/hooks/user/useUserLoans";
import { formatDisplayDate, formatMoney, getStatusBadge } from "@/lib/user-ui";

export default function UserLoansPage() {
  const loansQuery = useAllLoansQuery();
  const loans = loansQuery.data ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <CreditCard className="mt-0.5 h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">My Loans</h1>
            <p className="mt-1 text-sm text-muted-foreground">Track all applications and active loans in one place.</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/user/loans/apply">Apply Loan</Link>
        </Button>
      </div>

      {loansQuery.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-52" />
          ))}
        </div>
      ) : null}

      {loansQuery.isError ? (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">Unable to load your loans.</CardContent>
        </Card>
      ) : null}

      {!loansQuery.isLoading && !loansQuery.isError && loans.length === 0 ? (
        <EmptyState
          title="No loans found"
          description="You have not applied for any loan yet. Start your first application now."
          action={
            <Button asChild>
              <Link href="/user/loans/apply">Apply for Loan</Link>
            </Button>
          }
        />
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {loans.map((loan) => {
          const status = getStatusBadge(loan.status);

          return (
            <Card key={loan.loanApplicationId} className="py-0">
              <CardContent className="space-y-4 px-4 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Application #{loan.applicationNumber}</p>
                    <p className="text-xs text-muted-foreground">Loan #{loan.loanNumber ?? "Pending"}</p>
                  </div>
                  <Badge variant={status.variant} className={status.className}>
                    {status.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Requested Amount</p>
                    <p className="font-medium text-foreground">{formatMoney(loan.requestedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Approved Amount</p>
                    <p className="font-medium text-foreground">{formatMoney(loan.approvedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">EMI Amount</p>
                    <p className="font-medium text-foreground">{formatMoney(loan.emiAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Next Due Date</p>
                    <p className="font-medium text-foreground">{formatDisplayDate(loan.nextDueDate)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Outstanding Principal</p>
                    <p className="font-medium text-foreground">{formatMoney(loan.outstandingPrincipal)}</p>
                  </div>
                </div>

                <Button asChild className="w-full" variant="outline">
                  <Link href={`/user/loans/${loan.loanApplicationId}`}>View Loan Details</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
