"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function DisbursalOtpVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const taskId = searchParams.get("taskId");
    const legacyLoanApplicationId = searchParams.get("loanApplicationId");

    const target = taskId
      ? `/agent/cash-distribution?taskId=${encodeURIComponent(taskId)}`
      : legacyLoanApplicationId
        ? `/agent/cash-distribution?loanApplicationId=${encodeURIComponent(legacyLoanApplicationId)}`
        : "/agent/cash-distribution";

    router.replace(target);
  }, [router, searchParams]);

  return null;
}
