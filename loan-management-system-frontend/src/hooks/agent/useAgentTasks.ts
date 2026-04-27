"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { agentApi } from "@/api/endpoints/agent.api";
import type {
  AgentTask,
  GetTasksParams,
} from "@/types/agent.types";

import { getAgentApiMessage, getAgentErrorMessage, unwrapAgentData } from "./agentQuery.utils";

const taskKey = (params?: GetTasksParams) => ["agent", "tasks", params?.status ?? "ALL", params?.taskType ?? "ALL"] as const;
const dashboardKey = ["agent", "dashboard"] as const;

const VERIFICATION_TASK_TYPES = ["VERIFICATION", "LOAN_VERIFICATION"] as const;

function normalizeTaskFilters(params?: GetTasksParams) {
  if (!params) return undefined;

  const normalizedStatus = params.status && params.status !== "ALL" ? params.status : undefined;
  const normalizedTaskType = params.taskType && params.taskType !== "ALL"
    ? (params.taskType === "LOAN_VERIFICATION" ? "VERIFICATION" : params.taskType)
    : undefined;

  if (!normalizedStatus && !normalizedTaskType) return undefined;

  return {
    ...(normalizedStatus ? { status: normalizedStatus } : {}),
    ...(normalizedTaskType ? { taskType: normalizedTaskType } : {}),
  };
}

export function useAgentTasksQuery(params?: GetTasksParams) {
  return useQuery({
    queryKey: taskKey(params),
    queryFn: async () => {
      const parseTasks = (response: Awaited<ReturnType<typeof agentApi.getTasks>>) => {
        const data = unwrapAgentData<AgentTask[] | { tasks?: AgentTask[] }>(response);
        if (Array.isArray(data)) return data;
        return data.tasks ?? [];
      };

      const normalizedFilters = normalizeTaskFilters(params);
      const response = await agentApi.getTasks(normalizedFilters);
      const primaryTasks = parseTasks(response);

      const requestedTaskType = normalizedFilters?.taskType;
      const isVerificationFilter = requestedTaskType
        ? VERIFICATION_TASK_TYPES.includes(requestedTaskType as (typeof VERIFICATION_TASK_TYPES)[number])
        : false;

      if (!isVerificationFilter || primaryTasks.length > 0 || !requestedTaskType) {
        return primaryTasks;
      }

      const fallbackTaskType =
        requestedTaskType === "VERIFICATION" ? "LOAN_VERIFICATION" : "VERIFICATION";

      const fallbackResponse = await agentApi.getTasks({
        ...(normalizedFilters?.status ? { status: normalizedFilters.status } : {}),
        taskType: fallbackTaskType,
      });

      const fallbackTasks = parseTasks(fallbackResponse);
      const mergedTasks = [...primaryTasks, ...fallbackTasks];

      return mergedTasks.filter(
        (task, index, array) => array.findIndex((item) => item.taskId === task.taskId) === index,
      );
    },
  });
}

export function useAgentTaskDetailQuery(taskId?: number) {
  return useQuery({
    queryKey: ["agent", "tasks", "detail", taskId ?? 0],
    enabled: Boolean(taskId && taskId > 0),
    queryFn: async () => {
      const response = await agentApi.getTaskDetail(taskId as number);
      return unwrapAgentData<AgentTask>(response);
    },
  });
}

export function useAcceptTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: number | string) => agentApi.acceptTask(taskId),
    onSuccess: async (response) => {
      toast.success(getAgentApiMessage(response, "Task accepted."));
      await queryClient.invalidateQueries({ queryKey: ["agent", "tasks"] });
      await queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
    onError: (error) => toast.error(getAgentErrorMessage(error, "Unable to accept task.")),
  });
}

export function useStartTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: number | string) => agentApi.startTask(taskId),
    onSuccess: async (response) => {
      toast.success(getAgentApiMessage(response, "Task started."));
      await queryClient.invalidateQueries({ queryKey: ["agent", "tasks"] });
      await queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
    onError: (error) => toast.error(getAgentErrorMessage(error, "Unable to start task.")),
  });
}

export function useCompleteTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: number | string) => agentApi.completeTask(taskId),
    onSuccess: async (response) => {
      toast.success(getAgentApiMessage(response, "Task completed."));
      await queryClient.invalidateQueries({ queryKey: ["agent", "tasks"] });
      await queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
    onError: (error) => toast.error(getAgentErrorMessage(error, "Unable to complete task.")),
  });
}

export function useDeclineTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { taskId: number | string; reason: string }) =>
      agentApi.declineTask(data.taskId, { reason: data.reason }),
    onSuccess: async (response) => {
      toast.success(getAgentApiMessage(response, "Task declined."));
      await queryClient.invalidateQueries({ queryKey: ["agent", "tasks"] });
      await queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
    onError: (error) => toast.error(getAgentErrorMessage(error, "Unable to decline task.")),
  });
}
