"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgentTasksQuery, useStartTaskMutation } from "@/hooks/agent/useAgentTasks";
import { formatDateDisplay } from "@/lib/agent.utils";

export default function AgentTaskStartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = Number(searchParams.get("taskId") ?? "0");

  const tasksQuery = useAgentTasksQuery();
  const startMutation = useStartTaskMutation();

  const task = useMemo(() => (tasksQuery.data ?? []).find((t) => t.taskId === taskId), [tasksQuery.data, taskId]);

  if (tasksQuery.isLoading) return <Skeleton className="h-56" />;
  if (!task) return <Card><CardContent className="p-4 text-sm text-destructive">Task not found.</CardContent></Card>;

  return (
    <Card className="py-0">
      <CardHeader className="border-b px-4 py-3"><CardTitle>Start Task</CardTitle></CardHeader>
      <CardContent className="space-y-3 px-4 py-4">
        <p>Code: {task.taskCode}</p>
        <p>Type: {task.taskType}</p>
        <p>Description: {task.description ?? "-"}</p>
        <p>Deadline: {formatDateDisplay(task.deadline)}</p>
        <Button
          onClick={async () => {
            await startMutation.mutateAsync(task.taskId);
            router.push("/agent/tasks");
          }}
          disabled={startMutation.isPending}
        >
          {startMutation.isPending ? "Starting..." : "Start Task"}
        </Button>
      </CardContent>
    </Card>
  );
}
