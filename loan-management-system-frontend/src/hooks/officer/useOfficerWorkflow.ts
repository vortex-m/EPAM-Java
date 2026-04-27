"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { officerApi } from "@/api/endpoints/officer.api";
import type {
  OfficerAssignableAgent,
  OfficerAssignAgentRequest,
  OfficerCashSettlementRequest,
  OfficerCashSettlementResponse,
  OfficerDashboardData,
  OfficerHandoverOtpRequest,
  OfficerHandoverOtpResponse,
  OfficerHandoverOtpVerifyRequest,
  OfficerKycDocument,
  OfficerKycReviewRequest,
  OfficerKycReviewResponse,
  OfficerLeadConvertRequest,
  OfficerLeadConvertResponse,
  OfficerLeadDecisionRequest,
  OfficerLeadDecisionResponse,
  OfficerLeadQueueItem,
  OfficerLoanDecisionRequest,
  OfficerLoanDecisionResponse,
  OfficerLoanQueueItem,
  OfficerLoanUserProfile,
  OfficerLoanVerificationEvidence,
  OfficerSettlementHistoryItem,
  OfficerUnsettledPayment,
} from "@/types/officer.types";

import {
  getOfficerApiMessage,
  getOfficerErrorMessage,
  unwrapOfficerData,
} from "./officerQuery.utils";

const officerKeys = {
  dashboard: ["officer", "dashboard"] as const,
  leads: ["officer", "leads", "queue"] as const,
  kyc: ["officer", "kyc", "pending"] as const,
  loans: ["officer", "loans", "pending"] as const,
  assignableAgents: ["officer", "agents", "assignable"] as const,
  cashDisbursal: ["officer", "cash-disbursal"] as const,
  cashUnsettled: ["officer", "cash", "unsettled"] as const,
  cashHistory: ["officer", "cash", "history"] as const,
};

export function useOfficerDashboardQuery() {
  return useQuery({
    queryKey: officerKeys.dashboard,
    queryFn: async () => {
      const response = await officerApi.getDashboard();
      return unwrapOfficerData<OfficerDashboardData>(response);
    },
  });
}

export function useOfficerLeadQueueQuery() {
  return useQuery({
    queryKey: officerKeys.leads,
    queryFn: async () => {
      const response = await officerApi.getLeadQueue();
      return unwrapOfficerData<OfficerLeadQueueItem[]>(response);
    },
  });
}

export function useOfficerLeadDecisionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { leadId: number | string; payload: OfficerLeadDecisionRequest }) => {
      const response = await officerApi.decideLead(data.leadId, data.payload);
      return { response, data: unwrapOfficerData<OfficerLeadDecisionResponse>(response) };
    },
    onSuccess: async ({ response }) => {
      toast.success(getOfficerApiMessage(response, "Lead decision submitted."));
      await queryClient.invalidateQueries({ queryKey: officerKeys.leads });
      await queryClient.invalidateQueries({ queryKey: officerKeys.dashboard });
    },
    onError: (error) => toast.error(getOfficerErrorMessage(error, "Unable to submit lead decision.")),
  });
}

export function useOfficerLeadConvertMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { leadId: number | string; payload: OfficerLeadConvertRequest }) => {
      const response = await officerApi.convertLeadToUser(data.leadId, data.payload);
      return { response, data: unwrapOfficerData<OfficerLeadConvertResponse>(response) };
    },
    onSuccess: async ({ response }) => {
      toast.success(getOfficerApiMessage(response, "Lead converted to loan application."));
      await queryClient.invalidateQueries({ queryKey: officerKeys.leads });
      await queryClient.invalidateQueries({ queryKey: officerKeys.loans });
      await queryClient.invalidateQueries({ queryKey: officerKeys.dashboard });
    },
    onError: (error) => toast.error(getOfficerErrorMessage(error, "Unable to convert lead.")),
  });
}

export function useOfficerPendingKycQuery() {
  return useQuery({
    queryKey: officerKeys.kyc,
    queryFn: async () => {
      const response = await officerApi.getPendingKycDocuments();
      return unwrapOfficerData<OfficerKycDocument[]>(response);
    },
  });
}

export function useOfficerKycDocumentQuery(documentId?: number, userId?: number) {
  return useQuery({
    queryKey: ["officer", "kyc", "document", documentId ?? 0, userId ?? 0],
    enabled: Boolean(documentId),
    queryFn: async () => {
      if (documentId && userId) {
        const response = await officerApi.getKycDocumentByUser(userId, documentId);
        return unwrapOfficerData<OfficerKycDocument>(response);
      }

      const pending = await officerApi.getPendingKycDocuments();
      const docs = unwrapOfficerData<OfficerKycDocument[]>(pending);
      const found = docs.find((doc) => doc.documentId === documentId);
      if (!found) {
        throw new Error("Document not found");
      }
      return found;
    },
  });
}

export function useOfficerKycReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      userId: number | string;
      documentId: number | string;
      payload: OfficerKycReviewRequest;
    }) => {
      const response = await officerApi.reviewKycDocument(data.userId, data.documentId, data.payload);
      return { response, data: unwrapOfficerData<OfficerKycReviewResponse>(response) };
    },
    onSuccess: async ({ response, data }) => {
      toast.success(getOfficerApiMessage(response, "KYC review submitted."));
      await queryClient.invalidateQueries({ queryKey: officerKeys.kyc });
      await queryClient.invalidateQueries({ queryKey: ["officer", "kyc", "document", data.documentId] });
      await queryClient.invalidateQueries({ queryKey: officerKeys.dashboard });
    },
    onError: (error) => toast.error(getOfficerErrorMessage(error, "Unable to submit KYC review.")),
  });
}

export function useOfficerPendingLoansQuery() {
  return useQuery({
    queryKey: officerKeys.loans,
    queryFn: async () => {
      const response = await officerApi.getPendingLoans();
      return unwrapOfficerData<OfficerLoanQueueItem[]>(response);
    },
  });
}

export function useOfficerAssignableAgentsQuery(loanId?: number) {
  return useQuery({
    queryKey: [...officerKeys.assignableAgents, loanId ?? 0],
    enabled: Boolean(loanId),
    queryFn: async () => {
      const response = await officerApi.getAssignableAgents(loanId as number);
      return unwrapOfficerData<OfficerAssignableAgent[]>(response);
    },
  });
}

export function useOfficerLoanProfileQuery(loanId?: number) {
  return useQuery({
    queryKey: ["officer", "loan", loanId ?? 0, "profile"],
    enabled: Boolean(loanId),
    queryFn: async () => {
      const response = await officerApi.getLoanUserProfile(loanId as number);
      return unwrapOfficerData<OfficerLoanUserProfile>(response);
    },
  });
}

export function useOfficerLoanEvidenceQuery(loanId?: number) {
  return useQuery({
    queryKey: ["officer", "loan", loanId ?? 0, "evidence"],
    enabled: Boolean(loanId),
    queryFn: async () => {
      const response = await officerApi.getVerificationEvidence(loanId as number);
      return unwrapOfficerData<OfficerLoanVerificationEvidence>(response);
    },
  });
}

export function useOfficerAssignAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { loanId: number | string; payload: OfficerAssignAgentRequest }) => {
      const response = await officerApi.assignAgent(data.loanId, data.payload);
      return { response };
    },
    onSuccess: async ({ response }, variables) => {
      toast.success(getOfficerApiMessage(response, "Agent assigned successfully."));
      await queryClient.invalidateQueries({ queryKey: officerKeys.loans });
      await queryClient.invalidateQueries({ queryKey: ["officer", "loan", Number(variables.loanId), "evidence"] });
      await queryClient.invalidateQueries({ queryKey: officerKeys.dashboard });
    },
    onError: (error) => toast.error(getOfficerErrorMessage(error, "Unable to assign agent.")),
  });
}

export function useOfficerLoanDecisionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { loanId: number | string; payload: OfficerLoanDecisionRequest }) => {
      const response = await officerApi.decideLoan(data.loanId, data.payload);
      return { response, data: unwrapOfficerData<OfficerLoanDecisionResponse>(response) };
    },
    onSuccess: async ({ response }, variables) => {
      toast.success(getOfficerApiMessage(response, "Loan decision submitted."));
      await queryClient.invalidateQueries({ queryKey: officerKeys.loans });
      await queryClient.invalidateQueries({ queryKey: ["officer", "loan", Number(variables.loanId), "profile"] });
      await queryClient.invalidateQueries({ queryKey: ["officer", "loan", Number(variables.loanId), "evidence"] });
      await queryClient.invalidateQueries({ queryKey: officerKeys.dashboard });
    },
    onError: (error) => toast.error(getOfficerErrorMessage(error, "Unable to submit loan decision.")),
  });
}

export function useOfficerCashDisbursalQueueQuery() {
  return useQuery({
    queryKey: officerKeys.cashDisbursal,
    queryFn: async () => {
      const response = await officerApi.getCashDisbursalQueue();
      return unwrapOfficerData<import("@/types/officer.types").OfficerCashDisbursalQueueItem[]>(response);
    },
  });
}

export function useOfficerGenerateHandoverOtpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: OfficerHandoverOtpRequest) => {
      const response = await officerApi.generateHandoverOtp(payload);
      return { response, data: unwrapOfficerData<OfficerHandoverOtpResponse>(response) };
    },
    onSuccess: async ({ response }) => {
      toast.success(getOfficerApiMessage(response, "Handover OTP generated."));
      await queryClient.invalidateQueries({ queryKey: officerKeys.cashDisbursal });
    },
    onError: (error) => toast.error(getOfficerErrorMessage(error, "Unable to generate OTP.")),
  });
}

export function useOfficerVerifyHandoverOtpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: OfficerHandoverOtpVerifyRequest) => {
      const response = await officerApi.verifyHandoverOtp(payload);
      return { response, data: unwrapOfficerData<OfficerHandoverOtpResponse>(response) };
    },
    onSuccess: async ({ response }) => {
      toast.success(getOfficerApiMessage(response, "Agent OTP verified."));
      await queryClient.invalidateQueries({ queryKey: officerKeys.cashDisbursal });
      await queryClient.invalidateQueries({ queryKey: officerKeys.dashboard });
    },
    onError: (error) => toast.error(getOfficerErrorMessage(error, "Unable to verify OTP.")),
  });
}

export function useOfficerUnsettledCashPaymentsQuery() {
  return useQuery({
    queryKey: officerKeys.cashUnsettled,
    queryFn: async () => {
      const response = await officerApi.getUnsettledCashPayments();
      return unwrapOfficerData<OfficerUnsettledPayment[]>(response);
    },
  });
}

export function useOfficerSettlementHistoryQuery() {
  return useQuery({
    queryKey: officerKeys.cashHistory,
    queryFn: async () => {
      const response = await officerApi.getSettlementHistory();
      return unwrapOfficerData<OfficerSettlementHistoryItem[]>(response);
    },
  });
}

export function useOfficerCashSettlementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: OfficerCashSettlementRequest) => {
      const response = await officerApi.settleCash(payload);
      return { response, data: unwrapOfficerData<OfficerCashSettlementResponse>(response) };
    },
    onSuccess: async ({ response }) => {
      toast.success(getOfficerApiMessage(response, "Cash settled successfully."));
      await queryClient.invalidateQueries({ queryKey: officerKeys.cashUnsettled });
      await queryClient.invalidateQueries({ queryKey: officerKeys.cashHistory });
      await queryClient.invalidateQueries({ queryKey: officerKeys.dashboard });
    },
    onError: (error) => toast.error(getOfficerErrorMessage(error, "Unable to settle cash.")),
  });
}
