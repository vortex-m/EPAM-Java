"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLeadDetailsQuery, useUploadLeadKycMutation } from "@/hooks/agent/useAgentLeads";

function fileSizeLabel(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function AgentLeadKycUploadPage() {
  const searchParams = useSearchParams();
  const leadId = Number(searchParams.get("leadId") ?? "0");

  const leadQuery = useLeadDetailsQuery(leadId);
  const uploadMutation = useUploadLeadKycMutation();

  const [aadhaar, setAadhaar] = useState<File | null>(null);
  const [pan, setPan] = useState<File | null>(null);
  const [otherType, setOtherType] = useState("OTHER");
  const [otherFile, setOtherFile] = useState<File | null>(null);
  const [progress, setProgress] = useState({ aadhaar: 0, pan: 0, other: 0 });

  const upload = async (documentType: string, file: File, key: "aadhaar" | "pan" | "other") => {
    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("file", file);
    setProgress((p) => ({ ...p, [key]: 20 }));
    await uploadMutation.mutateAsync({ leadId, formData });
    setProgress((p) => ({ ...p, [key]: 100 }));
  };

  return (
    <Card className="py-0">
      <CardHeader className="border-b px-4 py-3"><CardTitle>Lead KYC Upload</CardTitle></CardHeader>
      <CardContent className="space-y-4 px-4 py-4">
        <p className="text-sm">Lead ID: {leadId}</p>
        {leadQuery.data?.aadhaarFileUrl ? <a className="text-xs text-primary underline" href={leadQuery.data.aadhaarFileUrl} target="_blank" rel="noreferrer">Existing Aadhaar File</a> : null}
        {leadQuery.data?.panFileUrl ? <a className="text-xs text-primary underline" href={leadQuery.data.panFileUrl} target="_blank" rel="noreferrer">Existing PAN File</a> : null}

        <div className="rounded-md border p-3 space-y-2">
          <Label>Aadhaar</Label>
          <Input type="file" accept="application/pdf,image/png,image/jpeg" onChange={(e) => setAadhaar(e.target.files?.[0] ?? null)} />
          {aadhaar ? <p className="text-xs">{aadhaar.name} ({fileSizeLabel(aadhaar.size)})</p> : null}
          <div className="h-2 rounded bg-muted"><div className="h-full bg-primary" style={{ width: `${progress.aadhaar}%` }} /></div>
          <Button disabled={!aadhaar || uploadMutation.isPending} onClick={() => aadhaar && upload("AADHAAR", aadhaar, "aadhaar")}>Upload Aadhaar</Button>
        </div>

        <div className="rounded-md border p-3 space-y-2">
          <Label>PAN</Label>
          <Input type="file" accept="application/pdf,image/png,image/jpeg" onChange={(e) => setPan(e.target.files?.[0] ?? null)} />
          {pan ? <p className="text-xs">{pan.name} ({fileSizeLabel(pan.size)})</p> : null}
          <div className="h-2 rounded bg-muted"><div className="h-full bg-primary" style={{ width: `${progress.pan}%` }} /></div>
          <Button disabled={!pan || uploadMutation.isPending} onClick={() => pan && upload("PAN", pan, "pan")}>Upload PAN</Button>
        </div>

        <div className="rounded-md border p-3 space-y-2">
          <Label>Other Document Type</Label>
          <Input value={otherType} onChange={(e) => setOtherType(e.target.value)} />
          <Input type="file" accept="application/pdf,image/png,image/jpeg" onChange={(e) => setOtherFile(e.target.files?.[0] ?? null)} />
          {otherFile ? <p className="text-xs">{otherFile.name} ({fileSizeLabel(otherFile.size)})</p> : null}
          <div className="h-2 rounded bg-muted"><div className="h-full bg-primary" style={{ width: `${progress.other}%` }} /></div>
          <Button disabled={!otherFile || uploadMutation.isPending} onClick={() => otherFile && upload(otherType, otherFile, "other")}>Upload Other</Button>
        </div>

        <Button asChild variant="outline"><Link href={`/agent/leads/consent?leadId=${leadId}`}>Next: Capture Consent</Link></Button>
      </CardContent>
    </Card>
  );
}
