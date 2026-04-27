"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { agentApi } from "@/api/endpoints/agent.api";
import type {
  AgentProfile,
  UpdateAvailabilityRequest,
  UpdateLocationRequest,
} from "@/types/agent.types";

import { getAgentApiMessage, getAgentErrorMessage, unwrapAgentData } from "./agentQuery.utils";

const profileKey = ["agent", "profile"] as const;
const dashboardKey = ["agent", "dashboard"] as const;

export function useAgentProfileQuery() {
  return useQuery({
    queryKey: profileKey,
    queryFn: async () => {
      const response = await agentApi.getProfile();
      return unwrapAgentData<AgentProfile>(response);
    },
  });
}

export function useCompleteAgentOnboardingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: unknown) => agentApi.completeOnboarding(data),
    onSuccess: async (response) => {
      toast.success(getAgentApiMessage(response, "Onboarding completed."));
      await queryClient.invalidateQueries({ queryKey: profileKey });
      await queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
    onError: (error) => {
      toast.error(getAgentErrorMessage(error, "Unable to complete onboarding."));
    },
  });
}

export function useUpdateAvailabilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAvailabilityRequest) => agentApi.updateAvailability(data),
    onSuccess: async (response) => {
      toast.success(getAgentApiMessage(response, "Availability updated."));
      await queryClient.invalidateQueries({ queryKey: profileKey });
      await queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
    onError: (error) => {
      toast.error(getAgentErrorMessage(error, "Unable to update availability."));
    },
  });
}

export function useUpdateLocationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateLocationRequest) => agentApi.updateLocation(data),
    onSuccess: async (response) => {
      toast.success(getAgentApiMessage(response, "Location updated."));
      await queryClient.invalidateQueries({ queryKey: profileKey });
      await queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
    onError: (error) => {
      toast.error(getAgentErrorMessage(error, "Unable to update location."));
    },
  });
}
