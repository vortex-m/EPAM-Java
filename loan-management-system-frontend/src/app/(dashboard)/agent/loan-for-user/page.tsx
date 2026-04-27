"use client";

import { useMemo, useState } from "react";
import { z } from "zod";

import { userApi } from "@/api/endpoints/user.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApplyLoanForUserMutation } from "@/hooks/agent/useAgentLoans";
import { formatIndianCurrency } from "@/lib/agent.utils";

const schema = z.object({
  userId: z.number().int().positive(),
  requestedAmount: z.number().min(1000).max(200000),
  tenureMonths: z.number().int().positive(),
  loanPurpose: z.string().min(2),
  loanPurposeDescription: z.string().optional(),
  userRemarks: z.string().min(2),
  disbursalMode: z.enum(["BANK_TRANSFER", "CASH"]),
  disbursalBankName: z.string().optional(),
  disbursalBankAccount: z.string().optional(),
  disbursalIfscCode: z.string().optional(),
  disbursalBankProofUrl: z.string().optional(),
  disbursalBankProofFileName: z.string().optional(),
});

export default function AgentLoanForUserPage() {
  const mutation = useApplyLoanForUserMutation();

  const [form, setForm] = useState({
    userId: "",
    requestedAmount: "",
    tenureMonths: "12",
    loanPurpose: "",
    loanPurposeDescription: "",
    userRemarks: "",
    disbursalMode: "CASH",
    disbursalBankName: "",
    disbursalBankAccount: "",
    disbursalIfscCode: "",
    disbursalBankProofUrl: "",
    disbursalBankProofFileName: "",
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const emiEstimate = useMemo(() => {
    const amount = Number(form.requestedAmount || 0);
    const months = Number(form.tenureMonths || 1);
    if (!amount || !months) return 0;
    return amount / months;
  }, [form.requestedAmount, form.tenureMonths]);

  const uploadProof = async () => {
    if (!proofFile) return;
    const response = await userApi.uploadBankProof(proofFile);
    const data = (response.data as { data?: { fileUrl?: string; url?: string; fileName?: string; originalFileName?: string } }).data;
    setForm((s) => ({
      ...s,
      disbursalBankProofUrl: data?.fileUrl ?? data?.url ?? "",
      disbursalBankProofFileName: data?.fileName ?? data?.originalFileName ?? proofFile.name,
    }));
  };

  const submit = async () => {
    const parsed = schema.safeParse({
      userId: Number(form.userId),
      requestedAmount: Number(form.requestedAmount),
      tenureMonths: Number(form.tenureMonths),
      loanPurpose: form.loanPurpose,
      loanPurposeDescription: form.loanPurposeDescription || undefined,
      userRemarks: form.userRemarks,
      disbursalMode: form.disbursalMode,
      disbursalBankName: form.disbursalBankName || undefined,
      disbursalBankAccount: form.disbursalBankAccount || undefined,
      disbursalIfscCode: form.disbursalIfscCode || undefined,
      disbursalBankProofUrl: form.disbursalBankProofUrl || undefined,
      disbursalBankProofFileName: form.disbursalBankProofFileName || undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid fields");
      return;
    }

    setError("");
    await mutation.mutateAsync(parsed.data);
  };

  return (
    <Card className="py-0">
      <CardHeader className="border-b px-4 py-3"><CardTitle>Apply Loan for Existing User</CardTitle></CardHeader>
      <CardContent className="space-y-3 px-4 py-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2"><Label>User ID</Label><Input type="number" value={form.userId} onChange={(e) => setForm((s) => ({ ...s, userId: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Requested Amount</Label><Input type="number" value={form.requestedAmount} onChange={(e) => setForm((s) => ({ ...s, requestedAmount: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Tenure (Months)</Label><Input type="number" value={form.tenureMonths} onChange={(e) => setForm((s) => ({ ...s, tenureMonths: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Loan Purpose</Label><Input value={form.loanPurpose} onChange={(e) => setForm((s) => ({ ...s, loanPurpose: e.target.value }))} /></div>
        </div>
        <Textarea placeholder="Loan purpose description" value={form.loanPurposeDescription} onChange={(e) => setForm((s) => ({ ...s, loanPurposeDescription: e.target.value }))} />
        <Textarea placeholder="User remarks" value={form.userRemarks} onChange={(e) => setForm((s) => ({ ...s, userRemarks: e.target.value }))} />
        <div className="flex gap-2">
          {[
            ["BANK_TRANSFER", "Bank Transfer"],
            ["CASH", "Cash"],
          ].map(([value, label]) => (
            <Button key={value} variant={form.disbursalMode === value ? "default" : "outline"} onClick={() => setForm((s) => ({ ...s, disbursalMode: value }))}>{label}</Button>
          ))}
        </div>
        {form.disbursalMode === "BANK_TRANSFER" ? (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <Input value={form.disbursalBankName} onChange={(e) => setForm((s) => ({ ...s, disbursalBankName: e.target.value }))} placeholder="Bank Name" />
              <Input value={form.disbursalBankAccount} onChange={(e) => setForm((s) => ({ ...s, disbursalBankAccount: e.target.value }))} placeholder="Bank Account" />
              <Input value={form.disbursalIfscCode} onChange={(e) => setForm((s) => ({ ...s, disbursalIfscCode: e.target.value }))} placeholder="IFSC" />
            </div>
            <div className="space-y-2">
              <Label>Bank Proof</Label>
              <Input type="file" accept="application/pdf,image/png,image/jpeg" onChange={(e) => setProofFile(e.target.files?.[0] ?? null)} />
              {proofFile ? <p className="text-xs">{proofFile.name}</p> : null}
              <Button variant="outline" onClick={uploadProof} disabled={!proofFile}>Upload Proof</Button>
              {form.disbursalBankProofFileName ? <p className="text-xs text-emerald-700">Uploaded: {form.disbursalBankProofFileName}</p> : null}
            </div>
          </>
        ) : null}
        <p className="text-sm text-muted-foreground">Approx EMI: {formatIndianCurrency(emiEstimate)}/month</p>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <Button onClick={submit} disabled={mutation.isPending}>{mutation.isPending ? "Submitting..." : "Apply Loan For User"}</Button>

        {mutation.data?.data ? (
          <Card>
            <CardContent className="space-y-2 p-4">
              <p>Application Number: {mutation.data.data.applicationNumber}</p>
              <p>Origin Channel: {mutation.data.data.originChannel}</p>
              <p>Status: {mutation.data.data.status}</p>
            </CardContent>
          </Card>
        ) : null}
      </CardContent>
    </Card>
  );
}
