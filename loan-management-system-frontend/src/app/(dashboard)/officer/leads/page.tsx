"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useOfficerLeadDecisionMutation,
  useOfficerLeadQueueQuery,
} from "@/hooks/officer/useOfficerWorkflow";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

export default function OfficerLeadQueuePage() {
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [remarks, setRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const leadQueueQuery = useOfficerLeadQueueQuery();
  const decisionMutation = useOfficerLeadDecisionMutation();

  if (leadQueueQuery.isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (leadQueueQuery.isError) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-destructive">Unable to load lead queue.</CardContent>
      </Card>
    );
  }

  const queue = leadQueueQuery.data ?? [];

  if (queue.length === 0) {
    return (
      <EmptyState
        title="No leads in queue"
        description="Officer lead queue is clear right now."
      />
    );
  }

  return (
    <div className="space-y-5">
      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-lg">Lead Management Queue</CardTitle>
        </CardHeader>
      </Card>

      <div className="grid gap-3">
        {queue.map((lead) => (
          <Card key={lead.leadId} className="py-0">
            <CardContent className="space-y-4 px-4 py-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <p className="text-xs text-muted-foreground">Lead</p>
                  <p className="font-medium">{lead.leadName}</p>
                  <p className="text-xs text-muted-foreground">ID: {lead.leadId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{lead.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatCurrency(lead.loanAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Source / Score</p>
                  <p className="font-medium">{lead.leadSource} / {lead.leadScore}</p>
                </div>
                <div className="flex items-start justify-between gap-2 lg:justify-end">
                  <Badge variant="outline">{lead.leadStatus}</Badge>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">Created: {formatDateTime(lead.createdAt)}</p>

              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/officer/leads/${lead.leadId}`}>View Details</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/officer/leads/${lead.leadId}/convert`}>Convert</Link>
                </Button>
                <Button size="sm" onClick={() => setSelectedLeadId(lead.leadId)}>
                  Quick Decision
                </Button>
              </div>

              {selectedLeadId === lead.leadId ? (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="space-y-2">
                    <Label htmlFor={`remarks-${lead.leadId}`}>Remarks</Label>
                    <Textarea
                      id={`remarks-${lead.leadId}`}
                      value={remarks}
                      onChange={(event) => setRemarks(event.target.value)}
                      placeholder="Lead looks promising"
                    />
                  </div>
                  <div className="mt-3 space-y-2">
                    <Label htmlFor={`rejectionReason-${lead.leadId}`}>Rejection Reason (only for reject)</Label>
                    <Input
                      id={`rejectionReason-${lead.leadId}`}
                      value={rejectionReason}
                      onChange={(event) => setRejectionReason(event.target.value)}
                      placeholder="Missing eligibility criteria"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        decisionMutation.mutate({
                          leadId: lead.leadId,
                          payload: {
                            decision: "APPROVED",
                            remarks,
                            rejectionReason: null,
                          },
                        })
                      }
                      disabled={decisionMutation.isPending || !remarks.trim()}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        decisionMutation.mutate({
                          leadId: lead.leadId,
                          payload: {
                            decision: "REJECTED",
                            remarks,
                            rejectionReason,
                          },
                        })
                      }
                      disabled={decisionMutation.isPending || !remarks.trim() || !rejectionReason.trim()}
                    >
                      Reject
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedLeadId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
