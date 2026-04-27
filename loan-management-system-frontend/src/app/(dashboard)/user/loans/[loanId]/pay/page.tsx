"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CreditCard } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useEmiScheduleQuery, usePayEmiMutation } from "@/hooks/user/useUserPayments";
import { formatDisplayDate, formatMoney, getStatusBadge } from "@/lib/user-ui";
import type { PayEmiReceipt } from "@/types/user.types";

export default function UserPayEmiPage() {
  const params = useParams<{ loanId: string }>();
  const loanId = params?.loanId ?? "";

  const emiScheduleQuery = useEmiScheduleQuery(loanId);
  const payEmiMutation = usePayEmiMutation();

  const [selectedEmiId, setSelectedEmiId] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<"BANK_TRANSFER" | "CASH" | "UPI">("UPI");
  const [gatewayOrderId, setGatewayOrderId] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<PayEmiReceipt | null>(null);

  const payableRows = useMemo(
    () =>
      (emiScheduleQuery.data?.schedule ?? []).filter((row) => {
        const status = (row.emiStatus ?? "").toUpperCase();
        return status === "PENDING" || status === "OVERDUE";
      }),
    [emiScheduleQuery.data?.schedule],
  );

  const selectedEmi = useMemo(
    () => payableRows.find((row) => row.emiScheduleId === selectedEmiId),
    [payableRows, selectedEmiId],
  );

  const onSelectEmi = (emiId: string) => {
    setSelectedEmiId(emiId);
    const row = payableRows.find((item) => item.emiScheduleId === emiId);
    if (row) {
      setPaymentAmount(String(row.emiAmount + (row.penaltyAmount ?? 0)));
    }
  };

  const submitPayment = async () => {
    setError("");

    if (!selectedEmi) {
      setError("Please select an EMI to pay.");
      return;
    }

    if (!paymentAmount || Number(paymentAmount) <= 0) {
      setError("Payment amount must be greater than zero.");
      return;
    }

    const result = await payEmiMutation.mutateAsync({
      emiScheduleId: selectedEmi.emiScheduleId,
      paymentAmount: Number(paymentAmount),
      paymentMode,
      gatewayOrderId: gatewayOrderId.trim() || undefined,
      paymentReference: paymentReference.trim() || undefined,
    });

    setReceipt(result.receipt);
  };

  const receiptStatus = getStatusBadge(receipt?.paymentStatus ?? "UNKNOWN");

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pay EMI</h1>
          <p className="mt-1 text-sm text-muted-foreground">Select unpaid/overdue EMI and submit payment details.</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/user/loans/${loanId}/emi-schedule`}>View EMI Schedule</Link>
        </Button>
      </div>

      {emiScheduleQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-52" />
        </div>
      ) : null}

      {!emiScheduleQuery.isLoading && !emiScheduleQuery.isError && payableRows.length === 0 ? (
        <EmptyState
          title="No payable EMI found"
          description="There are no pending or overdue installments to pay right now."
        />
      ) : null}

      {emiScheduleQuery.isError ? (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">Unable to load EMI schedule for payment.</CardContent>
        </Card>
      ) : null}

      {payableRows.length > 0 ? (
        <Card className="py-0">
          <CardHeader className="border-b px-4 py-3">
            <CardTitle>Payment Form</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 py-4">
            <div className="space-y-2">
              <Label>Select EMI</Label>
              <Select value={selectedEmiId} onValueChange={onSelectEmi}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select pending/overdue EMI" />
                </SelectTrigger>
                <SelectContent>
                  {payableRows.map((row) => (
                    <SelectItem key={row.emiScheduleId} value={row.emiScheduleId}>
                      EMI {row.emiNumber} • Due {formatDisplayDate(row.dueDate)} • Amount {formatMoney(row.emiAmount)}
                      {row.penaltyAmount > 0 ? ` • Penalty ${formatMoney(row.penaltyAmount)}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={paymentAmount}
                  onChange={(event) => setPaymentAmount(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select value={paymentMode} onValueChange={(value) => setPaymentMode(value as "BANK_TRANSFER" | "CASH" | "UPI")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK_TRANSFER">BANK_TRANSFER</SelectItem>
                    <SelectItem value="CASH">CASH</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gatewayOrderId">Gateway Order ID</Label>
                <Input id="gatewayOrderId" value={gatewayOrderId} onChange={(event) => setGatewayOrderId(event.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentReference">Payment Reference</Label>
                <Input id="paymentReference" value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} />
              </div>
            </div>

            {selectedEmi ? (
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                EMI {selectedEmi.emiNumber} total due: {formatMoney(selectedEmi.emiAmount + (selectedEmi.penaltyAmount ?? 0))}
              </div>
            ) : null}

            {error ? <p className="text-xs text-destructive">{error}</p> : null}

            <Button type="button" onClick={submitPayment} disabled={payEmiMutation.isPending}>
              <CreditCard className="mr-1 h-4 w-4" />
              {payEmiMutation.isPending ? "Processing..." : "Pay EMI"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {receipt ? (
        <Card className="py-0">
          <CardHeader className="border-b px-4 py-3">
            <CardTitle>Payment Receipt</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 px-4 py-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Payment Number</p>
              <p className="mt-1 text-sm font-medium text-foreground">{receipt.paymentNumber}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Receipt Number</p>
              <p className="mt-1 text-sm font-medium text-foreground">{receipt.receiptNumber ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Paid</p>
              <p className="mt-1 text-sm font-medium text-foreground">{formatMoney(receipt.totalPaidAmount)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Payment Status</p>
              <Badge variant={receiptStatus.variant} className={`${receiptStatus.className} mt-1`}>
                {receiptStatus.label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
