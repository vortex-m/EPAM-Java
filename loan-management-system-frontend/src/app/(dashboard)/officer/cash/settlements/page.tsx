"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useOfficerCashSettlementMutation,
  useOfficerDashboardQuery,
  useOfficerUnsettledCashPaymentsQuery,
} from "@/hooks/officer/useOfficerWorkflow";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

export default function OfficerCashSettlementsPage() {
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<number[]>([]);
  const [settlementReference, setSettlementReference] = useState("");

  const dashboardQuery = useOfficerDashboardQuery();
  const unsettledQuery = useOfficerUnsettledCashPaymentsQuery();
  const settlementMutation = useOfficerCashSettlementMutation();

  const unsettled = unsettledQuery.data ?? [];

  const selectedAmount = useMemo(
    () => unsettled
      .filter((item) => selectedPaymentIds.includes(item.paymentId))
      .reduce((acc, item) => acc + item.amount, 0),
    [unsettled, selectedPaymentIds],
  );

  const togglePayment = (paymentId: number) => {
    setSelectedPaymentIds((prev) =>
      prev.includes(paymentId) ? prev.filter((id) => id !== paymentId) : [...prev, paymentId],
    );
  };

  const onSettle = () => {
    settlementMutation.mutate({
      paymentIds: selectedPaymentIds,
      settlementReference,
    });
  };

  if (dashboardQuery.isLoading || unsettledQuery.isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-5">
      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-lg">Cash Settlements & Tracking</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Total Collected</p>
            <p className="text-base font-semibold">{formatCurrency(dashboardQuery.data?.totalCollectedCash ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Settled</p>
            <p className="text-base font-semibold text-emerald-700">{formatCurrency(dashboardQuery.data?.totalSettledCash ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pending Settlement</p>
            <p className="text-base font-semibold text-amber-700">{formatCurrency(dashboardQuery.data?.totalUnsettledCash ?? 0)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-base">Unsettled Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 py-4">
          {unsettled.length === 0 ? (
            <p className="text-sm text-muted-foreground">No unsettled payments available.</p>
          ) : (
            <div className="space-y-2">
              {unsettled.map((item) => (
                <label
                  key={item.paymentId}
                  className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedPaymentIds.includes(item.paymentId)}
                      onChange={() => togglePayment(item.paymentId)}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-medium">{item.paymentCode} ({item.applicationNumber})</p>
                      <p className="text-xs text-muted-foreground">Agent: {item.agentName}</p>
                      <p className="text-xs text-muted-foreground">Collected: {formatDateTime(item.collectedAt)}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(item.amount)}</p>
                </label>
              ))}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="settlementReference">Settlement Reference</Label>
              <Input
                id="settlementReference"
                value={settlementReference}
                onChange={(event) => setSettlementReference(event.target.value)}
                placeholder="SETTLE-2026-04-21-001"
              />
            </div>
            <Button
              onClick={onSettle}
              disabled={
                settlementMutation.isPending ||
                selectedPaymentIds.length === 0 ||
                !settlementReference.trim()
              }
            >
              Settle Selected ({selectedPaymentIds.length})
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Selected amount: <span className="font-semibold text-foreground">{formatCurrency(selectedAmount)}</span>
          </p>

          {settlementMutation.data?.data ? (
            <Card className="border-emerald-200 bg-emerald-50 py-0">
              <CardContent className="px-4 py-3 text-sm text-emerald-900">
                Settled {settlementMutation.data.data.settledPaymentsCount} payments worth {formatCurrency(settlementMutation.data.data.settledAmount)}.
              </CardContent>
            </Card>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
