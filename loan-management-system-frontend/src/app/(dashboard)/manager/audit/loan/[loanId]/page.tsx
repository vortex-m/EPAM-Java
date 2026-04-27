"use client";

import { useParams } from "next/navigation";

import { ManagerAuditTable } from "@/components/manager/ManagerAuditTable";
import { useManagerLoanAuditQuery } from "@/hooks/manager/useManagerWorkflow";

export default function ManagerAuditLoanDetailsPage() {
  const params = useParams<{ loanId: string }>();
  const loanId = Number(params.loanId);
  const loanAuditQuery = useManagerLoanAuditQuery(loanId);

  const rows = (loanAuditQuery.data ?? []).map((item) => ({
    ...item,
    loanId,
  }));

  return (
    <ManagerAuditTable
      title={`Loan Audit Trail • #${loanId}`}
      description="Full action history for this loan application across roles."
      rows={rows}
    />
  );
}
