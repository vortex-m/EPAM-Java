"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useLeadDetailsQuery, useSubmitToOfficerMutation } from "@/hooks/agent/useAgentLeads";

export default function AgentLeadSubmitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = Number(searchParams.get("leadId") ?? "0");

  const leadQuery = useLeadDetailsQuery(leadId);
  const submitMutation = useSubmitToOfficerMutation();

  const [officerUserId, setOfficerUserId] = useState("");
  const [remarks, setRemarks] = useState("");

  if (leadQuery.isLoading) return <Skeleton className="h-96" />;
  if (leadQuery.isError || !leadQuery.data) return <Card><CardContent className="p-4 text-sm text-destructive">Unable to load lead summary.</CardContent></Card>;

  const lead = leadQuery.data;

  const submit = async () => {
    await submitMutation.mutateAsync({
      leadId,
      payload: {
        officerUserId: officerUserId ? Number(officerUserId) : undefined,
        remarks: remarks || undefined,
      },
    });
    router.push("/agent/leads/mine");
  };

  return (
    <Card className="py-0">
      <CardHeader className="border-b px-4 py-3"><CardTitle>Submit Lead to Officer</CardTitle></CardHeader>
      <CardContent className="space-y-3 px-4 py-4">
        <div className="grid gap-3 md:grid-cols-2">
          <p>Name: {lead.fullName}</p>
          <p>Phone: {lead.phone}</p>
          <p>Status: {lead.status}</p>
          <p>Loan Draft: {lead.requestedAmount ? `${lead.requestedAmount} / ${lead.tenureMonths} months` : "-"}</p>
          <p>KYC Aadhaar: {lead.aadhaarFileUrl ? "Uploaded" : "Missing"}</p>
          <p>KYC PAN: {lead.panFileUrl ? "Uploaded" : "Missing"}</p>
        </div>
        <div className="space-y-2">
          <Label>Officer User ID (optional)</Label>
          <Input type="number" value={officerUserId} onChange={(e) => setOfficerUserId(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Remarks</Label>
          <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </div>
        <Button onClick={submit} disabled={submitMutation.isPending}>{submitMutation.isPending ? "Submitting..." : "Submit to Officer"}</Button>
      </CardContent>
    </Card>
  );
}
