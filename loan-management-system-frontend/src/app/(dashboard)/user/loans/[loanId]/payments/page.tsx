"use client";

import { useParams } from "next/navigation";

import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SectionContainer } from "@/components/user/SectionContainer";
import { usePaymentHistory } from "@/hooks/useLoan";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function LoanPaymentsPage() {
  const params = useParams<{ loanId: string }>();
  const loanId = params?.loanId ?? "";

  const paymentsQuery = usePaymentHistory(loanId);
  const payments = paymentsQuery.data?.payments ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Loan Payment History</h1>
        <p className="mt-1 text-sm text-muted-foreground">Loan ID: {loanId}</p>
      </div>

      <SectionContainer title="Payments" description="Includes split between principal, interest and penalty.">
        {paymentsQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading payment history...</p> : null}
        {paymentsQuery.isError ? <p className="text-sm text-destructive">Unable to load payment history.</p> : null}

        {payments.length === 0 && !paymentsQuery.isLoading ? (
          <EmptyState title="No payments yet" description="Payments for this loan will appear after successful EMI transactions." />
        ) : null}

        {payments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment #</TableHead>
                <TableHead>Paid At</TableHead>
                <TableHead>Loan #</TableHead>
                <TableHead>EMI #</TableHead>
                <TableHead>Total Paid</TableHead>
                <TableHead>Split (P/I/P)</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Receipt #</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((item) => (
                <TableRow key={item.paymentId}>
                  <TableCell>{item.paymentNumber}</TableCell>
                  <TableCell>{formatDateTime(item.paidAt)}</TableCell>
                  <TableCell>{item.loanNumber || "-"}</TableCell>
                  <TableCell>{item.emiNumber ?? "-"}</TableCell>
                  <TableCell>{formatCurrency(item.totalPaidAmount)}</TableCell>
                  <TableCell>
                    {formatCurrency(item.principalPaid)} / {formatCurrency(item.interestPaid)} / {formatCurrency(item.penaltyPaid)}
                  </TableCell>
                  <TableCell>{item.paymentMode || "-"}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.paymentStatus} />
                  </TableCell>
                  <TableCell>{item.paymentReference || "-"}</TableCell>
                  <TableCell>{item.receiptNumber || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </SectionContainer>
    </div>
  );
}
