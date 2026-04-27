"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { OtpInput6 } from "@/app/(dashboard)/agent/_components/OtpInput6";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGenerateDisbursalOtpMutation, useVerifyDisbursalOtpMutation } from "@/hooks/agent/useAgentCashOtp";
import { useAcceptTaskMutation, useAgentTasksQuery, useStartTaskMutation } from "@/hooks/agent/useAgentTasks";
import { formatDateDisplay } from "@/lib/agent.utils";
import { TaskStatus, TaskType } from "@/types/agent.types";

export default function CashDistributionPage() {
  const searchParams = useSearchParams();
  const taskIdFromQuery = Number(searchParams.get("taskId") ?? "0");

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(taskIdFromQuery > 0 ? taskIdFromQuery : null);
  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(0);

  const tasksQuery = useAgentTasksQuery({ status: "ALL", taskType: TaskType.CASH_DISBURSAL });
  const acceptTaskMutation = useAcceptTaskMutation();
  const startTaskMutation = useStartTaskMutation();
  const generateMutation = useGenerateDisbursalOtpMutation();
  const verifyMutation = useVerifyDisbursalOtpMutation();

  const disbursalTasks = useMemo(
    () => (tasksQuery.data ?? []).filter((task) => task.taskType === TaskType.CASH_DISBURSAL),
    [tasksQuery.data],
  );

  const actionableTasks = useMemo(
    () => disbursalTasks.filter((task) => task.taskStatus === TaskStatus.ACCEPTED || task.taskStatus === TaskStatus.IN_PROGRESS),
    [disbursalTasks],
  );

  const effectiveSelectedTaskId = selectedTaskId ?? actionableTasks[0]?.taskId ?? null;

  const selectedTask = useMemo(
    () => disbursalTasks.find((task) => task.taskId === effectiveSelectedTaskId) ?? null,
    [disbursalTasks, effectiveSelectedTaskId],
  );

  const otpData = generateMutation.data?.data as { expiresAt?: string; otpStatus?: string; attempts?: number } | undefined;

  useEffect(() => {
    if (!otpData?.expiresAt) return;

    const tick = () => {
      const delta = Math.max(0, Math.floor((new Date(otpData.expiresAt as string).getTime() - Date.now()) / 1000));
      setSeconds(delta);
    };

    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [otpData?.expiresAt]);

  const acceptSelectedTask = async () => {
    if (!effectiveSelectedTaskId) return;
    await acceptTaskMutation.mutateAsync(effectiveSelectedTaskId);
    await tasksQuery.refetch();
  };

  const startSelectedTask = async () => {
    if (!effectiveSelectedTaskId) return;
    await startTaskMutation.mutateAsync(effectiveSelectedTaskId);
    await tasksQuery.refetch();
  };

  const generateOtp = async () => {
    if (!effectiveSelectedTaskId || !selectedTask) return;

    setSeconds(0);

    if (selectedTask.taskStatus === TaskStatus.ASSIGNED) {
      await acceptTaskMutation.mutateAsync(effectiveSelectedTaskId);
      await tasksQuery.refetch();
    }

    if (selectedTask.taskStatus === TaskStatus.ACCEPTED) {
      await startTaskMutation.mutateAsync(effectiveSelectedTaskId);
      await tasksQuery.refetch();
    }

    await generateMutation.mutateAsync({ taskId: effectiveSelectedTaskId });
  };

  const verifyOtp = async () => {
    if (!effectiveSelectedTaskId || otp.length !== 6) return;
    await verifyMutation.mutateAsync({ taskId: effectiveSelectedTaskId, otp });
    setOtp("");
    await tasksQuery.refetch();
  };

  if (tasksQuery.isLoading) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">Loading cash disbursal tasks...</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="soft-card py-0">
        <CardHeader>
          <CardTitle>Cash Distribution Desk</CardTitle>
          <p className="text-sm text-muted-foreground">Operate cash disbursal tasks here with task start, OTP generation, and customer OTP verification.</p>
        </CardHeader>
      </Card>

      {disbursalTasks.length === 0 ? (
        <EmptyState title="No cash disbursal tasks" description="No cash disbursal assignments found at the moment." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <Card className="soft-card py-0">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base">Accepted / In Progress Cash Disbursal Tasks</CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="pl-4">Task</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead className="pr-4 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actionableTasks.map((task) => (
                    <TableRow key={task.taskId}>
                      <TableCell className="pl-4">
                        <p className="font-medium">{task.taskCode}</p>
                        <p className="text-xs text-muted-foreground">{task.applicationNumber ?? "-"}</p>
                      </TableCell>
                      <TableCell>
                        <p>{task.userName ?? "-"}</p>
                        <p className="text-xs text-muted-foreground">{task.userPhone ?? "-"}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={task.taskStatus === TaskStatus.ACCEPTED ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}>
                          {task.taskStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateDisplay(task.deadline)}</TableCell>
                      <TableCell className="pr-4 text-right">
                        <Button size="sm" variant={effectiveSelectedTaskId === task.taskId ? "default" : "outline"} onClick={() => setSelectedTaskId(task.taskId)}>
                          Operate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="soft-card py-0">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base">Distribution Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {!selectedTask ? (
                <p className="text-sm text-muted-foreground">Select a task to run cash distribution flow.</p>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label>Task ID</Label>
                    <Input value={String(selectedTask.taskId)} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label>Loan Application</Label>
                    <Input value={selectedTask.applicationNumber ?? "-"} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label>Current Status</Label>
                    <Input value={selectedTask.taskStatus} readOnly />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedTask.taskStatus === TaskStatus.ASSIGNED ? (
                      <Button size="sm" onClick={acceptSelectedTask} disabled={acceptTaskMutation.isPending}>Accept</Button>
                    ) : null}

                    {selectedTask.taskStatus === TaskStatus.ACCEPTED ? (
                      <Button size="sm" variant="secondary" onClick={startSelectedTask} disabled={startTaskMutation.isPending}>Start</Button>
                    ) : null}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={generateOtp}
                      disabled={
                        generateMutation.isPending ||
                        acceptTaskMutation.isPending ||
                        startTaskMutation.isPending ||
                        selectedTask.taskStatus === TaskStatus.COMPLETED ||
                        selectedTask.taskStatus === TaskStatus.DECLINED
                      }
                    >
                      {generateMutation.isPending ? "Generating..." : "Generate OTP"}
                    </Button>
                  </div>

                  {otpData ? (
                    <div className="space-y-2 rounded-md border border-cyan-200 bg-cyan-50 p-3">
                      <p className="text-xs text-cyan-800">OTP sent to borrower email.</p>
                      <p className="text-xs text-cyan-900">Status: {otpData.otpStatus ?? "ACTIVE"}</p>
                      <p className="text-xs text-cyan-900">Attempts: {otpData.attempts ?? 0}</p>
                      <p className="text-xs text-cyan-900">Expires in: {seconds}s</p>
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <Label>Customer OTP</Label>
                    <OtpInput6 value={otp} onChange={setOtp} />
                    <Button size="sm" onClick={verifyOtp} disabled={verifyMutation.isPending || otp.length !== 6}>
                      {verifyMutation.isPending ? "Verifying..." : "Verify OTP and Complete Disbursal"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
