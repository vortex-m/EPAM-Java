"use client";

import { useQuery } from "@tanstack/react-query";

import { agentApi } from "@/api/endpoints/agent.api";
import { AgentAvailability, type AgentAvailability as AgentAvailabilityType } from "@/types/agent.types";
import type { AgentDashboardData } from "@/types/agent.types";

import { unwrapAgentData } from "./agentQuery.utils";

const dashboardKey = ["agent", "dashboard"] as const;

export function useAgentDashboardQuery() {
  return useQuery({
    queryKey: dashboardKey,
    queryFn: async () => {
      const response = await agentApi.getDashboard();
      const data = unwrapAgentData<AgentDashboardData & { agentAvailability?: AgentAvailabilityType }>(response);
      return {
        ...data,
        availability: data.availability ?? data.agentAvailability ?? AgentAvailability.BUSY,
      };
    },
  });
}
