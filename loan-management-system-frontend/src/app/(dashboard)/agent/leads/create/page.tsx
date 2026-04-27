"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateLeadMutation } from "@/hooks/agent/useAgentLeads";
import { ConsentMode } from "@/types/agent.types";

const schema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(8),
  guardianPhone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  village: z.string().optional(),
  address: z.string().min(4),
  branchCode: z.string().min(2),
  consentMode: z.enum([ConsentMode.SELF_OTP, ConsentMode.WITNESS, ConsentMode.AGENT_ASSISTED]),
  consentText: z.string().min(3),
});

export default function AgentCreateLeadPage() {
  const router = useRouter();
  const createMutation = useCreateLeadMutation();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    guardianPhone: "",
    email: "",
    village: "",
    address: "",
    branchCode: "",
    consentMode: ConsentMode.SELF_OTP,
    consentText: "",
  });
  const [error, setError] = useState("");

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid fields");
      return;
    }
    setError("");
    const result = await createMutation.mutateAsync(parsed.data);
    const leadId = result.data.leadId;
    router.push(`/agent/leads/${leadId}`);
  };

  return (
    <Card className="py-0">
      <CardHeader className="border-b px-4 py-3"><CardTitle>Create Lead</CardTitle></CardHeader>
      <CardContent className="space-y-3 px-4 py-4">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["fullName", "Full Name"],
            ["phone", "Phone"],
            ["guardianPhone", "Guardian Phone"],
            ["email", "Email"],
            ["village", "Village"],
            ["branchCode", "Branch Code"],
          ].map(([field, label]) => (
            <div key={field} className="space-y-2">
              <Label>{label}</Label>
              <Input value={form[field as keyof typeof form] as string} onChange={(e) => setForm((s) => ({ ...s, [field]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Label>Address</Label>
          <Textarea value={form.address} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Consent Mode</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: ConsentMode.SELF_OTP, label: "Self OTP" },
              { value: ConsentMode.WITNESS, label: "Witness" },
              { value: ConsentMode.AGENT_ASSISTED, label: "Agent Assisted" },
            ].map((mode) => (
              <Button key={mode.value} size="sm" variant={form.consentMode === mode.value ? "default" : "outline"} onClick={() => setForm((s) => ({ ...s, consentMode: mode.value }))}>{mode.label}</Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Consent Text</Label>
          <Textarea value={form.consentText} onChange={(e) => setForm((s) => ({ ...s, consentText: e.target.value }))} />
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <Button onClick={submit} disabled={createMutation.isPending}>{createMutation.isPending ? "Creating..." : "Create Lead"}</Button>
      </CardContent>
    </Card>
  );
}
