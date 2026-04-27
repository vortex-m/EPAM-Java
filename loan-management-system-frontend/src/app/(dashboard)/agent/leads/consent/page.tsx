"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { FileCheck2, Mic, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCaptureConsentMutation } from "@/hooks/agent/useAgentLeads";
import { ConsentMode } from "@/types/agent.types";

const schema = z.object({
  consentMode: z.enum([ConsentMode.SELF_OTP, ConsentMode.WITNESS, ConsentMode.AGENT_ASSISTED]),
  consentText: z.string().min(3),
  consentProofUrl: z.string().optional(),
  witnessName: z.string().optional(),
  witnessPhone: z.string().optional(),
});

export default function AgentLeadConsentPage() {
  const searchParams = useSearchParams();
  const leadId = Number(searchParams.get("leadId") ?? "0");

  const mutation = useCaptureConsentMutation();

  const [form, setForm] = useState({
    consentMode: ConsentMode.SELF_OTP,
    consentText: "",
    consentProofUrl: "",
    witnessName: "",
    witnessPhone: "",
  });
  const [error, setError] = useState("");

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid fields");
      return;
    }
    setError("");
    await mutation.mutateAsync({ leadId, payload: parsed.data });
  };

  return (
    <Card className="py-0">
      <CardHeader className="border-b px-4 py-3"><CardTitle>Capture Consent</CardTitle></CardHeader>
      <CardContent className="space-y-3 px-4 py-4">
        <div className="grid gap-2 md:grid-cols-3">
          {[
            { value: ConsentMode.SELF_OTP, label: "Self OTP", Icon: Smartphone },
            { value: ConsentMode.WITNESS, label: "Witness", Icon: FileCheck2 },
            { value: ConsentMode.AGENT_ASSISTED, label: "Agent Assisted", Icon: Mic },
          ].map(({ value, label, Icon }) => (
            <Button key={value} variant={form.consentMode === value ? "default" : "outline"} onClick={() => setForm((s) => ({ ...s, consentMode: value }))}>
              <Icon className="size-4" /> {label}
            </Button>
          ))}
        </div>
        <Textarea value={form.consentText} onChange={(e) => setForm((s) => ({ ...s, consentText: e.target.value }))} placeholder="Consent text" />
        <Input value={form.consentProofUrl} onChange={(e) => setForm((s) => ({ ...s, consentProofUrl: e.target.value }))} placeholder="Consent proof URL (optional)" />
        <div className="grid gap-2 md:grid-cols-2">
          <div className="space-y-2"><Label>Witness Name</Label><Input value={form.witnessName} onChange={(e) => setForm((s) => ({ ...s, witnessName: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Witness Phone</Label><Input value={form.witnessPhone} onChange={(e) => setForm((s) => ({ ...s, witnessPhone: e.target.value }))} /></div>
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <Button onClick={submit} disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Capture Consent"}</Button>
        <Button asChild variant="outline"><Link href={`/agent/leads/loan-draft?leadId=${leadId}`}>Next: Create Loan Draft</Link></Button>
      </CardContent>
    </Card>
  );
}
