"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Images,
  MessageSquare,
  ScanLine,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useManagerLoanEvidenceQuery } from "@/hooks/manager/useManagerWorkflow";
import { cn } from "@/lib/utils";

function VerifiedBadge({ ok }: { ok?: boolean }) {
  if (ok === undefined || ok === null)
    return <span className="text-xs text-muted-foreground">—</span>;
  return ok ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
      <CheckCircle2 className="size-3.5" /> Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
      <XCircle className="size-3.5" /> Not Verified
    </span>
  );
}

function statusColor(status?: string) {
  const s = (status ?? "").toUpperCase();
  if (s === "COMPLETED")
    return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
  if (s === "FAILED")
    return "bg-rose-500/10 text-rose-700 border-rose-500/20";
  return "bg-amber-500/10 text-amber-700 border-amber-500/20";
}

export default function ManagerVerificationEvidencePage() {
  const params = useParams<{ loanId: string }>();
  const loanId = Number(params.loanId);
  const evidenceQuery = useManagerLoanEvidenceQuery(loanId);

  if (evidenceQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (evidenceQuery.isError || !evidenceQuery.data) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          Unable to load verification evidence. Please try again.
        </CardContent>
      </Card>
    );
  }

  const evidence = evidenceQuery.data;
  const imageCount = evidence.imageCount ?? evidence.images?.length ?? 0;

  return (
    <div className="space-y-5">
      {/* ── Page header ──────────────────────────────── */}
      <div className="rounded-xl border border-border/80 bg-fintech-surface bg-fintech-glow p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ScanLine className="size-5 text-primary" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Verification Evidence
              </h1>
              <p className="text-sm text-muted-foreground">
                Loan #{loanId} · Field agent report and uploaded images.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/manager/loans/${loanId}/review`}>
              <ArrowLeft className="mr-1.5 size-3.5" />
              Back to Review
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Summary card ─────────────────────────────── */}
      <Card className="border-border/80 bg-card/85 py-0 shadow-sm">
        <CardHeader className="border-b border-border/60 px-4 py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4 text-primary" />
            Verification Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1.5">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                  statusColor(evidence.verificationStatus),
                )}
              >
                {evidence.verificationStatus ?? "PENDING"}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Images</p>
            <p className="mt-1.5 font-semibold">{imageCount} uploaded</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Address</p>
            <div className="mt-1.5">
              <VerifiedBadge ok={evidence.addressVerified} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Income</p>
            <div className="mt-1.5">
              <VerifiedBadge ok={evidence.incomeVerified} />
            </div>
          </div>

          {/* Report summary */}
          <div className="sm:col-span-2 lg:col-span-4">
            <p className="mb-1 text-xs text-muted-foreground">Report Summary</p>
            <p className="rounded-lg bg-muted/50 p-3 text-sm leading-relaxed">
              {evidence.reportSummary ?? "No report summary provided by the field agent."}
            </p>
          </div>

          {/* Agent remarks */}
          <div className="sm:col-span-2 lg:col-span-4">
            <p className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MessageSquare className="size-3" />
              Agent Remarks
            </p>
            <p className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm leading-relaxed text-muted-foreground">
              {evidence.agentRemarks ?? "No remarks provided."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Evidence images ───────────────────────────── */}
      <Card className="border-border/80 bg-card/85 py-0 shadow-sm">
        <CardHeader className="border-b border-border/60 px-4 py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Images className="size-4 text-primary" />
            Evidence Images
            {imageCount > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {imageCount}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4">
          {!evidence.images || evidence.images.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 py-12 text-center">
              <Images className="mx-auto mb-2 size-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No images attached by the field agent.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {evidence.images.map((image, index) => (
                <div
                  key={`${image.fileUrl}-${index}`}
                  className="group overflow-hidden rounded-xl border border-border/70 bg-background/40 transition-shadow hover:shadow-md"
                >
                  <div className="relative h-44 overflow-hidden bg-muted">
                    <img
                      src={image.fileUrl}
                      alt={image.imageTag ?? `Verification image ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="text-sm font-semibold">
                      {image.imageTag ?? `Image ${index + 1}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {image.description ?? "No description"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
