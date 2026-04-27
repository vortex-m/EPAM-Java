"use client";

import { History } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePaymentHistoryQuery } from "@/hooks/user/useUserPayments";
import { formatDisplayDate, formatMoney, getStatusBadge } from "@/lib/user-ui";

export default function UserPaymentsPage() {
  const paymentHistoryQuery = usePaymentHistoryQuery();
  const payments = paymentHistoryQuery.data?.payments ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex items-start gap-2">
        <History className="mt-0.5 h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Payment History</h1>
          <p className="mt-1 text-sm text-muted-foreground">View all EMI payments made across your loans.</p>
        </div>
      </div>

      {paymentHistoryQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-80" />
        </div>
      ) : null}

      {paymentHistoryQuery.isError ? (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">Unable to load payment history.</CardContent>
        </Card>
      ) : null}

      {!paymentHistoryQuery.isLoading && !paymentHistoryQuery.isError && payments.length === 0 ? (
        <EmptyState title="No payment records" description="Payments will appear here after you start paying EMIs." />
      ) : null}

      {payments.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background [&_tr]:border-b">
              <TableRow>
                <TableHead>Payment Number</TableHead>
                <TableHead>Loan Number</TableHead>
                <TableHead>EMI Number</TableHead>
                <TableHead>Total Paid</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid At</TableHead>
                <TableHead>Receipt Number</TableHead>
                <TableHead>Cash Settlement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment, index) => {
                const status = getStatusBadge(payment.paymentStatus);
                const isCash = (payment.paymentMode ?? "").toUpperCase() === "CASH";

                return (
                  <TableRow key={payment.paymentId} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <TableCell>{payment.paymentNumber}</TableCell>
                    <TableCell>{payment.loanNumber ?? "-"}</TableCell>
                    <TableCell>{payment.emiNumber ?? "-"}</TableCell>
                    <TableCell>{formatMoney(payment.totalPaidAmount)}</TableCell>
                    <TableCell>{payment.paymentMode || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className={status.className}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDisplayDate(payment.paidAt)}</TableCell>
                    <TableCell>{payment.receiptNumber || "-"}</TableCell>
                    <TableCell>{isCash ? payment.cashSettlementStatus || "-" : "-"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}
