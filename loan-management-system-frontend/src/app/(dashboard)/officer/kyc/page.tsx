"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfficerPendingKycQuery } from "@/hooks/officer/useOfficerWorkflow";
import { formatDateTime } from "@/lib/formatters";

export default function OfficerKycQueuePage() {
  const kycQuery = useOfficerPendingKycQuery();

  if (kycQuery.isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (kycQuery.isError) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-destructive">Unable to load pending KYC documents.</CardContent>
      </Card>
    );
  }

  const rows = kycQuery.data ?? [];

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No pending KYC documents"
        description="All KYC documents are already reviewed."
      />
    );
  }

  return (
    <div className="space-y-5">
      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-lg">Pending KYC Documents</CardTitle>
        </CardHeader>
      </Card>

      <div className="grid gap-3">
        {rows.map((doc) => (
          <Card key={doc.documentId} className="py-0">
            <CardContent className="grid gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <p className="text-xs text-muted-foreground">User</p>
                <p className="font-medium">#{doc.userId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Document</p>
                <p className="font-medium">{doc.documentType}</p>
                <p className="text-xs text-muted-foreground">{doc.documentNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Uploaded</p>
                <p className="font-medium">{formatDateTime(doc.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{doc.documentStatus}</Badge>
                  <Badge variant="outline">KYC: {doc.kycStatus}</Badge>
                </div>
              </div>
              <div className="flex items-end justify-between gap-2 lg:justify-end">
                <Button asChild size="sm" variant="outline">
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                    View File
                  </a>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/officer/kyc/document/${doc.documentId}?userId=${doc.userId}`}>
                    Review
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
