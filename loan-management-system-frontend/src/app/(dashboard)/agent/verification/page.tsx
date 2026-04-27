"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileSearch } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAgentTasksQuery, useStartTaskMutation } from "@/hooks/agent/useAgentTasks";
import { formatDateDisplay } from "@/lib/agent.utils";
import { TaskStatus, TaskType } from "@/types/agent.types";

export default function AgentVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preferredTaskId = Number(searchParams.get("taskId") ?? "0");

  const [activeTaskId, setActiveTaskId] = useState<number | null>(preferredTaskId > 0 ? preferredTaskId : null);

  const startTaskMutation = useStartTaskMutation();
  const tasksQuery = useAgentTasksQuery({ status: "ALL", taskType: TaskType.VERIFICATION });

  const verificationTasks = useMemo(() => {
    const incoming = tasksQuery.data ?? [];
    return incoming.filter(
      (task) => task.taskType === TaskType.VERIFICATION || task.taskType === TaskType.LOAN_VERIFICATION,
    );
  }, [tasksQuery.data]);

  const actionableTasks = useMemo(
    () => verificationTasks.filter((task) => task.taskStatus === TaskStatus.ACCEPTED || task.taskStatus === TaskStatus.IN_PROGRESS),
    [verificationTasks],
  );
  const completedTasks = useMemo(
    () => verificationTasks.filter((task) => task.taskStatus === TaskStatus.COMPLETED),
    [verificationTasks],
  );

  const openVerificationReport = async (taskId: number, taskStatus: string) => {
    setActiveTaskId(taskId);

    if (taskStatus === TaskStatus.ACCEPTED) {
      await startTaskMutation.mutateAsync(taskId);
    }

    router.push(`/agent/verification/report?taskId=${taskId}`);
  };

  if (tasksQuery.isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (tasksQuery.isError) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-destructive">Unable to load verification tasks.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle>User Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 py-4">
          <p className="text-sm text-muted-foreground">
            Execute field verification with the unified flow: Start task, submit report with images, and auto-complete.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">Ready: {actionableTasks.length}</Badge>
            <Badge variant="outline">Completed: {completedTasks.length}</Badge>
            <Badge variant="outline">Total Verification: {verificationTasks.length}</Badge>
          </div>
        </CardContent>
      </Card>

      {actionableTasks.length === 0 ? (
        <EmptyState
          title="No accepted verification tasks"
          description="Accept a verification task from Tasks page, then it will appear here."
        />
      ) : (
        <Card className="py-0">
          <CardContent className="px-0 py-0">
            <Table>
              <TableHeader className="bg-muted/60">
                <TableRow>
                  <TableHead className="pl-4">Task</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Loan / App</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="pr-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actionableTasks.map((task) => (
                  <TableRow key={task.taskId}>
                    <TableCell className="pl-4">
                      <div className="space-y-1">
                        <Badge variant="outline" className="font-mono text-xs">{task.taskCode}</Badge>
                        <p className="text-xs text-muted-foreground">{task.taskType}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{task.userName ?? "-"}</p>
                      <p className="text-xs text-muted-foreground">{task.userPhone ?? "-"}</p>
                    </TableCell>
                    <TableCell>
                      <p>{task.loanNumber ?? "-"}</p>
                      <p className="text-xs text-muted-foreground">App: {task.applicationNumber ?? "-"}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={task.taskStatus === TaskStatus.IN_PROGRESS ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}>
                        {task.taskStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateDisplay(task.deadline)}</TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button
                        size="sm"
                        variant={activeTaskId === task.taskId ? "default" : "outline"}
                        onClick={() => openVerificationReport(task.taskId, task.taskStatus)}
                        disabled={startTaskMutation.isPending}
                      >
                        <FileSearch className="size-4" /> Open Verification
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
