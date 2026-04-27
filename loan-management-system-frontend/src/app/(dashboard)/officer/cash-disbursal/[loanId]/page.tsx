"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useOfficerCashDisbursalQueueQuery,
  useOfficerGenerateHandoverOtpMutation,
  useOfficerVerifyHandoverOtpMutation,
} from "@/hooks/officer/useOfficerWorkflow";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

export default function OfficerCashHandoverPage() {
  const params = useParams<{ loanId: string }>();
  const routeId = Number(params.loanId ?? 0);

  const [otp, setOtp] = useState("");

  const queueQuery = useOfficerCashDisbursalQueueQuery();
  const generateOtpMutation = useOfficerGenerateHandoverOtpMutation();
  const verifyOtpMutation = useOfficerVerifyHandoverOtpMutation();

  const item = useMemo(
    () =>
      (queueQuery.data ?? []).find(
        (entry) => entry.taskId === routeId || entry.loanApplicationId === routeId,
      ),
    [queueQuery.data, routeId],
  );

  if (queueQuery.isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (!item) {
    return (
      <Card>
        <CardContent className="p-4 text-sm">Cash disbursal task not found for this loan.</CardContent>
      </Card>
    );
  }

  const latestGenerate = generateOtpMutation.data?.data;
  const latestVerify = verifyOtpMutation.data?.data;

  return (
    <div className="space-y-5">
      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-lg">Cash Disbursal Handover</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-xs text-muted-foreground">Application</p><p className="font-medium">{item.applicationNumber}</p></div>
          <div><p className="text-xs text-muted-foreground">Applicant</p><p className="font-medium">{item.applicantName}</p></div>
          <div><p className="text-xs text-muted-foreground">Agent</p><p className="font-medium">{item.assignedAgentName}</p><p className="text-xs text-muted-foreground">{item.assignedAgentEmail}</p></div>
          <div><p className="text-xs text-muted-foreground">Loan Amount</p><p className="font-medium">{formatCurrency(item.loanAmount)}</p></div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-base">Stage 1: Officer to Agent Handover OTP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Current: {latestVerify?.otpStatus ?? latestGenerate?.otpStatus ?? item.otpStatus}</Badge>
            <Button
              onClick={() => generateOtpMutation.mutate({ taskId: item.taskId })}
              disabled={generateOtpMutation.isPending}
            >
              Generate Handover OTP
            </Button>
          </div>

          {latestGenerate ? (
            <Card className="border-sky-200 bg-sky-50 py-0">
              <CardContent className="px-4 py-3 text-sm text-sky-900">
                {latestGenerate.message}<br />
                Expires At: {formatDateTime(latestGenerate.expiresAt)}
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="agentOtp">Enter OTP Agent Provided</Label>
              <Input
                id="agentOtp"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                maxLength={6}
                placeholder="123456"
              />
            </div>
            <Button
              onClick={() => verifyOtpMutation.mutate({ taskId: item.taskId, otp })}
              disabled={verifyOtpMutation.isPending || otp.trim().length < 4}
            >
              Verify Agent OTP
            </Button>
          </div>

          {latestVerify ? (
            <Card className="border-emerald-200 bg-emerald-50 py-0">
              <CardContent className="px-4 py-3 text-sm text-emerald-900">
                {latestVerify.message}
                {latestVerify.verifiedAt ? (
                  <>
                    <br />Verified At: {formatDateTime(latestVerify.verifiedAt)}
                  </>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/officer/cash-disbursal">Back to Queue</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
