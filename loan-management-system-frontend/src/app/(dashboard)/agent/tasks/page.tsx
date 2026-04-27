"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownCircle,
  CheckCircle2,
  HandCoins,
  FileSearch,
} from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAcceptTaskMutation,
  useAgentTasksQuery,
  useStartTaskMutation,
} from "@/hooks/agent/useAgentTasks";
import {
  formatDateDisplay,
  getTaskStatusBadgeVariant,
  getTaskTypeBadgeVariant,
  isTaskOverdue,
} from "@/lib/agent.utils";
import {
  TaskStatus,
  TaskType,
  type GetTasksParams,
  type TaskType as TaskTypeValue,
} from "@/types/agent.types";

const statusOptions = ["ALL", ...Object.values(TaskStatus)] as const;

const taskTypeTabs = [
  { value: "ALL", label: "All Tasks" },
  { value: TaskType.VERIFICATION, label: "Verification" },
  { value: TaskType.CASH_COLLECTION, label: "Cash Collection" },
  { value: TaskType.DOCUMENT_PICKUP, label: "Document Pickup" },
  { value: TaskType.CASH_DISBURSAL, label: "Cash Disbursal" },
  { value: TaskType.FOLLOW_UP, label: "Follow Up" },
] as const;

type TabValue = (typeof taskTypeTabs)[number]["value"];

export default function AgentTasksPage() {
  const router = useRouter();
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [activeType, setActiveType] = useState<TabValue>("ALL");
  const [activeStatus, setActiveStatus] =
    useState<GetTasksParams["status"]>("ALL");

  const queryTaskType: GetTasksParams["taskType"] =
    activeType === "ALL" ? "ALL" : activeType;

  const tasksQuery = useAgentTasksQuery({
    status: activeStatus,
    taskType: queryTaskType,
  });
  const acceptTaskMutation = useAcceptTaskMutation();
  const startTaskMutation = useStartTaskMutation();

  const tasks = useMemo(() => {
    const incoming = tasksQuery.data ?? [];
    if (activeType === TaskType.VERIFICATION) {
      return incoming.filter(
        (task) =>
          task.taskType === TaskType.VERIFICATION ||
          task.taskType === TaskType.LOAN_VERIFICATION,
      );
    }
    return incoming;
  }, [tasksQuery.data, activeType]);

  const onAccept = async (taskId: number) => {
    setActiveTaskId(taskId);
    await acceptTaskMutation.mutateAsync(taskId);
    await tasksQuery.refetch();
  };

  const onStart = async (taskId: number) => {
    setActiveTaskId(taskId);
    await startTaskMutation.mutateAsync(taskId);
    await tasksQuery.refetch();
  };

  const onTakeEmi = async (taskId: number, taskStatus: string) => {
    setActiveTaskId(taskId);

    if (taskStatus === TaskStatus.ACCEPTED) {
      await startTaskMutation.mutateAsync(taskId);
    }

    router.push(`/agent/cash-otp/collection/generate?taskId=${taskId}`);
  };

  const gotoVerification = (taskId: number) => {
    setActiveTaskId(taskId);
    router.push(`/agent/verification?taskId=${taskId}`);
  };

  if (tasksQuery.isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (tasksQuery.isError) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-destructive">
          Unable to load tasks.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="pt-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Agent Task Center</CardTitle>
          <p className="text-sm text-muted-foreground">
            Use task-type tabs for quick routing and status filter for queue
            control.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pb-5 flex justify-between w-full items-center">
          <Tabs
            value={activeType}
            onValueChange={(value) => setActiveType(value as TabValue)}
          >
            <TabsList className="h-auto w-full flex-wrap justify-start gap-2 border border-border bg-muted/70 ">
              {taskTypeTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-md border border-transparent px-3 py-3 text-xs font-semibold text-muted-foreground data-active:border-border shadow-none data-active:bg-background data-active:text-foreground"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="ml-auto min-w-56">
            <Select
              value={activeStatus ?? "ALL"}
              onValueChange={(value) =>
                setActiveStatus(value as GetTasksParams["status"])
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description="Try switching task type or status filters."
        />
      ) : (
        <Card className="overflow-hidden border-border py-0">
          <CardContent className="px-0 py-0">
            <Table>
              <TableHeader className="bg-muted/60">
                <TableRow>
                  <TableHead className="pl-4">Task</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Loan</TableHead>
                  <TableHead>EMI</TableHead>
                  {/* <TableHead>Due Date</TableHead> */}
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const status = getTaskStatusBadgeVariant(task.taskStatus);
                  const type = getTaskTypeBadgeVariant(
                    task.taskType as TaskTypeValue,
                  );
                  const overdue = isTaskOverdue(task.deadline);
                  const isCashCollection =
                    task.taskType === TaskType.CASH_COLLECTION;
                  const isVerificationTask =
                    task.taskType === TaskType.LOAN_VERIFICATION ||
                    task.taskType === TaskType.VERIFICATION;
                  const isDisbursalTask =
                    task.taskType === TaskType.CASH_DISBURSAL;
                  const canAccept = task.taskStatus === TaskStatus.ASSIGNED;
                  const canStart = task.taskStatus === TaskStatus.ACCEPTED;
                  const canTake =
                    isCashCollection &&
                    (task.taskStatus === TaskStatus.ACCEPTED ||
                      task.taskStatus === TaskStatus.IN_PROGRESS);
                  const isCollectionCompleted =
                    isCashCollection &&
                    task.taskStatus === TaskStatus.COMPLETED;
                  const isVerificationCompleted =
                    isVerificationTask &&
                    task.taskStatus === TaskStatus.COMPLETED;
                  const canOpenVerification =
                    isVerificationTask &&
                    (task.taskStatus === TaskStatus.ACCEPTED ||
                      task.taskStatus === TaskStatus.IN_PROGRESS);

                  return (
                    <TableRow key={task.taskId} className="align-top">
                      <TableCell className="pl-4">
                        <div className="flex flex-col gap-1.5">
                          <Badge
                            variant="outline"
                            className="w-fit font-mono text-xs"
                          >
                            {task.taskCode}
                          </Badge>
                          <Badge
                            className={
                              type.label.includes("Verification")
                                ? "w-fit bg-purple-100 text-purple-800"
                                : type.label.includes("Disbursal")
                                  ? "w-fit bg-sky-100 text-sky-800"
                                  : type.label.includes("Collection")
                                    ? "w-fit bg-emerald-100 text-emerald-800"
                                    : "w-fit bg-slate-100 text-slate-800"
                            }
                          >
                            {type.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground">
                          {task.userName ?? "-"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {task.userPhone ?? "-"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground">
                          {task.loanNumber ?? "-"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          App: {task.applicationNumber ?? "-"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p>{task.loanEmiAmount ?? "-"}</p>
                        <p className="text-xs text-muted-foreground">
                          Outstanding: {task.nextEmiOutstandingAmount ?? "-"}
                        </p>
                      </TableCell>
                      {/* <TableCell>
                        {formatDateDisplay(task.nextEmiDueDate ?? null)}
                      </TableCell> */}
                      <TableCell>
                        <Badge
                          variant={status.variant}
                          className={status.color}
                        >
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            task.priorityLevel === "HIGH"
                              ? "bg-red-100 text-red-800"
                              : task.priorityLevel === "MEDIUM"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-green-100 text-green-800"
                          }
                        >
                          {task.priorityLevel}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={
                          overdue ? "text-red-600" : "text-muted-foreground"
                        }
                      >
                        {formatDateDisplay(task.deadline)}
                        {overdue ? " (Overdue)" : ""}
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          {canAccept ? (
                            <Button
                              size="sm"
                              className="bg-emerald-600 text-white"
                              onClick={() => onAccept(task.taskId)}
                              disabled={acceptTaskMutation.isPending}
                            >
                              Accept
                            </Button>
                          ) : null}

                          {canStart && !isCashCollection ? (
                            <Button
                              size="sm"
                              className="bg-blue-600 text-white"
                              onClick={() => onStart(task.taskId)}
                              disabled={startTaskMutation.isPending}
                            >
                              Start
                            </Button>
                          ) : null}

                          {isVerificationCompleted ? (
                            <Button size="sm" variant="secondary" disabled>
                              <CheckCircle2 className="size-4" /> Verified
                            </Button>
                          ) : null}

                          {canOpenVerification ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => gotoVerification(task.taskId)}
                            >
                              <FileSearch className="size-4" /> Verification
                            </Button>
                          ) : null}

                          {isDisbursalTask ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(
                                  `/agent/cash-distribution?taskId=${task.taskId}`,
                                )
                              }
                            >
                              <HandCoins className="size-4" /> Cash Distribution
                            </Button>
                          ) : null}

                          {isCollectionCompleted ? (
                            <Button size="sm" variant="secondary" disabled>
                              <CheckCircle2 className="size-4" /> Collected
                            </Button>
                          ) : null}

                          {isCashCollection && !isCollectionCompleted ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                onTakeEmi(task.taskId, task.taskStatus)
                              }
                              disabled={!canTake || startTaskMutation.isPending}
                            >
                              <ArrowDownCircle className="size-4" /> Take EMI
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTaskId ? (
        <p className="text-xs text-muted-foreground">
          Active task: #{activeTaskId}
        </p>
      ) : null}
    </div>
  );
}
