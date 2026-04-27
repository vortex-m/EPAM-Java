"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useSubmitFullVerificationMutation,
  useSubmitVerificationReportMutation,
  useUploadVerificationImageMutation,
  useVerificationReportQuery,
} from "@/hooks/agent/useAgentVerification";
import type { SubmitFullVerificationResponse } from "@/types/agent.types";

const schema = z.object({
  reportSummary: z.string().min(3),
  residenceRemarks: z.string().optional(),
  businessRemarks: z.string().optional(),
  documentsMatched: z.boolean(),
  applicantAvailable: z.boolean(),
  addressVerified: z.boolean(),
  incomeVerified: z.boolean(),
  suspiciousActivity: z.boolean(),
  riskNotes: z.string().optional(),
  visitAddress: z.string().optional(),
  visitLatitude: z.number().optional(),
  visitLongitude: z.number().optional(),
  cashCollectedAmount: z.number().positive().optional(),
  cashCollectionRemarks: z.string().optional(),
});

type Slot = {
  id: string;
  file: File | null;
  imageTag: string;
  description: string;
  captureLatitude: string;
  captureLongitude: string;
  progress: number;
  uploaded: boolean;
};

const DEFAULT_IMAGE_TAG = "PROPERTY_FRONT_VIEW";

function getFileSize(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function VerificationReportPage() {
  const searchParams = useSearchParams();
  const taskId = Number(searchParams.get("taskId") ?? "0");

  const reportQuery = useVerificationReportQuery(taskId);
  const submitMutation = useSubmitVerificationReportMutation();
  const submitFullMutation = useSubmitFullVerificationMutation();
  const uploadMutation = useUploadVerificationImageMutation();

  const [editing, setEditing] = useState(false);
  const [reportSavedInSession, setReportSavedInSession] = useState(false);
  const [form, setForm] = useState({
    reportSummary: "",
    residenceRemarks: "",
    businessRemarks: "",
    documentsMatched: false,
    applicantAvailable: false,
    addressVerified: false,
    incomeVerified: false,
    suspiciousActivity: false,
    riskNotes: "",
    visitAddress: "",
    visitLatitude: "",
    visitLongitude: "",
    cashCollectedAmount: "",
    cashCollectionRemarks: "",
  });
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [fullSubmitResult, setFullSubmitResult] = useState<SubmitFullVerificationResponse | null>(null);
  const [slots, setSlots] = useState<Slot[]>([
    {
      id: "1",
      file: null,
      imageTag: DEFAULT_IMAGE_TAG,
      description: "",
      captureLatitude: "",
      captureLongitude: "",
      progress: 0,
      uploaded: false,
    },
  ]);

  const updateSlot = (id: string, patch: Partial<Slot>) => {
    setSlots((prev) => prev.map((slot) => (slot.id === id ? { ...slot, ...patch } : slot)));
  };

  const captureGps = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setForm((s) => ({
        ...s,
        visitLatitude: String(position.coords.latitude),
        visitLongitude: String(position.coords.longitude),
      }));
    });
  };

  const captureImageGps = (id: string) => {
    navigator.geolocation.getCurrentPosition((position) => {
      updateSlot(id, {
        captureLatitude: String(position.coords.latitude),
        captureLongitude: String(position.coords.longitude),
      });
    });
  };

  if (reportQuery.isLoading) return <Skeleton className="h-96" />;

  const existing = reportQuery.data;
  const reportAvailable = Boolean(existing) || reportSavedInSession;
  const isSubmitting = submitMutation.isPending || submitFullMutation.isPending;
  const isTaskCompleted = fullSubmitResult?.taskStatus?.toUpperCase() === "COMPLETED";

  const submit = async () => {
    const payload = {
      reportSummary: form.reportSummary,
      residenceRemarks: form.residenceRemarks || undefined,
      businessRemarks: form.businessRemarks || undefined,
      documentsMatched: form.documentsMatched,
      applicantAvailable: form.applicantAvailable,
      addressVerified: form.addressVerified,
      incomeVerified: form.incomeVerified,
      suspiciousActivity: form.suspiciousActivity,
      riskNotes: form.riskNotes || undefined,
      visitAddress: form.visitAddress || undefined,
      visitLatitude: form.visitLatitude ? Number(form.visitLatitude) : undefined,
      visitLongitude: form.visitLongitude ? Number(form.visitLongitude) : undefined,
      cashCollectedAmount: form.cashCollectedAmount ? Number(form.cashCollectedAmount) : undefined,
      cashCollectionRemarks: form.cashCollectionRemarks || undefined,
    };

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid report");
      return;
    }

    setError("");
    await submitMutation.mutateAsync({ taskId, payload: parsed.data });
    setReportSavedInSession(true);
    await reportQuery.refetch();
    setEditing(false);
  };

  const submitFullVerification = async () => {
    const payload = {
      reportSummary: form.reportSummary,
      residenceRemarks: form.residenceRemarks || undefined,
      businessRemarks: form.businessRemarks || undefined,
      documentsMatched: form.documentsMatched,
      applicantAvailable: form.applicantAvailable,
      addressVerified: form.addressVerified,
      incomeVerified: form.incomeVerified,
      suspiciousActivity: form.suspiciousActivity,
      riskNotes: form.riskNotes || undefined,
      visitAddress: form.visitAddress || undefined,
      visitLatitude: form.visitLatitude ? Number(form.visitLatitude) : undefined,
      visitLongitude: form.visitLongitude ? Number(form.visitLongitude) : undefined,
      cashCollectedAmount: form.cashCollectedAmount ? Number(form.cashCollectedAmount) : undefined,
      cashCollectionRemarks: form.cashCollectionRemarks || undefined,
    };

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid report");
      return;
    }

    const selectedSlots = slots.filter((slot) => slot.file);
    if (selectedSlots.length === 0) {
      setUploadError("Add at least one image to use full submission.");
      return;
    }

    const files = selectedSlots.map((slot) => slot.file as File);
    const images = selectedSlots.map((slot) => ({
      imageTag: slot.imageTag.trim() ? slot.imageTag.trim().toUpperCase() : undefined,
      description: slot.description.trim() ? slot.description.trim() : undefined,
      captureLatitude: slot.captureLatitude.trim() ? Number(slot.captureLatitude.trim()) : undefined,
      captureLongitude: slot.captureLongitude.trim() ? Number(slot.captureLongitude.trim()) : undefined,
    }));

    setError("");
    setUploadError("");

    slots.forEach((slot) => {
      if (slot.file) {
        updateSlot(slot.id, { progress: 20, uploaded: false });
      }
    });

    try {
      const result = await submitFullMutation.mutateAsync({
        taskId,
        payload: {
          report: parsed.data,
          images,
          files,
        },
      });
      setFullSubmitResult(result.data);
      setReportSavedInSession(true);
      setSlots((prev) => prev.map((slot) => (slot.file ? { ...slot, progress: 100, uploaded: true } : slot)));
      await reportQuery.refetch();
      setEditing(false);
    } catch {
      setSlots((prev) => prev.map((slot) => (slot.file ? { ...slot, progress: 0, uploaded: false } : slot)));
      setUploadError("Full submission failed. Check image files and retry.");
    }
  };

  const uploadImage = async (id: string) => {
    const slot = slots.find((s) => s.id === id);
    if (!slot || !slot.file || taskId <= 0 || !reportAvailable) return;

    setUploadError("");

    const formData = new FormData();
    formData.append("file", slot.file);
    if (slot.imageTag.trim()) {
      formData.append("imageTag", slot.imageTag.trim().toUpperCase());
    }
    if (slot.description.trim()) {
      formData.append("description", slot.description.trim());
    }
    if (slot.captureLatitude.trim()) {
      formData.append("captureLatitude", slot.captureLatitude.trim());
    }
    if (slot.captureLongitude.trim()) {
      formData.append("captureLongitude", slot.captureLongitude.trim());
    }

    updateSlot(id, { progress: 20 });
    try {
      await uploadMutation.mutateAsync({ taskId, formData });
      updateSlot(id, { progress: 100, uploaded: true });
      await reportQuery.refetch();
    } catch {
      updateSlot(id, { progress: 0, uploaded: false });
      setUploadError("Image upload failed. Ensure report is submitted, then retry.");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle>Verification Workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 py-4">
          <p className="text-sm text-muted-foreground">Task ID: {taskId || "-"}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant={reportAvailable ? "default" : "outline"}>Step 1: Report {reportAvailable ? "Done" : "Pending"}</Badge>
            <Badge variant={reportAvailable ? "secondary" : "outline"}>Step 2: Images {reportAvailable ? "Enabled" : "Locked"}</Badge>
            <Badge variant={isTaskCompleted ? "default" : "outline"}>Step 3: Task {isTaskCompleted ? "Completed" : "Pending"}</Badge>
            {existing?.imageCount != null ? <Badge variant="outline">Uploaded: {existing.imageCount}</Badge> : null}
          </div>
          {isTaskCompleted ? (
            <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
              Verification submitted successfully. Task auto-completed at {fullSubmitResult?.completedAt ?? "-"}.
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild variant="outline" size="sm">
              <Link href="/agent/verification">Back to Verification Tasks</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {existing && !editing ? (
        <Card className="py-0">
          <CardHeader className="border-b px-4 py-3"><CardTitle>Current Report Snapshot</CardTitle></CardHeader>
          <CardContent className="space-y-2 px-4 py-4">
            <p>Summary: {existing.reportSummary}</p>
            <p>Status: {existing.verificationStatus}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setForm({
                    reportSummary: existing.reportSummary ?? "",
                    residenceRemarks: existing.residenceRemarks ?? "",
                    businessRemarks: existing.businessRemarks ?? "",
                    documentsMatched: Boolean(existing.documentsMatched),
                    applicantAvailable: Boolean(existing.applicantAvailable),
                    addressVerified: Boolean(existing.addressVerified),
                    incomeVerified: Boolean(existing.incomeVerified),
                    suspiciousActivity: Boolean(existing.suspiciousActivity),
                    riskNotes: existing.riskNotes ?? "",
                    visitAddress: existing.visitAddress ?? "",
                    visitLatitude: existing.visitLatitude != null ? String(existing.visitLatitude) : "",
                    visitLongitude: existing.visitLongitude != null ? String(existing.visitLongitude) : "",
                    cashCollectedAmount:
                      existing.cashCollectedAmount != null ? String(existing.cashCollectedAmount) : "",
                    cashCollectionRemarks: existing.cashCollectionRemarks ?? "",
                  });
                  setEditing(true);
                }}
              >
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!existing || editing ? (
        <Card className="py-0">
          <CardHeader className="border-b px-4 py-3"><CardTitle>Verification Report</CardTitle></CardHeader>
          <CardContent className="space-y-3 px-4 py-4">
            <div className="space-y-2">
              <Label>Report Summary *</Label>
              <Textarea value={form.reportSummary} onChange={(e) => setForm((s) => ({ ...s, reportSummary: e.target.value }))} placeholder="Report summary" />
            </div>
            <div className="space-y-2">
              <Label>Residence Remarks</Label>
              <Textarea value={form.residenceRemarks} onChange={(e) => setForm((s) => ({ ...s, residenceRemarks: e.target.value }))} placeholder="Residence remarks" />
            </div>
            <div className="space-y-2">
              <Label>Business Remarks</Label>
              <Textarea value={form.businessRemarks} onChange={(e) => setForm((s) => ({ ...s, businessRemarks: e.target.value }))} placeholder="Business remarks" />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ["documentsMatched", "Documents Matched"],
                ["applicantAvailable", "Applicant Available"],
                ["addressVerified", "Address Verified"],
                ["incomeVerified", "Income Verified"],
                ["suspiciousActivity", "Suspicious Activity"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(form[key as keyof typeof form])}
                    onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.checked }))}
                  />
                  {label}
                </label>
              ))}
            </div>
            {form.suspiciousActivity ? (
              <div className="space-y-2">
                <Label>Risk Notes</Label>
                <Textarea value={form.riskNotes} onChange={(e) => setForm((s) => ({ ...s, riskNotes: e.target.value }))} placeholder="Risk notes" />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label>Visit Address</Label>
              <Input value={form.visitAddress} onChange={(e) => setForm((s) => ({ ...s, visitAddress: e.target.value }))} placeholder="Visit address" />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <Input value={form.visitLatitude} readOnly placeholder="Latitude" />
              <Input value={form.visitLongitude} readOnly placeholder="Longitude" />
            </div>
            <Button variant="outline" onClick={captureGps}>Capture Location</Button>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Cash Collected Amount (Optional)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cashCollectedAmount}
                  onChange={(e) => setForm((s) => ({ ...s, cashCollectedAmount: e.target.value }))}
                  placeholder="Used for CASH_COLLECTION tasks"
                />
              </div>
              <div className="space-y-2">
                <Label>Cash Collection Remarks (Optional)</Label>
                <Input
                  value={form.cashCollectionRemarks}
                  onChange={(e) => setForm((s) => ({ ...s, cashCollectionRemarks: e.target.value }))}
                  placeholder="Collection note"
                />
              </div>
            </div>

            {error ? <p className="text-xs text-destructive">{error}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button onClick={submit} disabled={isSubmitting || isTaskCompleted}>
                {submitMutation.isPending ? "Submitting..." : "Submit Report Only"}
              </Button>
              <Button variant="secondary" onClick={submitFullVerification} disabled={isSubmitting || isTaskCompleted}>
                {submitFullMutation.isPending ? "Submitting Full Verification..." : "Submit Full Verification (With Images)"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Choose report-only submit or full submit with images in one call.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle>Verification Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 py-4">
          {!reportAvailable ? (
            <p className="text-sm text-muted-foreground">
              Add images now and use full-submit, or submit report first then upload each image below.
            </p>
          ) : null}

          {uploadError ? <p className="text-sm text-destructive">{uploadError}</p> : null}

          {slots.map((slot) => (
            <div key={slot.id} className="space-y-3 rounded-md border p-3">
              <div className="space-y-2">
                <Label>File</Label>
                <Input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => updateSlot(slot.id, { file: e.target.files?.[0] ?? null })}
                />
                {slot.file ? (
                  <p className="text-xs text-muted-foreground">
                    {slot.file.name} ({getFileSize(slot.file.size)})
                  </p>
                ) : null}
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <Input
                  value={slot.imageTag}
                  onChange={(e) => updateSlot(slot.id, { imageTag: e.target.value })}
                  placeholder="Image Tag"
                />
                <Input
                  value={slot.description}
                  onChange={(e) => updateSlot(slot.id, { description: e.target.value })}
                  placeholder="Description"
                />
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <Input readOnly value={slot.captureLatitude} placeholder="Capture Latitude" />
                <Input readOnly value={slot.captureLongitude} placeholder="Capture Longitude" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => captureImageGps(slot.id)}>
                  Capture GPS
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => uploadImage(slot.id)}
                  disabled={!slot.file || !reportAvailable || uploadMutation.isPending || isTaskCompleted}
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload This Image"}
                </Button>
              </div>
              <div className="h-2 overflow-hidden rounded bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${slot.progress}%` }} />
              </div>
              {slot.uploaded ? <p className="text-sm text-emerald-700">Uploaded ✓</p> : null}
            </div>
          ))}

          <Button
            variant="outline"
            disabled={isTaskCompleted}
            onClick={() =>
              setSlots((prev) =>
                prev.length >= 10
                  ? prev
                  : [
                      ...prev,
                      {
                        id: String(prev.length + 1),
                        file: null,
                        imageTag: DEFAULT_IMAGE_TAG,
                        description: "",
                        captureLatitude: "",
                        captureLongitude: "",
                        progress: 0,
                        uploaded: false,
                      },
                    ],
              )
            }
          >
            Add Another Image
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
