"use client";

import Link from "next/link";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyLeadsQuery } from "@/hooks/agent/useAgentLeads";
import { formatDateDisplay, getLeadNextStepPath, getLeadStatusConfig } from "@/lib/agent.utils";

const stageLabels = [
  "NEW",
  "PROFILE_CAPTURED",
  "KYC_UPLOADED",
  "SUBMITTED_TO_OFFICER",
];

export default function AgentMyLeadsPage() {
  const leadsQuery = useMyLeadsQuery();
  const leads = leadsQuery.data ?? [];

  if (leadsQuery.isLoading) return <Skeleton className="h-96" />;
  if (leadsQuery.isError) return <Card><CardContent className="p-4 text-sm text-destructive">Unable to load leads.</CardContent></Card>;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border bg-card p-3">
        <div className="flex min-w-max items-center gap-2 text-xs">
          {stageLabels.map((stage) => (
            <div key={stage} className="rounded-full border px-3 py-1">{stage.replaceAll("_", " ")}</div>
          ))}
        </div>
      </div>

      {leads.length === 0 ? (
        <EmptyState title="No leads yet" description="Create your first lead to start the assisted workflow." action={<Button asChild><Link href="/agent/leads/create">Create Lead</Link></Button>} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {leads.map((lead) => {
            const status = getLeadStatusConfig(lead.status);
            return (
              <Card key={lead.leadId} className="py-0">
                <CardContent className="space-y-3 px-4 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="font-mono">{lead.leadCode}</Badge>
                    <Badge className={status.color}>{status.label}</Badge>
                  </div>
                  <p className="text-sm font-medium">{lead.fullName}</p>
                  <p className="text-sm text-muted-foreground">{lead.phone}</p>
                  <p className="text-xs text-muted-foreground">Created: {formatDateDisplay(lead.createdAt)}</p>
                  <p className="text-xs text-muted-foreground">Updated: {formatDateDisplay(lead.updatedAt)}</p>
                  <Button asChild><Link href={getLeadNextStepPath(lead.leadId, lead.status)}>Continue</Link></Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
