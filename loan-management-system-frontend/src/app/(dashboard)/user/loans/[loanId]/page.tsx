"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar, CheckCircle2, Contact, CreditCard, FileText } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllLoansQuery, useLoanDetailsQuery } from "@/hooks/user/useUserLoans";
import { formatDisplayDate, formatMoney, getStatusBadge, maskBankAccount } from "@/lib/user-ui";

function SectionField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value || "-"}</p>
    </div>
  );
}

export default function UserLoanDetailsPage() {
  const params = useParams<{ loanId: string }>();
  const loanApplicationId = params?.loanId ?? "";

  const loanDetailsQuery = useLoanDetailsQuery(loanApplicationId);
  const loansQuery = useAllLoansQuery();
  const loans = loansQuery.data ?? [];
  const details = loanDetailsQuery.data;
  const status = getStatusBadge(details?.status ?? "UNKNOWN");
  const fallbackLoanId = loans.find(
    (loan) => String(loan.loanApplicationId) === String(loanApplicationId),
  )?.loanId;
  const repaymentLoanId = details?.loanId ?? fallbackLoanId;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Loan Details</h1>
          <p className="mt-1 text-sm text-muted-foreground">Application #{details?.applicationNumber ?? loanApplicationId}</p>
        </div>
        <Badge variant={status.variant} className={status.className}>
          {status.label}
        </Badge>
      </div>

      {loanDetailsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : null}

      {loanDetailsQuery.isError ? (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">Unable to load loan details.</CardContent>
        </Card>
      ) : null}

      {!loanDetailsQuery.isLoading && !loanDetailsQuery.isError && !details ? (
        <EmptyState title="Loan not found" description="The requested loan details could not be loaded." />
      ) : null}

      {details ? (
        <>
          <Card className="py-0">
            <CardHeader className="border-b px-4 py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" />
                Loan Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 px-4 py-4 md:grid-cols-3">
              <SectionField label="Requested Amount" value={formatMoney(details.requestedAmount)} />
              <SectionField label="Approved Amount" value={formatMoney(details.approvedAmount)} />
              <SectionField label="Tenure" value={`${details.tenureMonths} months`} />
              <SectionField label="Interest Rate" value={details.interestRate ? `${details.interestRate}%` : "-"} />
              <SectionField label="Processing Fee" value={formatMoney(details.processingFee)} />
              <SectionField label="Disbursement Date" value={formatDisplayDate(details.disbursementDate)} />
            </CardContent>
          </Card>

          <Card className="py-0">
            <CardHeader className="border-b px-4 py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                EMI Info
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 px-4 py-4 md:grid-cols-3">
              <SectionField label="EMI Amount" value={formatMoney(details.emiAmount)} />
              <SectionField label="Total EMIs" value={String(details.totalEmis ?? "-")} />
              <SectionField label="Paid EMIs" value={String(details.emisPaid ?? "-")} />
              <SectionField label="Pending EMIs" value={String(details.emisPending ?? "-")} />
              <SectionField label="Overdue EMIs" value={String(details.emisOverdue ?? "-")} />
              <SectionField label="Next Due Date" value={formatDisplayDate(details.nextDueDate)} />
            </CardContent>
          </Card>

          <Card className="py-0">
            <CardHeader className="border-b px-4 py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Disbursal Info
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 px-4 py-4 md:grid-cols-3">
              <SectionField label="Mode" value={details.disbursalMode ?? "-"} />
              <SectionField label="Bank Name" value={details.disbursalBankName ?? "-"} />
              <SectionField
                label="Bank Account"
                value={details.disbursalBankAccountMasked ?? maskBankAccount(details.disbursalBankAccountMasked)}
              />
              <SectionField label="IFSC" value={details.disbursalIfscCode ?? "-"} />
              <SectionField label="Outstanding Principal" value={formatMoney(details.outstandingPrincipal)} />
            </CardContent>
          </Card>

          <Card className="py-0">
            <CardHeader className="border-b px-4 py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Contact className="h-4 w-4" />
                Assigned Staff
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 px-4 py-4 md:grid-cols-2">
              <SectionField label="Agent" value={`${details.assignedAgentName ?? "-"} (${details.assignedAgentPhone ?? "-"})`} />
              <SectionField label="Officer" value={`${details.assignedOfficerName ?? "-"} (${details.assignedOfficerPhone ?? "-"})`} />
            </CardContent>
          </Card>

          <Card className="py-0">
            <CardHeader className="border-b px-4 py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="h-4 w-4" />
                Remarks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 py-4">
              <p className="text-sm text-foreground">Officer Remarks: {details.officerRemarks || "-"}</p>
              {details.rejectionReason ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  Rejection Reason: {details.rejectionReason}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            {repaymentLoanId ? (
              <Button asChild variant="outline">
                <Link href={`/user/loans/${repaymentLoanId}/emi-schedule`}>View EMI Schedule</Link>
              </Button>
            ) : (
              <Button variant="outline" disabled>
                View EMI Schedule
              </Button>
            )}
            {(details.status ?? "").toUpperCase() === "DISBURSED" && repaymentLoanId ? (
              <Button asChild>
                <Link href={`/user/loans/${repaymentLoanId}/pay`}>Pay EMI</Link>
              </Button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
