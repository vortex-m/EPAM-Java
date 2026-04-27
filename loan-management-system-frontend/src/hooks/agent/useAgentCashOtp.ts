"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { agentApi } from "@/api/endpoints/agent.api";
import type { CashCollectionOtpRequest, CashDisbursalOtpRequest, CashDisbursalOtpVerifyRequest } from "@/types/agent.types";

import { getAgentApiMessage, getAgentErrorMessage, unwrapAgentData } from "./agentQuery.utils";

export function useGenerateDisbursalOtpMutation() {
  return useMutation({
    mutationFn: async (data: CashDisbursalOtpRequest) => {
      const response = await agentApi.generateDisbursalOtp(data);
      return { response, data: unwrapAgentData(response) };
    },
    onSuccess: ({ response }) => toast.success(getAgentApiMessage(response, "Disbursal OTP generated.")),
    onError: (error) => toast.error(getAgentErrorMessage(error, "Unable to generate disbursal OTP.")),
  });
}

export function useVerifyDisbursalOtpMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CashDisbursalOtpVerifyRequest) => {
      const response = await agentApi.verifyDisbursalOtp(data);
      return { response, data: unwrapAgentData(response) };
    },
    onSuccess: async ({ response }) => {
      toast.success(getAgentApiMessage(response, "Disbursal OTP verified."));
      await queryClient.invalidateQueries({ queryKey: ["agent", "tasks"] });
    },
    onError: (error) => toast.error(getAgentErrorMessage(error, "Unable to verify disbursal OTP.")),
  });
}

export function useGenerateCollectionOtpMutation() {
  return useMutation({
    mutationFn: async (data: CashCollectionOtpRequest) => {
      const response = await agentApi.generateCollectionOtp(data);
      return { response, data: unwrapAgentData(response) };
    },
    onSuccess: ({ response }) => toast.success(getAgentApiMessage(response, "Collection OTP generated.")),
    onError: (error) => toast.error(getAgentErrorMessage(error, "Unable to generate collection OTP.")),
  });
}

export function useVerifyCollectionOtpMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      otpId: number;
      taskId: number;
      collectionAmount: number;
      otp: string;
      agentLatitude: number;
      agentLongitude: number;
    }) => {
      const response = await agentApi.verifyCollectionOtp(data);
      return { response, data: unwrapAgentData(response) };
    },
    onSuccess: async ({ response }) => {
      toast.success(getAgentApiMessage(response, "Collection OTP verified."));
      await queryClient.invalidateQueries({ queryKey: ["agent", "tasks"] });
      await queryClient.invalidateQueries({ queryKey: ["agent", "dashboard"] });
    },
    onError: (error) => toast.error(getAgentErrorMessage(error, "Unable to verify collection OTP.")),
  });
}
