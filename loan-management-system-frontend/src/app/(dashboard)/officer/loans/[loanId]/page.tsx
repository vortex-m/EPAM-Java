"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useOfficerAssignableAgentsQuery,
  useOfficerAssignAgentMutation,
  useOfficerLoanDecisionMutation,
  useOfficerLoanEvidenceQuery,
  useOfficerLoanProfileQuery,
  useOfficerPendingLoansQuery,
} from "@/hooks/officer/useOfficerWorkflow";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import type { OfficerLoanDecisionValue } from "@/types/officer.types";

export default function OfficerLoanDetailPage() {
  const params = useParams<{ loanId: string }>();
  const loanId = Number(params.loanId ?? 0);

  const [selectedAgentUserId, setSelectedAgentUserId] = useState("");
  const [decision, setDecision] = useState<OfficerLoanDecisionValue>("APPROVED");
  const [remarks, setRemarks] = useState("");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [approvedTenureMonths, setApprovedTenureMonths] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [reVerifyReason, setReVerifyReason] = useState("");

  const loansQuery = useOfficerPendingLoansQuery();
  const assignableAgentsQuery = useOfficerAssignableAgentsQuery(loanId);
  const profileQuery = useOfficerLoanProfileQuery(loanId);
  const evidenceQuery = useOfficerLoanEvidenceQuery(loanId);
  const assignAgentMutation = useOfficerAssignAgentMutation();
  const decisionMutation = useOfficerLoanDecisionMutation();

  const loan = useMemo(
    () => (loansQuery.data ?? []).find((item) => item.loanApplicationId === loanId),
    [loansQuery.data, loanId],
  );

  if (loansQuery.isLoading || profileQuery.isLoading || evidenceQuery.isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (!loan) {
    return (
      <Card>
        <CardContent className="p-4 text-sm">Loan not found in pending queue.</CardContent>
      </Card>
    );
  }

  const profile = profileQuery.data;
  const evidence = evidenceQuery.data;

  const isVerificationCompleted = (evidence?.verificationTaskStatus ?? "").toUpperCase() === "COMPLETED";
  const isVerificationVerified = (evidence?.verificationStatus ?? "").toUpperCase() === "VERIFIED";
  const isVerificationSubmitted = Boolean(evidence?.submittedAt);
  const hasAssignedAgent = Boolean(evidence?.assignedAgentId);
  const canApproveLoan =
    hasAssignedAgent && isVerificationCompleted && isVerificationVerified && isVerificationSubmitted;

  const submitDecision = () => {
    if (decision === "APPROVED" && !canApproveLoan) {
      toast.error("Cannot approve yet. Complete and verify the agent verification task first.");
      return;
    }

    decisionMutation.mutate({
      loanId,
      payload: {
        decision,
        officerRemarks: remarks,
        approvedAmount: decision === "APPROVED" ? Number(approvedAmount) : null,
        approvedTenureMonths: decision === "APPROVED" ? Number(approvedTenureMonths) : null,
        rejectionReason: decision === "REJECTED" ? rejectionReason : null,
        reVerifyReason: decision === "RE_VERIFY" ? reVerifyReason : null,
      },
    });
  };

  return (
    <div className="space-y-5">
      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-lg">Loan Review: {loan.applicationNumber}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Applicant</p>
            <p className="font-medium">{loan.userName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Requested Amount</p>
            <p className="font-medium">{formatCurrency(loan.requestedAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tenure</p>
            <p className="font-medium">{loan.tenureMonths} months</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Applied At</p>
            <p className="font-medium">{formatDateTime(loan.appliedAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge variant="outline">{loan.status}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Verification Task</p>
            <Badge variant="outline">{loan.verificationTaskStatus ?? "-"}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Verification Status</p>
            <Badge variant="outline">{loan.verificationStatus ?? "PENDING"}</Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">User Profile</TabsTrigger>
          <TabsTrigger value="verification">Verification Evidence</TabsTrigger>
          <TabsTrigger value="details">Application Details</TabsTrigger>
          <TabsTrigger value="decision">Decision</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="py-0">
            <CardHeader className="border-b px-4 py-3">
              <CardTitle className="text-base">Applicant Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 py-4">
              {!profile ? (
                <p className="text-sm text-muted-foreground">No profile data available.</p>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium">{profile.name}</p></div>
                    <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{profile.email}</p></div>
                    <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{profile.phone}</p></div>
                    <div><p className="text-xs text-muted-foreground">KYC Status</p><Badge variant="outline">{profile.kycStatus ?? "-"}</Badge></div>
                    <div><p className="text-xs text-muted-foreground">Occupation</p><p className="font-medium">{profile.occupation ?? "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Monthly Income</p><p className="font-medium">{formatCurrency(profile.monthlyIncome ?? 0)}</p></div>
                    <div className="sm:col-span-2"><p className="text-xs text-muted-foreground">Address</p><p className="font-medium">{[profile.street, profile.city, profile.state, profile.pinCode].filter(Boolean).join(", ") || "-"}</p></div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Documents</p>
                    <div className="grid gap-2">
                      {profile.documents.map((doc) => (
                        <div key={doc.documentId} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                          <div>
                            <p className="font-medium">{doc.documentType}</p>
                            <p className="text-xs text-muted-foreground">{doc.documentNumber}</p>
                          </div>
                          <Badge variant="outline">{doc.verificationStatus}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card className="py-0">
            <CardHeader className="border-b px-4 py-3">
              <CardTitle className="text-base">Verification Evidence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 py-4">
              {!evidence ? (
                <p className="text-sm text-muted-foreground">No verification evidence available.</p>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Task Lifecycle</p>
                      <Badge className="mt-2" variant="outline">{evidence.verificationTaskStatus ?? "-"}</Badge>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Verification Result</p>
                      <Badge className="mt-2" variant="outline">{evidence.verificationStatus ?? "PENDING"}</Badge>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Images Uploaded</p>
                      <p className="mt-2 text-lg font-semibold">{evidence.imageCount}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Decision Readiness</p>
                      <p className="mt-2 text-sm font-medium">{canApproveLoan ? "Ready for approval" : "Awaiting verified completion"}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div><p className="text-xs text-muted-foreground">Assigned Agent</p><p className="font-medium">{evidence.assignedAgentName ?? "Not assigned"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Task Started</p><p className="font-medium">{formatDateTime(evidence.verificationTaskStartedAt)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Visited At</p><p className="font-medium">{formatDateTime(evidence.visitedAt)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Submitted At</p><p className="font-medium">{formatDateTime(evidence.submittedAt)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Task Completed</p><p className="font-medium">{formatDateTime(evidence.verificationTaskCompletedAt)}</p></div>
                    <div className="sm:col-span-2 lg:col-span-4"><p className="text-xs text-muted-foreground">Visit Address</p><p className="font-medium">{evidence.visitAddress ?? "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Visit Latitude</p><p className="font-medium">{evidence.visitLatitude ?? "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Visit Longitude</p><p className="font-medium">{evidence.visitLongitude ?? "-"}</p></div>
                    <div className="sm:col-span-2 lg:col-span-4"><p className="text-xs text-muted-foreground">Report Summary</p><p className="font-medium">{evidence.reportSummary ?? "Report pending"}</p></div>
                    <div className="sm:col-span-2 lg:col-span-4"><p className="text-xs text-muted-foreground">Risk Notes</p><p className="font-medium">{evidence.riskNotes ?? "-"}</p></div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Evidence Images ({evidence.imageCount})</p>
                    {evidence.images.length === 0 ? (
                      <p className="mt-1 text-sm text-muted-foreground">No images uploaded yet.</p>
                    ) : (
                      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {evidence.images.map((image, index) => (
                          <a
                            key={`${image.imageUrl}-${index}`}
                            href={image.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="group block overflow-hidden rounded-lg border"
                          >
                            <img
                              src={image.imageUrl}
                              alt={`Verification evidence ${index + 1}`}
                              className="h-40 w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                            />
                            <div className="flex items-center justify-between p-2 text-xs text-muted-foreground">
                              <span>{image.imageCaption ?? `Evidence ${index + 1}`}</span>
                              <span>Open</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card className="py-0">
            <CardHeader className="border-b px-4 py-3">
              <CardTitle className="text-base">Application Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
              <div><p className="text-xs text-muted-foreground">Loan Purpose</p><p className="font-medium">{loan.loanPurpose}</p></div>
              <div><p className="text-xs text-muted-foreground">Disbursal Mode</p><Badge variant="outline">{loan.disbursalMode}</Badge></div>
              <div><p className="text-xs text-muted-foreground">Bank Name</p><p className="font-medium">{loan.disbursalBankName ?? "-"}</p></div>
              <div><p className="text-xs text-muted-foreground">Bank Account</p><p className="font-medium">{loan.disbursalBankAccount ?? "-"}</p></div>
              <div><p className="text-xs text-muted-foreground">IFSC</p><p className="font-medium">{loan.disbursalIfscCode ?? "-"}</p></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decision">
          <Card className="py-0">
            <CardHeader className="border-b px-4 py-3">
              <CardTitle className="text-base">Assign Agent & Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 py-4">
              {hasAssignedAgent ? (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Assigned Agent</p>
                  <p className="mt-1 font-medium">{evidence?.assignedAgentName ?? "-"}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline">Agent ID: {evidence?.assignedAgentId ?? "-"}</Badge>
                    <Badge variant="outline">Task: {evidence?.verificationTaskStatus ?? "-"}</Badge>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div className="space-y-2">
                    <Label htmlFor="agentUserId">Select Agent For Verification</Label>
                    <Select value={selectedAgentUserId} onValueChange={setSelectedAgentUserId}>
                      <SelectTrigger id="agentUserId" className="w-full">
                        <SelectValue placeholder="Choose agent (name, id, phone)" />
                      </SelectTrigger>
                      <SelectContent>
                        {(assignableAgentsQuery.data ?? []).map((agent) => (
                          <SelectItem
                            key={agent.agentUserId}
                            value={String(agent.agentUserId)}
                          >
                            {agent.name} | ID {agent.agentUserId} | {agent.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      assignAgentMutation.mutate({
                        loanId,
                        payload: {
                          agentUserId: Number(selectedAgentUserId),
                          reason: "Assigned by officer for loan verification",
                        },
                      })
                    }
                    disabled={
                      assignAgentMutation.isPending ||
                      assignableAgentsQuery.isLoading ||
                      !selectedAgentUserId ||
                      Number(selectedAgentUserId) <= 0
                    }
                  >
                    Assign Agent
                  </Button>
                </div>
              )}

              {!hasAssignedAgent && assignableAgentsQuery.isError ? (
                <p className="text-xs text-destructive">Unable to load assignable agents list.</p>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-3">
                <Button
                  variant={decision === "APPROVED" ? "default" : "outline"}
                  disabled={!canApproveLoan}
                  onClick={() => setDecision("APPROVED")}
                >
                  APPROVED
                </Button>
                <Button
                  variant={decision === "REJECTED" ? "destructive" : "outline"}
                  onClick={() => setDecision("REJECTED")}
                >
                  REJECTED
                </Button>
                <Button
                  variant={decision === "RE_VERIFY" ? "secondary" : "outline"}
                  onClick={() => setDecision("RE_VERIFY")}
                >
                  RE_VERIFY
                </Button>
              </div>

              {!canApproveLoan ? (
                <p className="text-xs text-amber-700">
                  Approval is locked until verification task is COMPLETED and verification status is VERIFIED.
                </p>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="remarks">Officer Remarks</Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="Applicant verification successful, income verified"
                />
              </div>

              {decision === "APPROVED" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="approvedAmount">Approved Amount</Label>
                    <Input
                      id="approvedAmount"
                      type="number"
                      value={approvedAmount}
                      onChange={(event) => setApprovedAmount(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="approvedTenureMonths">Approved Tenure (Months)</Label>
                    <Input
                      id="approvedTenureMonths"
                      type="number"
                      value={approvedTenureMonths}
                      onChange={(event) => setApprovedTenureMonths(event.target.value)}
                    />
                  </div>
                </div>
              ) : null}

              {decision === "REJECTED" ? (
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Rejection Reason</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    placeholder="Insufficient verification confidence"
                  />
                </div>
              ) : null}

              {decision === "RE_VERIFY" ? (
                <div className="space-y-2">
                  <Label htmlFor="reVerifyReason">Re-Verify Reason</Label>
                  <Textarea
                    id="reVerifyReason"
                    value={reVerifyReason}
                    onChange={(event) => setReVerifyReason(event.target.value)}
                    placeholder="Need additional address verification"
                  />
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={submitDecision}
                  disabled={
                    decisionMutation.isPending ||
                    !remarks.trim() ||
                    (decision === "APPROVED" && (!canApproveLoan || !approvedAmount || !approvedTenureMonths)) ||
                    (decision === "REJECTED" && !rejectionReason.trim()) ||
                    (decision === "RE_VERIFY" && !reVerifyReason.trim())
                  }
                >
                  Submit Decision
                </Button>
                <Button asChild variant="outline">
                  <Link href="/officer/loans">Back to Queue</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
