"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfficerCashDisbursalQueueQuery } from "@/hooks/officer/useOfficerWorkflow";
import { formatCurrency } from "@/lib/formatters";

export default function OfficerCashDisbursalQueuePage() {
  const queueQuery = useOfficerCashDisbursalQueueQuery();

  if (queueQuery.isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (queueQuery.isError) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-destructive">Unable to load cash disbursal queue.</CardContent>
      </Card>
    );
  }

  const queue = queueQuery.data ?? [];

  if (queue.length === 0) {
    return (
      <EmptyState
        title="No pending cash disbursal"
        description="All cash disbursal handovers are either completed or no cash-mode approvals are pending."
      />
    );
  }

  return (
    <div className="space-y-5">
      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-lg">Cash Disbursal Handover Queue</CardTitle>
        </CardHeader>
      </Card>

      <div className="grid gap-3">
        {queue.map((item) => (
          <Card key={item.loanApplicationId} className="py-0">
            <CardContent className="grid gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <p className="text-xs text-muted-foreground">Application</p>
                <p className="font-medium">{item.applicationNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Applicant</p>
                <p className="font-medium">{item.applicantName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Assigned Agent</p>
                <p className="font-medium">{item.assignedAgentName}</p>
                <p className="text-xs text-muted-foreground">{item.assignedAgentEmail}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="font-medium">{formatCurrency(item.loanAmount)}</p>
              </div>
              <div className="flex items-end justify-between gap-2 lg:justify-end">
                <Badge variant="outline">{item.otpStatus}</Badge>
                <Button asChild size="sm">
                  <Link href={`/officer/cash-disbursal/${item.taskId}`}>Open Handover</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
