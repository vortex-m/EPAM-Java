"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { managerApi } from "@/api/endpoints/manager.api";
import type {
  AssistedAuditResponse,
  AuditFlagRequest,
  AuditLogResponse,
  FraudAlert,
  FraudCase,
  ManagerAssignAgentRequest,
  ManagerDashboardData,
  ManagerLoanDecisionRequest,
  ManagerLoanResponse,
  ManagerProfile,
  ManagerProfileUpdateRequest,
  ManagerReassignAgentRequest,
  StaffCreateRequest,
  StaffCreateResponse,
  VerificationEvidenceResponse,
} from "@/types/manager.types";

import {
  getManagerApiMessage,
  getManagerErrorMessage,
  unwrapManagerData,
} from "./managerQuery.utils";

const managerKeys = {
  profile: ["manager", "profile"] as const,
  dashboard: ["manager", "dashboard"] as const,
  summary: ["manager", "dashboard", "summary"] as const,
  pendingLoans: ["manager", "loans", "pending"] as const,
  auditActions: ["manager", "audit", "assisted-actions"] as const,
  auditLogs: ["manager", "audit", "logs"] as const,
  auditFlags: ["manager", "audit", "flags"] as const,
  auditTrail: ["manager", "audit", "trail"] as const,
  fraudAlerts: ["manager", "fraud", "alerts"] as const,
  fraudCases: ["manager", "fraud", "cases"] as const,
  fraudAuditLogs: ["manager", "fraud", "audit-logs"] as const,
};

export function useManagerProfileQuery() {
  return useQuery({
    queryKey: managerKeys.profile,
    queryFn: async () => {
      const response = await managerApi.getProfile();
      return unwrapManagerData<ManagerProfile>(response);
    },
  });
}

export function useManagerProfileUpdateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ManagerProfileUpdateRequest) => {
      const response = await managerApi.updateProfile(payload);
      return { response, data: unwrapManagerData<ManagerProfile>(response) };
    },
    onSuccess: async ({ response }) => {
      toast.success(getManagerApiMessage(response, "Profile updated successfully."));
      await queryClient.invalidateQueries({ queryKey: managerKeys.profile });
    },
    onError: (error) => toast.error(getManagerErrorMessage(error, "Unable to update profile.")),
  });
}

export function useManagerDashboardQuery() {
  return useQuery({
    queryKey: managerKeys.dashboard,
    queryFn: async () => {
      const response = await managerApi.getDashboard();
      return unwrapManagerData<ManagerDashboardData>(response);
    },
  });
}

export function useManagerDashboardSummaryQuery() {
  return useQuery({
    queryKey: managerKeys.summary,
    queryFn: async () => {
      const response = await managerApi.getDashboardSummary();
      return unwrapManagerData<ManagerDashboardData>(response);
    },
  });
}

export function useManagerPendingLoansQuery(params?: {
  status?: string;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: [...managerKeys.pendingLoans, params?.status ?? "ALL", params?.page ?? 0, params?.size ?? 0],
    queryFn: async () => {
      const response = await managerApi.getPendingLoans(params);
      return unwrapManagerData<ManagerLoanResponse[]>(response);
    },
  });
}

export function useManagerLoanEvidenceQuery(loanId?: number) {
  return useQuery({
    queryKey: ["manager", "loan", loanId ?? 0, "evidence"],
    enabled: Boolean(loanId),
    queryFn: async () => {
      const response = await managerApi.getVerificationEvidence(loanId as number);
      return unwrapManagerData<VerificationEvidenceResponse>(response);
    },
  });
}

export function useManagerLoanDecisionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { loanId: number | string; payload: ManagerLoanDecisionRequest }) => {
      const response = await managerApi.decideLoan(data.loanId, data.payload);
      return { response, data: unwrapManagerData<ManagerLoanResponse>(response) };
    },
    onSuccess: async ({ response }, variables) => {
      toast.success(getManagerApiMessage(response, "Loan decision submitted."));
      await queryClient.invalidateQueries({ queryKey: managerKeys.pendingLoans });
      await queryClient.invalidateQueries({ queryKey: ["manager", "loan", Number(variables.loanId), "evidence"] });
      await queryClient.invalidateQueries({ queryKey: managerKeys.dashboard });
      await queryClient.invalidateQueries({ queryKey: managerKeys.summary });
    },
    onError: (error) => toast.error(getManagerErrorMessage(error, "Unable to submit loan decision.")),
  });
}

export function useManagerAssignAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { loanId: number | string; payload: ManagerAssignAgentRequest }) => {
      const response = await managerApi.assignAgent(data.loanId, data.payload);
      return { response, data: unwrapManagerData<ManagerLoanResponse>(response) };
    },
    onSuccess: async ({ response }, variables) => {
      toast.success(getManagerApiMessage(response, "Agent assigned successfully."));
      await queryClient.invalidateQueries({ queryKey: managerKeys.pendingLoans });
      await queryClient.invalidateQueries({ queryKey: ["manager", "loan", Number(variables.loanId), "evidence"] });
      await queryClient.invalidateQueries({ queryKey: managerKeys.dashboard });
    },
    onError: (error) => toast.error(getManagerErrorMessage(error, "Unable to assign agent.")),
  });
}

export function useManagerReassignAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { loanId: number | string; payload: ManagerReassignAgentRequest }) => {
      const response = await managerApi.reassignAgent(data.loanId, data.payload);
      return { response, data: unwrapManagerData<ManagerLoanResponse>(response) };
    },
    onSuccess: async ({ response }, variables) => {
      toast.success(getManagerApiMessage(response, "Agent reassigned successfully."));
      await queryClient.invalidateQueries({ queryKey: managerKeys.pendingLoans });
      await queryClient.invalidateQueries({ queryKey: ["manager", "loan", Number(variables.loanId), "evidence"] });
      await queryClient.invalidateQueries({ queryKey: managerKeys.dashboard });
    },
    onError: (error) => toast.error(getManagerErrorMessage(error, "Unable to reassign agent.")),
  });
}

export function useManagerDisbursalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { loanId: number | string; transactionReference: string }) => {
      const response = await managerApi.disburseByBank(data.loanId, data.transactionReference);
      return { response, data: unwrapManagerData<ManagerLoanResponse>(response) };
    },
    onSuccess: async ({ response }) => {
      toast.success(getManagerApiMessage(response, "Bank disbursal processed."));
      await queryClient.invalidateQueries({ queryKey: managerKeys.pendingLoans });
      await queryClient.invalidateQueries({ queryKey: managerKeys.dashboard });
    },
    onError: (error) => toast.error(getManagerErrorMessage(error, "Unable to process disbursal.")),
  });
}

function useCreateStaffMutation(
  fn: (payload: StaffCreateRequest) => Promise<unknown>,
  successMessage: string,
) {
  return useMutation({
    mutationFn: async (payload: StaffCreateRequest) => {
      const response = (await fn(payload)) as import("axios").AxiosResponse;
      return { response, data: unwrapManagerData<StaffCreateResponse>(response) };
    },
    onSuccess: ({ response }) => {
      toast.success(getManagerApiMessage(response, successMessage));
    },
    onError: (error) => toast.error(getManagerErrorMessage(error, "Unable to create staff.")),
  });
}

export function useCreateAgentStaffMutation() {
  return useCreateStaffMutation(
    (payload) => managerApi.createAgentStaff(payload),
    "Agent created successfully.",
  );
}

export function useCreateOfficerStaffMutation() {
  return useCreateStaffMutation(
    (payload) => managerApi.createOfficerStaff(payload),
    "Officer created successfully.",
  );
}

export function useCreateManagerStaffMutation() {
  return useCreateStaffMutation(
    (payload) => managerApi.createManagerStaff(payload),
    "Manager created successfully.",
  );
}

export function useManagerAuditActionsQuery() {
  return useQuery({
    queryKey: managerKeys.auditActions,
    queryFn: async () => {
      const response = await managerApi.getAssistedAuditActions();
      return unwrapManagerData<AssistedAuditResponse[]>(response);
    },
  });
}

export function useManagerLoanAuditQuery(loanId?: number) {
  return useQuery({
    queryKey: ["manager", "audit", "loan", loanId ?? 0],
    enabled: Boolean(loanId),
    queryFn: async () => {
      const response = await managerApi.getLoanAuditLogs(loanId as number);
      return unwrapManagerData<AuditLogResponse[]>(response);
    },
  });
}

export function useManagerFlagAuditMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { auditId: number | string; payload: AuditFlagRequest }) => {
      const response = await managerApi.flagAuditEntry(data.auditId, data.payload);
      return { response, data: unwrapManagerData<AuditLogResponse>(response) };
    },
    onSuccess: async ({ response }) => {
      toast.success(getManagerApiMessage(response, "Audit entry flagged."));
      await queryClient.invalidateQueries({ queryKey: managerKeys.auditActions });
    },
    onError: (error) => toast.error(getManagerErrorMessage(error, "Unable to flag audit entry.")),
  });
}

// ── Audit Logs ───────────────────────────────────────────────────────────────

export function useManagerAuditLogsQuery(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: [...managerKeys.auditLogs, params?.page ?? 0, params?.size ?? 50],
    queryFn: async () => {
      const response = await managerApi.getAuditLogs(params);
      return unwrapManagerData<AuditLogResponse[]>(response);
    },
  });
}

export function useManagerAuditFlagsQuery(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: [...managerKeys.auditFlags, params?.page ?? 0, params?.size ?? 50],
    queryFn: async () => {
      const response = await managerApi.getAuditFlags(params);
      return unwrapManagerData<AuditLogResponse[]>(response);
    },
  });
}

export function useManagerAuditTrailQuery(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: [...managerKeys.auditTrail, params?.page ?? 0, params?.size ?? 50],
    queryFn: async () => {
      const response = await managerApi.getAuditTrail(params);
      return unwrapManagerData<AuditLogResponse[]>(response);
    },
  });
}

// ── Fraud ────────────────────────────────────────────────────────────────────

export function useManagerFraudAlertsQuery(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: [...managerKeys.fraudAlerts, params?.page ?? 0, params?.size ?? 50],
    queryFn: async () => {
      const response = await managerApi.getFraudAlerts(params);
      return unwrapManagerData<FraudAlert[]>(response);
    },
  });
}

export function useManagerFraudCasesQuery(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: [...managerKeys.fraudCases, params?.page ?? 0, params?.size ?? 50],
    queryFn: async () => {
      const response = await managerApi.getFraudCases(params);
      return unwrapManagerData<FraudCase[]>(response);
    },
  });
}

export function useManagerFraudAuditLogsQuery(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: [...managerKeys.fraudAuditLogs, params?.page ?? 0, params?.size ?? 50],
    queryFn: async () => {
      const response = await managerApi.getFraudAuditLogs(params);
      return unwrapManagerData<AuditLogResponse[]>(response);
    },
  });
}

