"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgentTasksQuery, useCompleteTaskMutation } from "@/hooks/agent/useAgentTasks";
import { TaskType } from "@/types/agent.types";

export default function AgentTaskCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = Number(searchParams.get("taskId") ?? "0");

  const tasksQuery = useAgentTasksQuery();
  const completeMutation = useCompleteTaskMutation();

  const task = useMemo(() => (tasksQuery.data ?? []).find((t) => t.taskId === taskId), [tasksQuery.data, taskId]);

  if (tasksQuery.isLoading) return <Skeleton className="h-56" />;
  if (!task) return <Card><CardContent className="p-4 text-sm text-destructive">Task not found.</CardContent></Card>;

  const warning =
    task.taskType === TaskType.LOAN_VERIFICATION
      ? "Ensure verification report is submitted."
      : task.taskType === TaskType.CASH_DISBURSAL
        ? "Ensure disbursal OTP is verified."
        : "Ensure collection OTP is verified.";

  return (
    <Card className="py-0">
      <CardHeader className="border-b px-4 py-3"><CardTitle>Complete Task</CardTitle></CardHeader>
      <CardContent className="space-y-3 px-4 py-4">
        <p>Code: {task.taskCode}</p>
        <p className="text-sm text-amber-700">Checklist: {warning}</p>
        <Button
          onClick={async () => {
            await completeMutation.mutateAsync(task.taskId);
            router.push("/agent/tasks");
          }}
          disabled={completeMutation.isPending}
        >
          {completeMutation.isPending ? "Completing..." : "Mark Complete"}
        </Button>
      </CardContent>
    </Card>
  );
}
