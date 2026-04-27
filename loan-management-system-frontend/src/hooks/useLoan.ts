import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { userApi } from "@/api/endpoints/user.api";
import type { ApiEnvelope } from "@/types/api.types";
import type {
  EmiPayRequest,
  EmiScheduleItem,
  EmiScheduleResponse,
  LoanApplyRequest,
  LoanApplyResponse,
  LoanDetailResponse,
  LoanListItem,
  LoanStatusResponse,
  PaymentHistoryResponse,
  PaymentItem,
} from "@/types/loan.types";

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toStringValue(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value.length > 0 ? value : fallback;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function normalizeLoanList(data: unknown): LoanStatusResponse {
  const source = (data ?? {}) as Record<string, unknown>;
  const rawLoans = (Array.isArray(source.loans)
    ? source.loans
    : Array.isArray(source.items)
      ? source.items
      : []) as Array<Record<string, unknown>>;

  const loans: LoanListItem[] = rawLoans.map((item) => ({
    loanApplicationId: toStringValue(item.loanApplicationId ?? item.id),
    applicationNumber: toStringValue(item.applicationNumber, "-"),
    loanId: toStringValue(item.loanId),
    loanNumber: toStringValue(item.loanNumber),
    requestedAmount: toNumber(item.requestedAmount),
    approvedAmount: toNumber(item.approvedAmount),
    tenureMonths: toNumber(item.tenureMonths),
    loanPurpose: toStringValue(item.loanPurpose),
    disbursalMode: toStringValue(item.disbursalMode) as LoanListItem["disbursalMode"],
    status: toStringValue(item.status, "UNKNOWN") as LoanListItem["status"],
    emiAmount: toNumber(item.emiAmount),
    totalPaidAmount: toNumber(item.totalPaidAmount),
    outstandingPrincipal: toNumber(item.outstandingPrincipal),
    nextDueDate: toStringValue(item.nextDueDate),
    rejectionReason: toStringValue(item.rejectionReason),
    appliedAt: toStringValue(item.appliedAt),
    updatedAt: toStringValue(item.updatedAt),
  }));

  return { loans };
}

function normalizeLoanDetail(data: unknown): LoanDetailResponse {
  const source = (data ?? {}) as Record<string, unknown>;
  const root = (source.loanApplication ?? source.application ?? source) as Record<string, unknown>;

  return {
    loanApplicationId: toStringValue(root.loanApplicationId ?? root.id),
    applicationNumber: toStringValue(root.applicationNumber, "-"),
    status: toStringValue(root.status, "UNKNOWN") as LoanDetailResponse["status"],
    requestedAmount: toNumber(root.requestedAmount),
    tenureMonths: toNumber(root.tenureMonths),
    loanPurpose: toStringValue(root.loanPurpose),
    loanPurposeDescription: toStringValue(root.loanPurposeDescription),
    userRemarks: toStringValue(root.userRemarks),
    disbursalMode: toStringValue(root.disbursalMode) as LoanDetailResponse["disbursalMode"],
    disbursalBankName: toStringValue(root.disbursalBankName),
    disbursalBankAccountMasked: toStringValue(root.disbursalBankAccountMasked),
    disbursalIfscCode: toStringValue(root.disbursalIfscCode),
    loanId: toStringValue(root.loanId),
    loanNumber: toStringValue(root.loanNumber),
    approvedAmount: toNumber(root.approvedAmount),
    interestRate: toNumber(root.interestRate),
    interestType: toStringValue(root.interestType),
    emiAmount: toNumber(root.emiAmount),
    processingFee: toNumber(root.processingFee),
    totalInterestPayable: toNumber(root.totalInterestPayable),
    totalAmountPayable: toNumber(root.totalAmountPayable),
    totalEmis: toNumber(root.totalEmis),
    emisPaid: toNumber(root.emisPaid),
    emisPending: toNumber(root.emisPending),
    emisOverdue: toNumber(root.emisOverdue),
    outstandingPrincipal: toNumber(root.outstandingPrincipal),
    totalPaidAmount: toNumber(root.totalPaidAmount),
    pendingAmount: toNumber(root.pendingAmount),
    nextDueDate: toStringValue(root.nextDueDate),
    disbursementDate: toStringValue(root.disbursementDate),
    firstEmiDate: toStringValue(root.firstEmiDate),
    lastEmiDate: toStringValue(root.lastEmiDate),
    disbursedAt: toStringValue(root.disbursedAt),
    assignedAgentName: toStringValue(root.assignedAgentName),
    assignedAgentPhone: toStringValue(root.assignedAgentPhone),
    assignedOfficerName: toStringValue(root.assignedOfficerName),
    assignedOfficerPhone: toStringValue(root.assignedOfficerPhone),
    officerRemarks: toStringValue(root.officerRemarks),
    rejectionReason: toStringValue(root.rejectionReason),
  };
}

function normalizeSchedule(data: unknown, loanId: string): EmiScheduleResponse {
  const source = (data ?? {}) as Record<string, unknown>;
  const rawSchedule = (Array.isArray(source.schedule)
    ? source.schedule
    : Array.isArray(source.items)
      ? source.items
      : []) as Array<Record<string, unknown>>;

  const schedule: EmiScheduleItem[] = rawSchedule.map((item, index) => ({
    emiScheduleId: toStringValue(item.emiScheduleId ?? item.id ?? index + 1),
    emiNumber: toNumber(item.emiNumber ?? index + 1),
    dueDate: toStringValue(item.dueDate),
    emiAmount: toNumber(item.emiAmount),
    principalComponent: toNumber(item.principalComponent),
    interestComponent: toNumber(item.interestComponent),
    outstandingPrincipal: toNumber(item.outstandingPrincipal),
    emiStatus: toStringValue(item.emiStatus, "PENDING") as EmiScheduleItem["emiStatus"],
    paidAmount: toNumber(item.paidAmount),
    paidDate: toStringValue(item.paidDate),
    penaltyAmount: toNumber(item.penaltyAmount),
    daysOverdue: toNumber(item.daysOverdue),
  }));

  return {
    loanId,
    loanNumber: toStringValue(source.loanNumber),
    principalAmount: toNumber(source.principalAmount),
    interestRate: toNumber(source.interestRate),
    totalEmis: toNumber(source.totalEmis),
    emiAmount: toNumber(source.emiAmount),
    schedule,
  };
}

function normalizePayments(data: unknown): PaymentHistoryResponse {
  const source = (data ?? {}) as Record<string, unknown>;
  const rawPayments = (Array.isArray(source.payments)
    ? source.payments
    : Array.isArray(source.items)
      ? source.items
      : []) as Array<Record<string, unknown>>;

  const payments: PaymentItem[] = rawPayments.map((item) => ({
    paymentId: toStringValue(item.paymentId ?? item.id),
    paymentNumber: toStringValue(item.paymentNumber, "-"),
    loanId: toStringValue(item.loanId),
    loanNumber: toStringValue(item.loanNumber),
    emiScheduleId: toStringValue(item.emiScheduleId),
    emiNumber: toNumber(item.emiNumber),
    totalPaidAmount: toNumber(item.totalPaidAmount),
    principalPaid: toNumber(item.principalPaid),
    interestPaid: toNumber(item.interestPaid),
    penaltyPaid: toNumber(item.penaltyPaid),
    paymentMode: toStringValue(item.paymentMode),
    paymentStatus: toStringValue(item.paymentStatus),
    paymentReference: toStringValue(item.paymentReference),
    gatewayTransactionId: toStringValue(item.gatewayTransactionId),
    cashSettlementStatus: toStringValue(item.cashSettlementStatus),
    cashVerifiedAt: toStringValue(item.cashVerifiedAt),
    settledAt: toStringValue(item.settledAt),
    paidAt: toStringValue(item.paidAt),
    receiptNumber: toStringValue(item.receiptNumber),
  }));

  return { payments };
}

export function useLoanStatuses() {
  return useQuery({
    queryKey: ["user", "loans", "list"],
    queryFn: async () => {
      const response = await userApi.getLoans();
      const payload = response.data as ApiEnvelope<unknown>;
      return normalizeLoanList(payload.data).loans;
    },
  });
}

export function useLoanDetail(loanApplicationId: string) {
  return useQuery({
    queryKey: ["user", "loans", "detail", loanApplicationId],
    queryFn: async () => {
      const response = await userApi.getLoanDetail(loanApplicationId);
      const payload = response.data as ApiEnvelope<unknown>;
      return normalizeLoanDetail(payload.data);
    },
    enabled: Boolean(loanApplicationId),
  });
}

export function useEmiSchedule(loanId: string) {
  return useQuery({
    queryKey: ["user", "loans", loanId, "emi-schedule"],
    queryFn: async () => {
      const response = await userApi.getEmiSchedule(loanId);
      const payload = response.data as ApiEnvelope<unknown>;
      return normalizeSchedule(payload.data, loanId);
    },
    enabled: Boolean(loanId),
  });
}

export function usePaymentHistory(loanId?: string) {
  return useQuery({
    queryKey: loanId
      ? ["user", "loans", loanId, "payments"]
      : ["user", "loans", "payments"],
    queryFn: async () => {
      const response = loanId
        ? await userApi.getLoanPayments(loanId)
        : await userApi.getAllLoanPayments();
      const payload = response.data as ApiEnvelope<unknown>;
      return normalizePayments(payload.data);
    },
  });
}

export function useApplyLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: LoanApplyRequest) => {
      const response = await userApi.applyLoan(request);
      const payload = response.data as ApiEnvelope<LoanApplyResponse>;
      return payload;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user", "loans"] });
      await queryClient.invalidateQueries({ queryKey: ["user", "dashboard"] });
    },
  });
}

export function usePayEmi(loanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: EmiPayRequest) => {
      const response = await userApi.payEmi(loanId, request);
      const payload = response.data as ApiEnvelope<PaymentItem>;
      return payload;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user", "loans", loanId, "emi-schedule"] });
      await queryClient.invalidateQueries({ queryKey: ["user", "loans", loanId, "payments"] });
      await queryClient.invalidateQueries({ queryKey: ["user", "dashboard"] });
    },
  });
}
