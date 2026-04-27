"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfficerSettlementHistoryQuery } from "@/hooks/officer/useOfficerWorkflow";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

export default function OfficerCashSettlementHistoryPage() {
  const historyQuery = useOfficerSettlementHistoryQuery();

  if (historyQuery.isLoading) {
    return <Skeleton className="h-72" />;
  }

  if (historyQuery.isError) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-destructive">Unable to load settlement history.</CardContent>
      </Card>
    );
  }

  const rows = historyQuery.data ?? [];

  return (
    <div className="space-y-5">
      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-lg">Settlement History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 py-4">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No settlement history available.</p>
          ) : (
            rows.map((row, index) => (
              <div key={`${row.settlementReference}-${index}`} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium">{row.settlementReference}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(row.settledAt)}</p>
                </div>
                <p className="font-semibold">{formatCurrency(row.settledAmount)}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
