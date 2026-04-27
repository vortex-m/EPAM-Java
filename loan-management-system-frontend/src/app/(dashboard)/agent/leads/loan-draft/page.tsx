"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateLoanDraftMutation, useLeadDetailsQuery } from "@/hooks/agent/useAgentLeads";
import { formatIndianCurrency } from "@/lib/agent.utils";

const schema = z.object({
  requestedAmount: z.number().min(1000).max(200000),
  tenureMonths: z.number().int().positive(),
  loanPurpose: z.string().min(2),
  disbursalMode: z.enum(["BANK_TRANSFER", "CASH"]),
  disbursalBankName: z.string().optional(),
  disbursalBankAccount: z.string().optional(),
  disbursalIfscCode: z.string().optional(),
});

export default function AgentLeadLoanDraftPage() {
  const searchParams = useSearchParams();
  const leadId = Number(searchParams.get("leadId") ?? "0");

  const leadQuery = useLeadDetailsQuery(leadId);
  const mutation = useCreateLoanDraftMutation();

  const [form, setForm] = useState({
    requestedAmount: "",
    tenureMonths: "12",
    loanPurpose: "",
    disbursalMode: "CASH",
    disbursalBankName: "",
    disbursalBankAccount: "",
    disbursalIfscCode: "",
  });
  const [error, setError] = useState("");

  const emiEstimate = useMemo(() => {
    const amount = Number(form.requestedAmount || 0);
    const months = Number(form.tenureMonths || 1);
    if (!amount || !months) return 0;
    return amount / months;
  }, [form.requestedAmount, form.tenureMonths]);

  const submit = async () => {
    const parsed = schema.safeParse({
      requestedAmount: Number(form.requestedAmount),
      tenureMonths: Number(form.tenureMonths),
      loanPurpose: form.loanPurpose,
      disbursalMode: form.disbursalMode,
      disbursalBankName: form.disbursalBankName || undefined,
      disbursalBankAccount: form.disbursalBankAccount || undefined,
      disbursalIfscCode: form.disbursalIfscCode || undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid fields");
      return;
    }

    setError("");
    await mutation.mutateAsync({ leadId, payload: parsed.data });
  };

  return (
    <Card className="py-0">
      <CardHeader className="border-b px-4 py-3"><CardTitle>Create Loan Draft</CardTitle></CardHeader>
      <CardContent className="space-y-3 px-4 py-4">
        <p className="text-sm">Lead: {leadQuery.data?.fullName ?? "-"} ({leadQuery.data?.phone ?? "-"})</p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2"><Label>Requested Amount</Label><Input type="number" value={form.requestedAmount} onChange={(e) => setForm((s) => ({ ...s, requestedAmount: e.target.value }))} /></div>
          <div className="space-y-2">
            <Label>Tenure (Months)</Label>
            <Select value={form.tenureMonths} onValueChange={(value) => setForm((s) => ({ ...s, tenureMonths: value }))}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{[3,6,9,12,18,24,36].map((m) => <SelectItem key={m} value={String(m)}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <Input value={form.loanPurpose} onChange={(e) => setForm((s) => ({ ...s, loanPurpose: e.target.value }))} placeholder="Loan purpose" />
        <div className="flex gap-2">
          {[
            ["BANK_TRANSFER", "Bank Transfer"],
            ["CASH", "Cash"],
          ].map(([value, label]) => (
            <Button key={value} variant={form.disbursalMode === value ? "default" : "outline"} onClick={() => setForm((s) => ({ ...s, disbursalMode: value }))}>{label}</Button>
          ))}
        </div>
        {form.disbursalMode === "BANK_TRANSFER" ? (
          <div className="grid gap-3 md:grid-cols-3">
            <Input value={form.disbursalBankName} onChange={(e) => setForm((s) => ({ ...s, disbursalBankName: e.target.value }))} placeholder="Bank Name" />
            <Input value={form.disbursalBankAccount} onChange={(e) => setForm((s) => ({ ...s, disbursalBankAccount: e.target.value }))} placeholder="Bank Account" />
            <Input value={form.disbursalIfscCode} onChange={(e) => setForm((s) => ({ ...s, disbursalIfscCode: e.target.value }))} placeholder="IFSC" />
          </div>
        ) : null}
        <p className="text-sm text-muted-foreground">Approx EMI: {formatIndianCurrency(emiEstimate)}/month</p>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <Button onClick={submit} disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Create Loan Draft"}</Button>
        <Button asChild variant="outline"><Link href={`/agent/leads/submit?leadId=${leadId}`}>Next: Submit to Officer</Link></Button>
      </CardContent>
    </Card>
  );
}
