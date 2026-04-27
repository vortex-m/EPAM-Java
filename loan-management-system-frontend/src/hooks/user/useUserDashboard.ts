"use client";

import { useQuery } from "@tanstack/react-query";

import { userApi } from "@/api/endpoints/user.api";
import type { DashboardData } from "@/types/user.types";

import { unwrapApiData } from "./userQuery.utils";

const dashboardQueryKey: string[] = ["user", "dashboard"];

export function useDashboardQuery() {
  return useQuery({
    queryKey: dashboardQueryKey,
    queryFn: async () => {
      const response = await userApi.getDashboard();
      return unwrapApiData<DashboardData>(response);
    },
  });
}
