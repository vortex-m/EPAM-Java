"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { agentApi } from "@/api/endpoints/agent.api";
import type {
  SubmitFullVerificationRequest,
  SubmitFullVerificationResponse,
  SubmitVerificationReportRequest,
  UploadVerificationImageResponse,
  VerificationReport,
} from "@/types/agent.types";

import { getAgentApiMessage, getAgentErrorMessage, unwrapAgentData } from "./agentQuery.utils";

export function useVerificationReportQuery(taskId: number | string) {
  return useQuery({
    queryKey: ["agent", "report", String(taskId)],
    enabled: Boolean(taskId),
    queryFn: async () => {
      const response = await agentApi.getVerificationReport(taskId);
      return unwrapAgentData<VerificationReport>(response);
    },
  });
}

export function useSubmitVerificationReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { taskId: number | string; payload: SubmitVerificationReportRequest }) => {
      const response = await agentApi.submitVerificationReport(data.taskId, data.payload);
      return { response, data: unwrapAgentData<VerificationReport>(response) };
    },
    onSuccess: async ({ response, data }) => {
      toast.success(getAgentApiMessage(response, "Verification report submitted."));
      await queryClient.invalidateQueries({ queryKey: ["agent", "tasks"] });
      await queryClient.invalidateQueries({ queryKey: ["agent", "report", String(data.taskId)] });
    },
    onError: (error) => toast.error(getAgentErrorMessage(error, "Unable to submit verification report.")),
  });
}

export function useUploadVerificationImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { taskId: number | string; formData: FormData }) => {
      const response = await agentApi.uploadVerificationImage(data.taskId, data.formData);
      return { response, data: unwrapAgentData<UploadVerificationImageResponse>(response), taskId: data.taskId };
    },
    onSuccess: async ({ response, taskId }) => {
      toast.success(getAgentApiMessage(response, "Image uploaded successfully."));
      await queryClient.invalidateQueries({ queryKey: ["agent", "report", String(taskId)] });
    },
    onError: (error) => toast.error(getAgentErrorMessage(error, "Unable to upload verification image.")),
  });
}

export function useSubmitFullVerificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { taskId: number | string; payload: SubmitFullVerificationRequest }) => {
      const response = await agentApi.submitFullVerification(data.taskId, data.payload);
      return {
        response,
        data: unwrapAgentData<SubmitFullVerificationResponse>(response),
        taskId: data.taskId,
      };
    },
    onSuccess: async ({ response, taskId }) => {
      toast.success(getAgentApiMessage(response, "Verification submitted successfully."));
      await queryClient.invalidateQueries({ queryKey: ["agent", "tasks"] });
      await queryClient.invalidateQueries({ queryKey: ["agent", "report", String(taskId)] });
    },
    onError: (error) => toast.error(getAgentErrorMessage(error, "Unable to submit full verification.")),
  });
}
