"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { agentApi } from "@/api/endpoints/agent.api";
import type {
  AgentAssignedLoan,
  AgentEmiSchedule,
  ApplyLoanForUserRequest,
  ApplyLoanForUserResponse,
} from "@/types/agent.types";

import { getAgentApiMessage, getAgentErrorMessage, unwrapAgentData } from "./agentQuery.utils";

export function useAgentAssignedLoansQuery() {
  return useQuery({
    queryKey: ["agent", "loans", "assigned-users"],
    queryFn: async () => {
      const response = await agentApi.getAssignedUsersAndLoans();
      const data = unwrapAgentData<AgentAssignedLoan[] | { items?: AgentAssignedLoan[] }>(response);
      if (Array.isArray(data)) return data;
      return data.items ?? [];
    },
  });
}

export function useAgentLoanEmisQuery(loanId?: number) {
  return useQuery({
    queryKey: ["agent", "loan-emis", loanId ?? 0],
    enabled: Boolean(loanId && loanId > 0),
    queryFn: async () => {
      const response = await agentApi.getLoanEmis(loanId as number);
      const data = unwrapAgentData<AgentEmiSchedule[] | { schedule?: AgentEmiSchedule[] }>(response);
      if (Array.isArray(data)) return data;
      return data.schedule ?? [];
    },
  });
}

export function useApplyLoanForUserMutation() {
  return useMutation({
    mutationFn: async (data: ApplyLoanForUserRequest) => {
      const response = await agentApi.applyLoanForUser(data);
      return { response, data: unwrapAgentData<ApplyLoanForUserResponse>(response) };
    },
    onSuccess: ({ response }) => {
      toast.success(getAgentApiMessage(response, "Loan application submitted."));
    },
    onError: (error) => toast.error(getAgentErrorMessage(error, "Unable to apply loan for user.")),
  });
}
