"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { userApi } from "@/api/endpoints/user.api";
import type { ApplyLoanRequest, LoanDetails, LoanSummary, UploadedFileResponse } from "@/types/user.types";

import { getApiErrorMessage, getApiMessage, unwrapApiData } from "./userQuery.utils";

const loansQueryKey: string[] = ["user", "loans"];
const dashboardQueryKey: string[] = ["user", "dashboard"];

export function useAllLoansQuery() {
  return useQuery({
    queryKey: loansQueryKey,
    queryFn: async () => {
      const response = await userApi.getAllLoans();
      const data = unwrapApiData<LoanSummary[] | { loans?: LoanSummary[] }>(response);
      if (Array.isArray(data)) {
        return data;
      }
      return data.loans ?? [];
    },
  });
}

export function useLoanDetailsQuery(loanId: string) {
  const queryKey: string[] = ["user", "loans", "details", loanId];

  return useQuery({
    queryKey,
    enabled: Boolean(loanId),
    queryFn: async () => {
      const response = await userApi.getLoanDetails(loanId);
      return unwrapApiData<LoanDetails>(response);
    },
  });
}

export function useUploadBankProofMutation() {
  return useMutation({
    mutationFn: async (file: File) => {
      const response = await userApi.uploadBankProof(file);
      return unwrapApiData<UploadedFileResponse>(response);
    },
    onSuccess: () => {
      toast.success("Bank proof uploaded successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to upload bank proof."));
    },
  });
}

export function useApplyLoanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApplyLoanRequest) => userApi.applyForLoan(data),
    onSuccess: async (response) => {
      toast.success(getApiMessage(response, "Loan application submitted."));
      await queryClient.invalidateQueries({ queryKey: loansQueryKey });
      await queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to submit loan application."));
    },
  });
}
