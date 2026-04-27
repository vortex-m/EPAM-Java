"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, IndianRupee, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useApplyLoanMutation, useUploadBankProofMutation } from "@/hooks/user/useUserLoans";
import { formatFileSize, formatMoney } from "@/lib/user-ui";
import type { ApplyLoanRequest } from "@/types/user.types";

const steps = ["Loan Details", "Disbursal Info", "Review & Submit"] as const;
const tenureOptions = [3, 6, 9, 12, 18, 24, 36];

type FormState = {
  requestedAmount: string;
  tenureMonths: string;
  loanPurpose: string;
  loanPurposeDescription: string;
  userRemarks: string;
  disbursalMode: "BANK_TRANSFER" | "CASH";
  disbursalBankName: string;
  disbursalBankAccount: string;
  disbursalIfscCode: string;
  disbursalBankProofUrl: string;
  disbursalBankProofFileName: string;
};

function getInitialForm(): FormState {
  return {
    requestedAmount: "",
    tenureMonths: "6",
    loanPurpose: "",
    loanPurposeDescription: "",
    userRemarks: "",
    disbursalMode: "CASH",
    disbursalBankName: "",
    disbursalBankAccount: "",
    disbursalIfscCode: "",
    disbursalBankProofUrl: "",
    disbursalBankProofFileName: "",
  };
}

function validateStep(step: number, form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 1) {
    if (!form.requestedAmount || Number(form.requestedAmount) <= 0) errors.requestedAmount = "Requested amount is required.";
    if (!form.tenureMonths) errors.tenureMonths = "Tenure is required.";
    if (!form.loanPurpose.trim()) errors.loanPurpose = "Loan purpose is required.";
    if (!form.loanPurposeDescription.trim()) errors.loanPurposeDescription = "Purpose description is required.";
    if (!form.userRemarks.trim()) errors.userRemarks = "Remarks are required.";
  }

  if (step === 2 && form.disbursalMode === "BANK_TRANSFER") {
    if (!form.disbursalBankName.trim()) errors.disbursalBankName = "Bank name is required.";
    if (!form.disbursalBankAccount.trim()) errors.disbursalBankAccount = "Bank account is required.";
    if (!form.disbursalIfscCode.trim()) errors.disbursalIfscCode = "IFSC code is required.";
    if (!form.disbursalBankProofUrl) errors.disbursalBankProofUrl = "Please upload bank proof before proceeding.";
  }

  return errors;
}

export default function UserApplyLoanPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormState>(getInitialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bankProofFile, setBankProofFile] = useState<File | null>(null);

  const uploadBankProofMutation = useUploadBankProofMutation();
  const applyLoanMutation = useApplyLoanMutation();

  const setField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const uploadBankProof = async () => {
    if (!bankProofFile) {
      setErrors((current) => ({ ...current, disbursalBankProofUrl: "Select a bank proof file first." }));
      return;
    }

    const uploadResponse = await uploadBankProofMutation.mutateAsync(bankProofFile);

    setForm((current) => ({
      ...current,
      disbursalBankProofUrl: uploadResponse.fileUrl ?? uploadResponse.url ?? uploadResponse.path ?? "",
      disbursalBankProofFileName: uploadResponse.fileName ?? uploadResponse.originalFileName ?? bankProofFile.name,
    }));
  };

  const moveNext = () => {
    const validationErrors = validateStep(currentStep, form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setCurrentStep((step) => Math.min(3, step + 1));
  };

  const moveBack = () => {
    setCurrentStep((step) => Math.max(1, step - 1));
  };

  const submitApplication = async () => {
    const validationErrors = {
      ...validateStep(1, form),
      ...validateStep(2, form),
    };
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload: ApplyLoanRequest = {
      requestedAmount: Number(form.requestedAmount),
      tenureMonths: Number(form.tenureMonths),
      loanPurpose: form.loanPurpose.trim(),
      loanPurposeDescription: form.loanPurposeDescription.trim(),
      userRemarks: form.userRemarks.trim(),
      disbursalMode: form.disbursalMode,
      disbursalBankName: form.disbursalMode === "BANK_TRANSFER" ? form.disbursalBankName.trim() : undefined,
      disbursalBankAccount: form.disbursalMode === "BANK_TRANSFER" ? form.disbursalBankAccount.trim() : undefined,
      disbursalIfscCode: form.disbursalMode === "BANK_TRANSFER" ? form.disbursalIfscCode.trim().toUpperCase() : undefined,
      disbursalBankProofUrl: form.disbursalMode === "BANK_TRANSFER" ? form.disbursalBankProofUrl : undefined,
      disbursalBankProofFileName: form.disbursalMode === "BANK_TRANSFER" ? form.disbursalBankProofFileName : undefined,
    };

    await applyLoanMutation.mutateAsync(payload);
    router.push("/user/loans");
  };

  const stepProgress = useMemo(() => (currentStep / 3) * 100, [currentStep]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Apply Loan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Complete all 3 steps to submit your loan application.</p>
      </div>

      <Card className="py-0">
        <CardContent className="space-y-3 px-4 py-4">
          <div className="h-2 overflow-hidden rounded bg-slate-200">
            <div className="h-full bg-primary transition-all" style={{ width: `${stepProgress}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {steps.map((step, index) => {
              const isActive = currentStep === index + 1;
              const isDone = currentStep > index + 1;

              return (
                <div key={step} className="flex items-center gap-1 text-muted-foreground">
                  {isDone ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <span className="font-semibold">{index + 1}.</span>}
                  <span className={isActive ? "font-semibold text-foreground" : ""}>{step}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle>{steps[currentStep - 1]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 py-4">
          {uploadBankProofMutation.isPending ? <Skeleton className="h-2 w-full" /> : null}

          {currentStep === 1 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="requestedAmount">Requested Amount</Label>
                <Input
                  id="requestedAmount"
                  type="number"
                  value={form.requestedAmount}
                  onChange={(event) => setField("requestedAmount", event.target.value)}
                />
                {errors.requestedAmount ? <p className="text-xs text-destructive">{errors.requestedAmount}</p> : null}
              </div>

              <div className="space-y-2">
                <Label>Tenure (Months)</Label>
                <Select value={form.tenureMonths} onValueChange={(value) => setField("tenureMonths", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select tenure" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenureOptions.map((months) => (
                      <SelectItem key={months} value={String(months)}>
                        {months}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tenureMonths ? <p className="text-xs text-destructive">{errors.tenureMonths}</p> : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="loanPurpose">Loan Purpose</Label>
                <Input id="loanPurpose" value={form.loanPurpose} onChange={(event) => setField("loanPurpose", event.target.value)} />
                {errors.loanPurpose ? <p className="text-xs text-destructive">{errors.loanPurpose}</p> : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="loanPurposeDescription">Purpose Description</Label>
                <Textarea
                  id="loanPurposeDescription"
                  value={form.loanPurposeDescription}
                  onChange={(event) => setField("loanPurposeDescription", event.target.value)}
                />
                {errors.loanPurposeDescription ? <p className="text-xs text-destructive">{errors.loanPurposeDescription}</p> : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="userRemarks">User Remarks</Label>
                <Textarea id="userRemarks" value={form.userRemarks} onChange={(event) => setField("userRemarks", event.target.value)} />
                {errors.userRemarks ? <p className="text-xs text-destructive">{errors.userRemarks}</p> : null}
              </div>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Disbursal Mode</Label>
                <Select value={form.disbursalMode} onValueChange={(value) => setField("disbursalMode", value as "BANK_TRANSFER" | "CASH")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK_TRANSFER">BANK_TRANSFER</SelectItem>
                    <SelectItem value="CASH">CASH</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.disbursalMode === "BANK_TRANSFER" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="disbursalBankName">Bank Name</Label>
                    <Input
                      id="disbursalBankName"
                      value={form.disbursalBankName}
                      onChange={(event) => setField("disbursalBankName", event.target.value)}
                    />
                    {errors.disbursalBankName ? <p className="text-xs text-destructive">{errors.disbursalBankName}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="disbursalBankAccount">Bank Account</Label>
                    <Input
                      id="disbursalBankAccount"
                      value={form.disbursalBankAccount}
                      onChange={(event) => setField("disbursalBankAccount", event.target.value)}
                    />
                    {errors.disbursalBankAccount ? <p className="text-xs text-destructive">{errors.disbursalBankAccount}</p> : null}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="disbursalIfscCode">IFSC Code</Label>
                    <Input
                      id="disbursalIfscCode"
                      value={form.disbursalIfscCode}
                      onChange={(event) => setField("disbursalIfscCode", event.target.value.toUpperCase())}
                    />
                    {errors.disbursalIfscCode ? <p className="text-xs text-destructive">{errors.disbursalIfscCode}</p> : null}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bankProof">Bank Proof (PDF/JPG/PNG)</Label>
                    <Input
                      id="bankProof"
                      type="file"
                      accept="application/pdf,image/png,image/jpeg"
                      onChange={(event) => setBankProofFile(event.target.files?.[0] ?? null)}
                    />
                    {bankProofFile ? (
                      <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate">{bankProofFile.name}</p>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setBankProofFile(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="mt-1">{formatFileSize(bankProofFile.size)}</p>
                        {uploadBankProofMutation.isPending ? (
                          <div className="mt-2 h-2 overflow-hidden rounded bg-slate-200">
                            <div className="h-full w-4/5 animate-pulse bg-primary" />
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" onClick={uploadBankProof} disabled={!bankProofFile || uploadBankProofMutation.isPending}>
                        <Upload className="mr-1 h-4 w-4" />
                        {uploadBankProofMutation.isPending ? "Uploading..." : "Upload Bank Proof"}
                      </Button>
                      {form.disbursalBankProofUrl ? (
                        <p className="text-xs text-green-700">Uploaded: {form.disbursalBankProofFileName || "Bank proof"}</p>
                      ) : null}
                    </div>
                    {errors.disbursalBankProofUrl ? <p className="text-xs text-destructive">{errors.disbursalBankProofUrl}</p> : null}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  Cash disbursal selected. Bank details and proof upload are not required.
                </div>
              )}
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="font-semibold text-foreground">Review Summary</p>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <p>Requested Amount: {formatMoney(Number(form.requestedAmount || 0))}</p>
                  <p>Tenure: {form.tenureMonths} months</p>
                  <p>Purpose: {form.loanPurpose || "-"}</p>
                  <p>Mode: {form.disbursalMode}</p>
                  <p className="md:col-span-2">Purpose Description: {form.loanPurposeDescription || "-"}</p>
                  <p className="md:col-span-2">Remarks: {form.userRemarks || "-"}</p>
                  {form.disbursalMode === "BANK_TRANSFER" ? (
                    <>
                      <p>Bank Name: {form.disbursalBankName || "-"}</p>
                      <p>Bank Account: {form.disbursalBankAccount || "-"}</p>
                      <p>IFSC: {form.disbursalIfscCode || "-"}</p>
                      <p className="md:col-span-2">Proof: {form.disbursalBankProofFileName || "Not uploaded"}</p>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={moveBack}>
                Back
              </Button>
            ) : null}

            {currentStep < 3 ? (
              <Button type="button" onClick={moveNext}>
                Next
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={submitApplication} disabled={applyLoanMutation.isPending}>
                <IndianRupee className="mr-1 h-4 w-4" />
                {applyLoanMutation.isPending ? "Submitting..." : "Submit Loan Application"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
