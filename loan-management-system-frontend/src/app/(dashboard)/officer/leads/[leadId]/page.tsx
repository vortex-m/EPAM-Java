"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useOfficerLeadDecisionMutation,
  useOfficerLeadQueueQuery,
} from "@/hooks/officer/useOfficerWorkflow";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

export default function OfficerLeadDetailPage() {
  const params = useParams<{ leadId: string }>();
  const leadId = Number(params.leadId ?? 0);
  const [remarks, setRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const leadQueueQuery = useOfficerLeadQueueQuery();
  const decisionMutation = useOfficerLeadDecisionMutation();

  const lead = useMemo(
    () => (leadQueueQuery.data ?? []).find((item) => item.leadId === leadId),
    [leadQueueQuery.data, leadId],
  );

  if (leadQueueQuery.isLoading) {
    return <Skeleton className="h-72" />;
  }

  if (!lead) {
    return (
      <Card>
        <CardContent className="p-4 text-sm">Lead not found in current queue.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-lg">Lead #{lead.leadId}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Lead Name</p>
            <p className="font-medium">{lead.leadName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="font-medium">{lead.phone}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Requested Amount</p>
            <p className="font-medium">{formatCurrency(lead.loanAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="font-medium">{formatDateTime(lead.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Lead Source</p>
            <p className="font-medium">{lead.leadSource}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Lead Score</p>
            <p className="font-medium">{lead.leadScore}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge variant="outline">{lead.leadStatus}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-base">Decision Form</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Lead review remarks"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">Rejection reason (required for reject)</Label>
            <Input
              id="rejectionReason"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Reason for rejection"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() =>
                decisionMutation.mutate({
                  leadId,
                  payload: {
                    decision: "APPROVED",
                    remarks,
                    rejectionReason: null,
                  },
                })
              }
              disabled={decisionMutation.isPending || !remarks.trim()}
            >
              Approve Lead
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                decisionMutation.mutate({
                  leadId,
                  payload: {
                    decision: "REJECTED",
                    remarks,
                    rejectionReason,
                  },
                })
              }
              disabled={decisionMutation.isPending || !remarks.trim() || !rejectionReason.trim()}
            >
              Reject Lead
            </Button>
            <Button asChild variant="outline">
              <Link href={`/officer/leads/${leadId}/convert`}>Convert to Application</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
