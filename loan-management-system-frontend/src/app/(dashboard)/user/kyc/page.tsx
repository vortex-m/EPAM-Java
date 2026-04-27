"use client";

import { useMemo, useState } from "react";
import { AlertCircle, FileText, Trash2, Upload, X } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
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
import {
  useDeleteKycMutation,
  useKycStatusQuery,
  useSubmitKycMutation,
  useUpdateKycMutation,
  useUploadKycMutation,
} from "@/hooks/user/useUserKyc";
import { formatDisplayDate, formatFileSize, getStatusBadge, maskDocumentNumber } from "@/lib/user-ui";
import type { KycDocument } from "@/types/user.types";

const documentTypes = ["AADHAAR", "PAN", "DRIVING_LICENSE", "PASSPORT", "VOTER_ID"] as const;
const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

function validateUploadFile(file: File | null): string | null {
  if (!file) {
    return "Document file is required.";
  }

  if (!allowedMimeTypes.includes(file.type)) {
    return "Only PDF, JPG, and PNG files are allowed.";
  }

  if (file.size > 5 * 1024 * 1024) {
    return "File size must be 5MB or smaller.";
  }

  return null;
}

function FileSelection({
  file,
  onRemove,
  uploading,
}: {
  file: File | null;
  onRemove: () => void;
  uploading: boolean;
}) {
  if (!file) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate">{file.name}</p>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-1">{formatFileSize(file.size)}</p>
      {uploading ? (
        <div className="mt-2 h-2 overflow-hidden rounded bg-slate-200">
          <div className="h-full w-3/4 animate-pulse bg-primary" />
        </div>
      ) : null}
    </div>
  );
}

function DocumentCard({
  doc,
  onDelete,
  onReupload,
  uploading,
}: {
  doc: KycDocument;
  onDelete: (docId: string) => void;
  onReupload: (docId: string, file: File, documentNumber: string) => Promise<void>;
  uploading: boolean;
}) {
  const status = getStatusBadge(doc.status);
  const isRejected = doc.status === "REJECTED";
  const isPending = doc.status === "PENDING";

  const [documentNumber, setDocumentNumber] = useState(doc.documentNumber);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const submitReupload = async () => {
    const fileError = validateUploadFile(file);
    if (fileError) {
      setError(fileError);
      return;
    }

    if (!file) {
      setError("Please select a file to re-upload.");
      return;
    }

    setError("");
    await onReupload(doc.documentId, file, documentNumber.trim());
    setFile(null);
  };

  return (
    <Card className="py-0">
      <CardContent className="space-y-3 px-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{doc.documentType}</p>
            <p className="text-xs text-muted-foreground">Number: {maskDocumentNumber(doc.documentNumber)}</p>
            <p className="text-xs text-muted-foreground">Uploaded: {formatDisplayDate(doc.uploadedAt)}</p>
          </div>
          <Badge variant={status.variant} className={status.className}>
            {status.label}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">Officer Remarks: {doc.officerRemarks || "-"}</p>

        {isRejected && doc.rejectionReason ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <p className="font-medium">Rejection Reason</p>
            <p className="mt-1">{doc.rejectionReason}</p>
          </div>
        ) : null}

        {isRejected ? (
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 px-3 py-3">
            <p className="text-xs font-semibold text-foreground">Re-upload rejected document</p>
            <Input value={documentNumber} onChange={(event) => setDocumentNumber(event.target.value)} />
            <Input
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setError("");
              }}
            />
            <FileSelection file={file} onRemove={() => setFile(null)} uploading={uploading} />
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
            <Button type="button" size="sm" disabled={uploading} onClick={submitReupload}>
              {uploading ? "Uploading..." : "Re-upload"}
            </Button>
          </div>
        ) : null}

        {isPending ? (
          <Button type="button" size="sm" variant="outline" onClick={() => onDelete(doc.documentId)}>
            <Trash2 className="mr-1 h-4 w-4" />
            Delete Pending Document
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function UserKycPage() {
  const kycQuery = useKycStatusQuery();
  const uploadKycMutation = useUploadKycMutation();
  const submitKycMutation = useSubmitKycMutation();
  const deleteKycMutation = useDeleteKycMutation();
  const updateKycMutation = useUpdateKycMutation();

  const [documentType, setDocumentType] = useState<string>("AADHAAR");
  const [documentNumber, setDocumentNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");

  const status = getStatusBadge(kycQuery.data?.kycStatus ?? "UNKNOWN");
  const documents = useMemo(() => kycQuery.data?.documents ?? [], [kycQuery.data?.documents]);

  const hasMissingRequiredDocs = useMemo(() => {
    const types = new Set(documents.map((doc) => doc.documentType));
    return !types.has("AADHAAR") || !types.has("PAN");
  }, [documents]);

  const canSubmit = !["SUBMITTED", "APPROVED"].includes((kycQuery.data?.kycStatus ?? "").toUpperCase());

  const uploadDocument = async () => {
    if (!documentNumber.trim()) {
      setUploadError("Document number is required.");
      return;
    }

    const fileError = validateUploadFile(file);
    if (fileError) {
      setUploadError(fileError);
      return;
    }

    if (!file) {
      setUploadError("Please select a file.");
      return;
    }

    setUploadError("");

    await uploadKycMutation.mutateAsync({
      documentType,
      documentNumber: documentNumber.trim(),
      file,
    });

    setDocumentNumber("");
    setFile(null);
  };

  const deleteDocument = async (docId: string) => {
    await deleteKycMutation.mutateAsync(docId);
  };

  const reuploadRejected = async (docId: string, rejectedFile: File, newDocumentNumber: string) => {
    await updateKycMutation.mutateAsync({
      docId,
      file: rejectedFile,
      documentNumber: newDocumentNumber,
    });
  };

  const submitForReview = async () => {
    await submitKycMutation.mutateAsync();
  };

  const isUploading = uploadKycMutation.isPending || updateKycMutation.isPending;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <FileText className="mt-0.5 h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">KYC</h1>
            <p className="mt-1 text-sm text-muted-foreground">Upload documents and submit your KYC for officer review.</p>
          </div>
        </div>
        <Badge variant={status.variant} className={status.className}>
          Overall: {status.label}
        </Badge>
      </div>

      {kycQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : null}

      {!kycQuery.isLoading && !kycQuery.isError && documents.length === 0 ? (
        <EmptyState
          title="No KYC documents uploaded"
          description="Upload your identity documents to start KYC verification."
          action={
            <Button type="button" variant="outline" onClick={() => setDocumentType("AADHAAR")}>
              Start Upload
            </Button>
          }
        />
      ) : null}

      {kycQuery.isError ? (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">Unable to load KYC status.</CardContent>
        </Card>
      ) : null}

      {canSubmit || hasMissingRequiredDocs ? (
        <Card className="py-0">
          <CardHeader className="border-b px-4 py-3">
            <CardTitle>Upload KYC Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 py-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((docType) => (
                      <SelectItem key={docType} value={docType}>
                        {docType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentNumber">Document Number</Label>
                <Input
                  id="documentNumber"
                  value={documentNumber}
                  onChange={(event) => {
                    setDocumentNumber(event.target.value.toUpperCase());
                    setUploadError("");
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kycFile">Document File</Label>
                <Input
                  id="kycFile"
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  onChange={(event) => {
                    setFile(event.target.files?.[0] ?? null);
                    setUploadError("");
                  }}
                />
              </div>
            </div>

            <FileSelection file={file} onRemove={() => setFile(null)} uploading={isUploading} />

            {uploadError ? <p className="text-xs text-destructive">{uploadError}</p> : null}

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" onClick={uploadDocument} disabled={isUploading}>
                <Upload className="mr-1 h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload Document"}
              </Button>
              <Button type="button" variant="outline" disabled={!canSubmit || submitKycMutation.isPending} onClick={submitForReview}>
                {submitKycMutation.isPending ? "Submitting..." : "Submit for Review"}
              </Button>
            </div>

            {hasMissingRequiredDocs ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4" />
                  <p>Please upload both AADHAAR and PAN documents before final submission.</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.documentId}
              doc={doc}
              onDelete={deleteDocument}
              onReupload={reuploadRejected}
              uploading={isUploading}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
