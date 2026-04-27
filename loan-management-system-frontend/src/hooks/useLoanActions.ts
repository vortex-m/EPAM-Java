import type { LoanDetailResponse, LoanListItem } from "@/types/loan.types";

export function isLoanDisbursed(status?: string | null) {
  return (status ?? "").toUpperCase() === "DISBURSED";
}

export function canAccessRepaymentActions(loan: Pick<LoanListItem, "loanId" | "status">) {
  return Boolean(loan.loanId) && isLoanDisbursed(loan.status);
}

export function canAccessRepaymentActionsFromDetail(loan: LoanDetailResponse) {
  return Boolean(loan.loanId) && isLoanDisbursed(loan.status);
}
