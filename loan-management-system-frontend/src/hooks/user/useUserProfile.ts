"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { userApi } from "@/api/endpoints/user.api";
import type { OnboardingRequest, UserProfile } from "@/types/user.types";

import { getApiErrorMessage, getApiMessage, unwrapApiData } from "./userQuery.utils";

const profileQueryKey: string[] = ["user", "profile"];
const dashboardQueryKey: string[] = ["user", "dashboard"];

export function useProfileQuery() {
  return useQuery({
    queryKey: profileQueryKey,
    queryFn: async () => {
      const response = await userApi.getProfile();
      return unwrapApiData<UserProfile>(response);
    },
  });
}

export function useCompleteOnboardingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OnboardingRequest) => userApi.completeOnboarding(data),
    onSuccess: async (response) => {
      toast.success(getApiMessage(response, "Onboarding completed successfully."));
      await queryClient.invalidateQueries({ queryKey: profileQueryKey });
      await queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to complete onboarding."));
    },
  });
}
