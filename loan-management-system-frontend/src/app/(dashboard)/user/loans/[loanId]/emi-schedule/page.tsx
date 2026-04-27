"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarClock } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useEmiScheduleQuery } from "@/hooks/user/useUserPayments";
import { formatDisplayDate, formatMoney, getStatusBadge } from "@/lib/user-ui";

export default function UserEmiSchedulePage() {
  const params = useParams<{ loanId: string }>();
  const loanId = params?.loanId ?? "";

  const emiScheduleQuery = useEmiScheduleQuery(loanId);
  const data = emiScheduleQuery.data;
  const schedule = data?.schedule ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <CalendarClock className="mt-0.5 h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">EMI Schedule</h1>
            <p className="mt-1 text-sm text-muted-foreground">Loan #{data?.loanNumber ?? loanId}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/user/loans/${loanId}/pay`}>Pay EMI</Link>
        </Button>
      </div>

      {emiScheduleQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-72" />
        </div>
      ) : null}

      {data ? (
        <Card className="py-0">
          <CardContent className="grid gap-4 px-4 py-4 md:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Loan Number</p>
              <p className="mt-1 text-sm font-medium text-foreground">{data.loanNumber ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Principal Amount</p>
              <p className="mt-1 text-sm font-medium text-foreground">{formatMoney(data.principalAmount)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Interest Rate</p>
              <p className="mt-1 text-sm font-medium text-foreground">{data.interestRate}%</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">EMI Amount</p>
              <p className="mt-1 text-sm font-medium text-foreground">{formatMoney(data.emiAmount)}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {emiScheduleQuery.isError ? (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">Unable to load EMI schedule.</CardContent>
        </Card>
      ) : null}

      {!emiScheduleQuery.isLoading && !emiScheduleQuery.isError && schedule.length === 0 ? (
        <EmptyState title="No EMI schedule found" description="EMI schedule will appear once the loan is disbursed." />
      ) : null}

      {schedule.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background [&_tr]:border-b">
              <TableRow>
                <TableHead>EMI #</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>EMI Amount</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Outstanding Principal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid Date</TableHead>
                <TableHead>Penalty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.map((row, index) => {
                const status = getStatusBadge(row.emiStatus);
                const isOverdue = (row.emiStatus ?? "").toUpperCase() === "OVERDUE";

                return (
                  <TableRow
                    key={row.emiScheduleId}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} ${isOverdue ? "bg-red-50/70" : ""}`}
                  >
                    <TableCell>{row.emiNumber}</TableCell>
                    <TableCell>{formatDisplayDate(row.dueDate)}</TableCell>
                    <TableCell>{formatMoney(row.emiAmount)}</TableCell>
                    <TableCell>{formatMoney(row.principalComponent)}</TableCell>
                    <TableCell>{formatMoney(row.interestComponent)}</TableCell>
                    <TableCell>{formatMoney(row.outstandingPrincipal)}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className={status.className}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDisplayDate(row.paidDate)}</TableCell>
                    <TableCell>{formatMoney(row.penaltyAmount)}</TableCell>
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
