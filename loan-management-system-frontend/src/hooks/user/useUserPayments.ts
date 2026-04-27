"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { userApi } from "@/api/endpoints/user.api";
import type { EmiScheduleResponse, PayEmiReceipt, PayEmiRequest, PaymentHistoryResponse } from "@/types/user.types";

import { getApiErrorMessage, getApiMessage, unwrapApiData } from "./userQuery.utils";

const paymentsQueryKey: string[] = ["user", "payments", "history"];
const dashboardQueryKey: string[] = ["user", "dashboard"];

export function useEmiScheduleQuery(loanId: string) {
  const queryKey: string[] = ["user", "payments", "schedule", loanId];

  return useQuery({
    queryKey,
    enabled: Boolean(loanId),
    queryFn: async () => {
      const response = await userApi.getEmiSchedule(loanId);
      return unwrapApiData<EmiScheduleResponse>(response);
    },
  });
}

export function usePayEmiMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PayEmiRequest) => {
      const response = await userApi.payEmi(data);
      return {
        receipt: unwrapApiData<PayEmiReceipt>(response),
        response,
      };
    },
    onSuccess: async ({ response }) => {
      toast.success(getApiMessage(response, "EMI payment submitted successfully."));
      await queryClient.invalidateQueries({ queryKey: paymentsQueryKey });
      await queryClient.invalidateQueries({ queryKey: ["user", "payments", "schedule"] });
      await queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to process EMI payment."));
    },
  });
}

export function usePaymentHistoryQuery() {
  return useQuery({
    queryKey: paymentsQueryKey,
    queryFn: async () => {
      const response = await userApi.getPaymentHistory();
      const data = unwrapApiData<PaymentHistoryResponse | { payments?: PaymentHistoryResponse["payments"] }>(response);
      if ("payments" in data && Array.isArray(data.payments)) {
        return { payments: data.payments };
      }
      return { payments: [] };
    },
  });
}

export function useLoanPaymentHistoryQuery(loanId: string) {
  const queryKey: string[] = ["user", "payments", "history", "loan", loanId];

  return useQuery({
    queryKey,
    enabled: Boolean(loanId),
    queryFn: async () => {
      const response = await userApi.getLoanPaymentHistory(loanId);
      const data = unwrapApiData<PaymentHistoryResponse | { payments?: PaymentHistoryResponse["payments"] }>(response);
      if ("payments" in data && Array.isArray(data.payments)) {
        return { payments: data.payments };
      }
      return { payments: [] };
    },
  });
}
