"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { userApi } from "@/api/endpoints/user.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SectionContainer } from "@/components/user/SectionContainer";
import { useApplyLoan } from "@/hooks/useLoan";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

const loanApplicationSchema = z
  .object({
    requestedAmount: z.number().min(1000, "Minimum amount is INR 1,000").max(200000, "Maximum amount is INR 2,00,000"),
    tenureMonths: z.number().min(1, "Tenure is required"),
    loanPurpose: z.string().min(2, "Loan purpose is required"),
    loanPurposeDescription: z.string().optional(),
    userRemarks: z.string().min(3, "Remarks are required"),
    disbursalMode: z.enum(["BANK_TRANSFER", "CASH"]),
    disbursalBankName: z.string().optional(),
    disbursalBankAccount: z.string().optional(),
    disbursalIfscCode: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (value.disbursalMode !== "BANK_TRANSFER") return;

    if (!value.disbursalBankName) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["disbursalBankName"],
        message: "Bank name is required for bank transfer disbursal.",
      });
    }

    if (!value.disbursalBankAccount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["disbursalBankAccount"],
        message: "Bank account number is required for bank transfer disbursal.",
      });
    }

    if (!value.disbursalIfscCode) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["disbursalIfscCode"],
        message: "IFSC code is required for bank transfer disbursal.",
      });
    }
  });

type LoanApplicationForm = z.infer<typeof loanApplicationSchema>;

const tenureOptions = [6, 9, 12, 18, 24, 36];

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null) return fallback;
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message ?? err.message ?? fallback;
}

export default function LoanApplyPage() {
  const [bankProofFile, setBankProofFile] = useState<File | null>(null);
  const [submission, setSubmission] = useState<{
    applicationNumber: string;
    status: string;
    appliedAt?: string;
  } | null>(null);

  const applyLoanMutation = useApplyLoan();

  const form = useForm<LoanApplicationForm>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      requestedAmount: 20000,
      tenureMonths: 12,
      loanPurpose: "",
      loanPurposeDescription: "",
      userRemarks: "",
      disbursalMode: "CASH",
      disbursalBankName: "",
      disbursalBankAccount: "",
      disbursalIfscCode: "",
    },
  });

  const disbursalMode = useWatch({ control: form.control, name: "disbursalMode" });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      let disbursalBankProofUrl: string | undefined;
      let disbursalBankProofFileName: string | undefined;

      if (values.disbursalMode === "BANK_TRANSFER" && bankProofFile) {
        const proofForm = new FormData();
        proofForm.append("file", bankProofFile);

        const uploadResponse = await userApi.uploadBankProof(proofForm);
        const uploadData = uploadResponse.data?.data ?? {};

        disbursalBankProofUrl =
          uploadData.fileUrl ?? uploadData.url ?? uploadData.path ?? undefined;
        disbursalBankProofFileName =
          uploadData.fileName ?? uploadData.originalFileName ?? bankProofFile.name;
      }

      const response = await applyLoanMutation.mutateAsync({
        requestedAmount: values.requestedAmount,
        tenureMonths: values.tenureMonths,
        loanPurpose: values.loanPurpose,
        loanPurposeDescription: values.loanPurposeDescription || undefined,
        userRemarks: values.userRemarks,
        disbursalMode: values.disbursalMode,
        disbursalBankName: values.disbursalBankName || undefined,
        disbursalBankAccount: values.disbursalBankAccount || undefined,
        disbursalIfscCode: values.disbursalIfscCode || undefined,
        disbursalBankProofUrl,
        disbursalBankProofFileName,
      });

      setSubmission({
        applicationNumber: response.data?.applicationNumber ?? "-",
        status: response.data?.status ?? "PENDING",
        appliedAt: response.data?.appliedAt,
      });
      toast.success(response.message ?? "Loan application submitted.");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Unable to submit loan application."));
    }
  });

  if (submission) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <SectionContainer title="Application submitted" description="Your request is now in the review workflow.">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="py-0">
              <CardContent className="space-y-1 px-4 py-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Application Number</p>
                <p className="text-lg font-semibold text-foreground">{submission.applicationNumber}</p>
              </CardContent>
            </Card>
            <Card className="py-0">
              <CardContent className="space-y-1 px-4 py-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Current Status</p>
                <p className="text-lg font-semibold text-foreground">{submission.status}</p>
              </CardContent>
            </Card>
            <Card className="py-0">
              <CardContent className="space-y-1 px-4 py-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Applied At</p>
                <p className="text-lg font-semibold text-foreground">{formatDateTime(submission.appliedAt)}</p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/user/loans">Go to My Loans</Link>
            </Button>
            <Button variant="outline" onClick={() => setSubmission(null)}>
              Submit another
            </Button>
          </div>
        </SectionContainer>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Apply for Loan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit your application and track status: PENDING → UNDER REVIEW → APPROVED → DISBURSED.
        </p>
      </div>

      <form className="space-y-6" onSubmit={onSubmit}>
        <SectionContainer title="Loan request" description="Enter requested amount and tenure.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="requestedAmount">Requested amount</Label>
              <Input id="requestedAmount" type="number" {...form.register("requestedAmount", { valueAsNumber: true })} />
              <p className="text-xs text-muted-foreground">Allowed range: {formatCurrency(1000)} to {formatCurrency(200000)}</p>
              <p className="text-xs text-destructive">{form.formState.errors.requestedAmount?.message}</p>
            </div>

            <div className="space-y-2">
              <Label>Tenure (months)</Label>
              <Controller
                control={form.control}
                name="tenureMonths"
                render={({ field }) => (
                  <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select tenure" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenureOptions.map((months) => (
                        <SelectItem key={months} value={String(months)}>
                          {months} months
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-destructive">{form.formState.errors.tenureMonths?.message}</p>
            </div>
          </div>
        </SectionContainer>

        <SectionContainer title="Purpose and remarks" description="Tell the reviewer why this loan is needed.">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loanPurpose">Loan purpose</Label>
              <Input id="loanPurpose" {...form.register("loanPurpose")} placeholder="Livestock, shop inventory, farm equipment..." />
              <p className="text-xs text-destructive">{form.formState.errors.loanPurpose?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanPurposeDescription">Purpose description (optional)</Label>
              <Textarea id="loanPurposeDescription" {...form.register("loanPurposeDescription")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userRemarks">User remarks</Label>
              <Textarea id="userRemarks" {...form.register("userRemarks")} />
              <p className="text-xs text-destructive">{form.formState.errors.userRemarks?.message}</p>
            </div>
          </div>
        </SectionContainer>

        <SectionContainer title="Disbursal mode" description="For CASH mode, agent OTP verification completes disbursal.">
          <div className="space-y-4">
            <Controller
              control={form.control}
              name="disbursalMode"
              render={({ field }) => (
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 text-sm">
                    <input
                      type="radio"
                      value="BANK_TRANSFER"
                      checked={field.value === "BANK_TRANSFER"}
                      onChange={(event) => field.onChange(event.target.value)}
                    />
                    BANK_TRANSFER
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 text-sm">
                    <input
                      type="radio"
                      value="CASH"
                      checked={field.value === "CASH"}
                      onChange={(event) => field.onChange(event.target.value)}
                    />
                    CASH
                  </label>
                </div>
              )}
            />

            {disbursalMode === "BANK_TRANSFER" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="disbursalBankName">Bank name</Label>
                  <Input id="disbursalBankName" {...form.register("disbursalBankName")} />
                  <p className="text-xs text-destructive">{form.formState.errors.disbursalBankName?.message}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disbursalBankAccount">Bank account</Label>
                  <Input id="disbursalBankAccount" {...form.register("disbursalBankAccount")} />
                  <p className="text-xs text-destructive">{form.formState.errors.disbursalBankAccount?.message}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disbursalIfscCode">IFSC code</Label>
                  <Input id="disbursalIfscCode" {...form.register("disbursalIfscCode")} />
                  <p className="text-xs text-destructive">{form.formState.errors.disbursalIfscCode?.message}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankProof">Bank proof upload (optional)</Label>
                  <Input
                    id="bankProof"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(event) => setBankProofFile(event.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
            ) : (
              <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                CASH disbursal is completed through agent OTP verification after approval.
              </p>
            )}
          </div>
        </SectionContainer>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={applyLoanMutation.isPending}>
            {applyLoanMutation.isPending ? "Submitting..." : "Submit Application"}
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
