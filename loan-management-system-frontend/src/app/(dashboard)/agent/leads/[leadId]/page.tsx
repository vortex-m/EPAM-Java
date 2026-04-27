"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useLeadDetailsQuery, useUpdateLeadProfileMutation } from "@/hooks/agent/useAgentLeads";
import { LeadStatus } from "@/types/agent.types";

export default function AgentLeadDetailsPage() {
  const params = useParams<{ leadId: string }>();
  const leadId = Number(params?.leadId ?? "0");

  const leadQuery = useLeadDetailsQuery(leadId);
  const updateMutation = useUpdateLeadProfileMutation();

  const [form, setForm] = useState({
    fatherName: "",
    motherName: "",
    dateOfBirth: "",
    maritalStatus: "",
    occupation: "",
    monthlyIncome: "",
    address: "",
    village: "",
    city: "",
    state: "",
    pinCode: "",
    aadhaarNumber: "",
    panNumber: "",
  });

  if (leadQuery.isLoading) return <Skeleton className="h-96" />;
  if (leadQuery.isError || !leadQuery.data) return <Card><CardContent className="p-4 text-sm text-destructive">Unable to load lead.</CardContent></Card>;

  const lead = leadQuery.data;
  const readOnly = [LeadStatus.SUBMITTED_TO_OFFICER, LeadStatus.CONVERTED_TO_USER, LeadStatus.REJECTED].includes(lead.status);

  const submit = async () => {
    await updateMutation.mutateAsync({
      leadId,
      payload: {
        fatherName: form.fatherName,
        motherName: form.motherName,
        dateOfBirth: form.dateOfBirth,
        maritalStatus: form.maritalStatus,
        occupation: form.occupation,
        monthlyIncome: Number(form.monthlyIncome || 0),
        address: form.address,
        village: form.village,
        city: form.city,
        state: form.state,
        pinCode: form.pinCode,
        aadhaarNumber: form.aadhaarNumber,
        panNumber: form.panNumber,
      },
    });
  };

  return (
    <div className="space-y-4">
      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3"><CardTitle>Lead #{lead.leadCode}</CardTitle></CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 md:grid-cols-2">
          <p>Name: {lead.fullName}</p>
          <p>Phone: {lead.phone}</p>
          <p>Status: {lead.status}</p>
          <p>Email: {lead.email ?? "-"}</p>
          {lead.officerRemarks ? <p className="md:col-span-2">Officer Remarks: {lead.officerRemarks}</p> : null}
          {lead.requestedAmount ? <p className="md:col-span-2">Loan Draft: ₹{lead.requestedAmount} / {lead.tenureMonths} months / {lead.loanPurpose ?? "-"}</p> : null}
        </CardContent>
      </Card>

      {readOnly ? (
        <Card><CardContent className="p-4 text-sm text-muted-foreground">Read-only record.</CardContent></Card>
      ) : (
        <Card className="py-0">
          <CardHeader className="border-b px-4 py-3"><CardTitle>Update Lead Profile</CardTitle></CardHeader>
          <CardContent className="space-y-3 px-4 py-4">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["fatherName", "Father Name"], ["motherName", "Mother Name"], ["dateOfBirth", "Date Of Birth"],
                ["maritalStatus", "Marital Status"], ["occupation", "Occupation"], ["monthlyIncome", "Monthly Income"],
                ["village", "Village"], ["city", "City"], ["state", "State"], ["pinCode", "Pin Code"],
                ["aadhaarNumber", "Aadhaar Number"], ["panNumber", "PAN Number"],
              ].map(([field, label]) => (
                <div key={field} className="space-y-2">
                  <Label>{label}</Label>
                  <Input value={form[field as keyof typeof form]} onChange={(e) => setForm((s) => ({ ...s, [field]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea value={form.address} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={submit} disabled={updateMutation.isPending}>{updateMutation.isPending ? "Saving..." : "Save Profile"}</Button>
              <Button asChild variant="outline"><Link href={`/agent/leads/kyc-upload?leadId=${leadId}`}>Next: Upload KYC</Link></Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
