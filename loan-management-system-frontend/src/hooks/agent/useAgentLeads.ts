"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { agentApi } from "@/api/endpoints/agent.api";
import type {
  CaptureConsentRequest,
  CreateLeadRequest,
  CreateLoanDraftRequest,
  LeadDetails,
  LeadStatus,
  LeadSummary,
  SubmitToOfficerRequest,
  UpdateLeadProfileRequest,
} from "@/types/agent.types";

import { getAgentApiMessage, getAgentErrorMessage, unwrapAgentData } from "./agentQuery.utils";

const leadsKey = ["agent", "leads"] as const;

type RawLeadSummary = Omit<LeadSummary, "leadId" | "status"> & {
  id?: number;
  leadId?: number;
  status: LeadStatus | string;
};

type RawLeadDetails = Omit<LeadDetails, "leadId" | "status"> & {
  id?: number;
  leadId?: number;
  status: LeadStatus | string;
};

function normalizeLeadStatus(status: RawLeadSummary["status"]): LeadStatus {
  return String(status) as LeadStatus;
}

function normalizeLeadSummary(lead: RawLeadSummary): LeadSummary {
  return {
    ...lead,
    leadId: lead.leadId ?? lead.id ?? 0,
    status: normalizeLeadStatus(lead.status),
  };
}

function normalizeLeadDetails(lead: RawLeadDetails): LeadDetails {
  return {
    ...lead,
    leadId: lead.leadId ?? lead.id ?? 0,
    status: normalizeLeadStatus(lead.status),
  };
}

export function useMyLeadsQuery() {
  return useQuery({
    queryKey: leadsKey,
    queryFn: async () => {
      const response = await agentApi.getMyLeads();
      const data = unwrapAgentData<RawLeadSummary[] | { leads?: RawLeadSummary[] }>(response);
      const rawLeads = Array.isArray(data) ? data : (data.leads ?? []);
      return rawLeads.map(normalizeLeadSummary);
    },
  });
}

export function useLeadDetailsQuery(leadId: number | string) {
  return useQuery({
    queryKey: ["agent", "lead", String(leadId)],
    enabled: Boolean(leadId),
    queryFn: async () => {
      const response = await agentApi.getLeadDetails(leadId);
      const data = unwrapAgentData<RawLeadDetails>(response);
      return normalizeLeadDetails(data);
    },
  });
}

export function useCreateLeadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateLeadRequest) => {
      const response = await agentApi.createLead(data);
      const payload = unwrapAgentData<{ leadId?: number; id?: number }>(response);
      return {
        response,
        data: { leadId: payload.leadId ?? payload.id ?? 0 },
      };
    },
    onSuccess: async ({ response }) => {
      toast.success(getAgentApiMessage(response, "Lead created successfully."));
      await queryClient.invalidateQueries({ queryKey: leadsKey });
    },
    onError: (error) => toast.error(getAgentErrorMessage(error, "Unable to create lead.")),
  });
}

export function useUpdateLeadProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { leadId: number | string; payload: UpdateLeadProfileRequest }) =>
      agentApi.updateLeadProfile(data.leadId, data.payload),
    onSuccess: async (response, variables) => {
      toast.success(getAgentApiMessage(response, "Lead profile updated."));
      await queryClient.invalidateQueries({ queryKey: ["agent", "lead", String(variables.leadId)] });
      await queryClient.invalidateQueries({ queryKey: leadsKey });
    },
    onError: (error) => toast.error(getAgentErrorMessage(error, "Unable to update lead profile.")),
  });
}

export function useUploadLeadKycMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { leadId: number | string; formData: FormData }) =>
      agentApi.uploadLeadKyc(data.leadId, data.formData),
    onSuccess: async (response, variables) => {
      toast.success(getAgentApiMessage(response, "Lead KYC uploaded."));
      await queryClient.invalidateQueries({ queryKey: ["agent", "lead", String(variables.leadId)] });
      await queryClient.invalidateQueries({ queryKey: leadsKey });
    },
    onError: (error) => toast.error(getAgentErrorMessage(error, "Unable to upload lead KYC.")),
  });
}

export function useCaptureConsentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { leadId: number | string; payload: CaptureConsentRequest }) =>
      agentApi.captureConsent(data.leadId, data.payload),
    onSuccess: async (response, variables) => {
      toast.success(getAgentApiMessage(response, "Consent captured."));
      await queryClient.invalidateQueries({ queryKey: ["agent", "lead", String(variables.leadId)] });
      await queryClient.invalidateQueries({ queryKey: leadsKey });
    },
    onError: (error) => toast.error(getAgentErrorMessage(error, "Unable to capture consent.")),
  });
}

export function useCreateLoanDraftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { leadId: number | string; payload: CreateLoanDraftRequest }) =>
      agentApi.createLoanDraft(data.leadId, data.payload),
    onSuccess: async (response, variables) => {
      toast.success(getAgentApiMessage(response, "Loan draft created."));
      await queryClient.invalidateQueries({ queryKey: ["agent", "lead", String(variables.leadId)] });
      await queryClient.invalidateQueries({ queryKey: leadsKey });
    },
    onError: (error) => toast.error(getAgentErrorMessage(error, "Unable to create loan draft.")),
  });
}

export function useSubmitToOfficerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { leadId: number | string; payload: SubmitToOfficerRequest }) =>
      agentApi.submitToOfficer(data.leadId, data.payload),
    onSuccess: async (response, variables) => {
      toast.success(getAgentApiMessage(response, "Lead submitted to officer."));
      await queryClient.invalidateQueries({ queryKey: ["agent", "lead", String(variables.leadId)] });
      await queryClient.invalidateQueries({ queryKey: leadsKey });
    },
    onError: (error) => toast.error(getAgentErrorMessage(error, "Unable to submit to officer.")),
  });
}
