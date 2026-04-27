"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAgentTasksQuery, useDeclineTaskMutation } from "@/hooks/agent/useAgentTasks";

const schema = z.object({ reason: z.string().min(10, "Reason must be at least 10 characters.") });

export default function AgentTaskDeclinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = Number(searchParams.get("taskId") ?? "0");

  const tasksQuery = useAgentTasksQuery();
  const declineMutation = useDeclineTaskMutation();

  const task = useMemo(() => (tasksQuery.data ?? []).find((t) => t.taskId === taskId), [tasksQuery.data, taskId]);

  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (tasksQuery.isLoading) return <Skeleton className="h-56" />;
  if (!task) return <Card><CardContent className="p-4 text-sm text-destructive">Task not found.</CardContent></Card>;

  const submit = async () => {
    const parsed = schema.safeParse({ reason });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid reason");
      return;
    }

    setError("");
    await declineMutation.mutateAsync({ taskId: task.taskId, reason: parsed.data.reason });
    router.push("/agent/tasks");
  };

  return (
    <Card className="py-0">
      <CardHeader className="border-b px-4 py-3"><CardTitle>Decline Task</CardTitle></CardHeader>
      <CardContent className="space-y-3 px-4 py-4">
        <p>Code: {task.taskCode}</p>
        <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Enter decline reason" />
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <Button variant="destructive" onClick={submit} disabled={declineMutation.isPending}>
          {declineMutation.isPending ? "Declining..." : "Decline Task"}
        </Button>
      </CardContent>
    </Card>
  );
}
