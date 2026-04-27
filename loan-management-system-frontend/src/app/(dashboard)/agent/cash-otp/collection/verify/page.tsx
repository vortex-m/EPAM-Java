"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CollectionOtpVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const taskId = searchParams.get("taskId");
    const target = taskId
      ? `/agent/cash-otp/collection/generate?taskId=${encodeURIComponent(taskId)}`
      : "/agent/cash-otp/collection/generate";
    router.replace(target);
  }, [router, searchParams]);

  return null;
}
