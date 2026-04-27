"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  useOfficerKycDocumentQuery,
  useOfficerKycReviewMutation,
} from "@/hooks/officer/useOfficerWorkflow";
import { formatDateTime } from "@/lib/formatters";
import type { OfficerKycReviewStatus } from "@/types/officer.types";

export default function OfficerKycDocumentReviewPage() {
  const params = useParams<{ documentId: string }>();
  const searchParams = useSearchParams();

  const documentId = Number(params.documentId ?? 0);
  const userIdParam = searchParams.get("userId");
  const userId = userIdParam ? Number(userIdParam) : undefined;

  const [reviewStatus, setReviewStatus] = useState<OfficerKycReviewStatus>("APPROVED");
  const [reviewRemarks, setReviewRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [resubmissionInstructions, setResubmissionInstructions] = useState("");

  const documentQuery = useOfficerKycDocumentQuery(documentId, userId);
  const reviewMutation = useOfficerKycReviewMutation();

  if (documentQuery.isLoading) {
    return <Skeleton className="h-72" />;
  }

  if (documentQuery.isError || !documentQuery.data) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-destructive">Unable to load KYC document.</CardContent>
      </Card>
    );
  }

  const doc = documentQuery.data;

  const onSubmit = () => {
    reviewMutation.mutate({
      userId: doc.userId,
      documentId: doc.documentId,
      payload: {
        reviewStatus,
        reviewRemarks,
        rejectionReason: reviewStatus === "REJECTED" ? rejectionReason : null,
        resubmissionRequested: reviewStatus === "RESUBMIT",
        resubmissionInstructions:
          reviewStatus === "RESUBMIT" ? resubmissionInstructions : null,
      },
    });
  };

  return (
    <div className="space-y-5">
      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-lg">KYC Document Review</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Document ID</p>
            <p className="font-medium">{doc.documentId}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">User ID</p>
            <p className="font-medium">{doc.userId}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="font-medium">{doc.documentType}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Uploaded</p>
            <p className="font-medium">{formatDateTime(doc.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Document Number</p>
            <p className="font-medium">{doc.documentNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Document Status</p>
            <Badge variant="outline">{doc.documentStatus}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">KYC Status</p>
            <Badge variant="outline">{doc.kycStatus}</Badge>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <Button asChild variant="outline" size="sm">
              <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                Open Document File
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-base">Review Decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reviewStatus">Decision</Label>
            <Select
              value={reviewStatus}
              onValueChange={(value) => setReviewStatus(value as OfficerKycReviewStatus)}
            >
              <SelectTrigger id="reviewStatus">
                <SelectValue placeholder="Select review status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APPROVED">APPROVED</SelectItem>
                <SelectItem value="REJECTED">REJECTED</SelectItem>
                <SelectItem value="RESUBMIT">RESUBMIT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewRemarks">Review Remarks</Label>
            <Textarea
              id="reviewRemarks"
              value={reviewRemarks}
              onChange={(event) => setReviewRemarks(event.target.value)}
              placeholder="Document verified against submitted records"
            />
          </div>

          {reviewStatus === "REJECTED" ? (
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Reason for rejection"
              />
            </div>
          ) : null}

          {reviewStatus === "RESUBMIT" ? (
            <div className="space-y-2">
              <Label htmlFor="resubmissionInstructions">Resubmission Instructions</Label>
              <Textarea
                id="resubmissionInstructions"
                value={resubmissionInstructions}
                onChange={(event) => setResubmissionInstructions(event.target.value)}
                placeholder="Ask user to upload clearer copy"
              />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onSubmit}
              disabled={
                reviewMutation.isPending ||
                !reviewRemarks.trim() ||
                (reviewStatus === "REJECTED" && !rejectionReason.trim()) ||
                (reviewStatus === "RESUBMIT" && !resubmissionInstructions.trim())
              }
            >
              Submit Review
            </Button>
            <Button asChild variant="outline">
              <Link href="/officer/kyc">Back to KYC Queue</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
