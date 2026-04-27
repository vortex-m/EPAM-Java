"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerificationImagesUploadPage() {
  const searchParams = useSearchParams();
  const taskId = Number(searchParams.get("taskId") ?? "0");

  return (
    <Card className="py-0">
      <CardHeader className="border-b px-4 py-3">
        <CardTitle>Verification Images Moved</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 py-4">
        <p className="text-sm text-muted-foreground">
          Image upload is now integrated into the single verification workspace page.
        </p>
        <Button asChild>
          <Link href={taskId > 0 ? `/agent/verification/report?taskId=${taskId}` : "/agent/tasks"}>
            Open Verification Workspace
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
