"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { z } from "zod";

import { OtpInput6 } from "@/app/(dashboard)/agent/_components/OtpInput6";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGenerateCollectionOtpMutation, useVerifyCollectionOtpMutation } from "@/hooks/agent/useAgentCashOtp";
import { useAgentLoanEmisQuery } from "@/hooks/agent/useAgentLoans";
import { useAgentTaskDetailQuery, useStartTaskMutation } from "@/hooks/agent/useAgentTasks";
import { formatIndianCurrency } from "@/lib/agent.utils";
import { TaskStatus } from "@/types/agent.types";

const schema = z.object({
  loanId: z.number().int().positive(),
  emiScheduleId: z.number().int().positive(),
  collectionAmount: z.number().positive(),
  collectionPlannedAt: z.string().min(1),
  agentLatitude: z.number().min(-90).max(90),
  agentLongitude: z.number().min(-180).max(180),
});

export default function CollectionOtpGeneratePage() {
  const searchParams = useSearchParams();
  const taskIdFromQuery = Number(searchParams.get("taskId") ?? "0");

  const mutation = useGenerateCollectionOtpMutation();
  const verifyMutation = useVerifyCollectionOtpMutation();
  const startTaskMutation = useStartTaskMutation();
  const taskDetailQuery = useAgentTaskDetailQuery(taskIdFromQuery > 0 ? taskIdFromQuery : undefined);

  const task = taskDetailQuery.data;
  const selectedLoanId = Number(task?.loanId ?? 0);
  const emisQuery = useAgentLoanEmisQuery(selectedLoanId > 0 ? selectedLoanId : undefined);

  const [emiScheduleId, setEmiScheduleId] = useState<string>("");
  const [collectionAmount, setCollectionAmount] = useState("");
  const [collectionPlannedAt, setCollectionPlannedAt] = useState("");
  const [agentLatitude, setAgentLatitude] = useState("");
  const [agentLongitude, setAgentLongitude] = useState("");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [otpInput, setOtpInput] = useState("");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [lastGeneratedOtpId, setLastGeneratedOtpId] = useState<number | null>(null);
  const [verifySuccess, setVerifySuccess] = useState(false);

  const otp = mutation.data?.data as { otpId?: number; expiresAt?: string; maxAttempts?: number } | undefined;

  const emiRows = useMemo(() => emisQuery.data ?? [], [emisQuery.data]);
  const selectedEmi = useMemo(
    () => emiRows.find((item) => String(item.emiScheduleId) === emiScheduleId),
    [emiRows, emiScheduleId],
  );

  const selectedEmiOutstanding = selectedEmi?.outstandingDueAmount ?? selectedEmi?.remainingAmount ?? selectedEmi?.emiAmount ?? null;

  useEffect(() => {
    const taskEmi = task?.nextEmiScheduleId;
    if (!emiScheduleId && taskEmi && Number(taskEmi) > 0) {
      setEmiScheduleId(String(taskEmi));
    }
  }, [task?.nextEmiScheduleId, emiScheduleId]);

  useEffect(() => {
    if (selectedEmiOutstanding != null && Number(selectedEmiOutstanding) > 0) {
      setCollectionAmount(String(selectedEmiOutstanding));
      return;
    }

    const nextOutstanding = task?.nextEmiOutstandingAmount;
    if (nextOutstanding != null && Number(nextOutstanding) > 0) {
      setCollectionAmount(String(nextOutstanding));
    }
  }, [selectedEmiOutstanding, task?.nextEmiOutstandingAmount]);

  useEffect(() => {
    if (!otp?.expiresAt) return;
    const tick = () => setSeconds(Math.max(0, Math.floor((new Date(otp.expiresAt as string).getTime() - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [otp?.expiresAt]);

  const getGps = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setAgentLatitude(String(position.coords.latitude));
      setAgentLongitude(String(position.coords.longitude));
    });
  };

  const submit = async () => {
    if (taskIdFromQuery <= 0) {
      setError("Task ID is missing. Open this page from Tasks using Take EMI.");
      return;
    }

    if (!task) {
      setError("Unable to load task details.");
      return;
    }

    if (!task.loanId || Number(task.loanId) <= 0) {
      setError("Loan ID is missing on task.");
      return;
    }

    if (task.taskStatus === TaskStatus.ASSIGNED) {
      setError("Please accept the task from Tasks page first.");
      return;
    }

    if (task.taskStatus === TaskStatus.COMPLETED || task.taskStatus === TaskStatus.DECLINED) {
      setError(`Task is not active: ${task.taskStatus}.`);
      return;
    }

    const parsed = schema.safeParse({
      loanId: Number(task.loanId),
      emiScheduleId: Number(emiScheduleId),
      collectionAmount: Number(collectionAmount),
      collectionPlannedAt,
      agentLatitude: Number(agentLatitude),
      agentLongitude: Number(agentLongitude),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid fields");
      return;
    }

    if (task.taskStatus === TaskStatus.ACCEPTED) {
      await startTaskMutation.mutateAsync(taskIdFromQuery);
      await taskDetailQuery.refetch();
    }

    setError("");
    const generated = await mutation.mutateAsync({ taskId: taskIdFromQuery, ...parsed.data });
    const otpId = Number((generated.data as { otpId?: number } | undefined)?.otpId ?? 0);
    if (otpId > 0) {
      setLastGeneratedOtpId(otpId);
      setOtpInput("");
      setVerifyError("");
      setVerifySuccess(false);
      setOtpModalOpen(true);
    }
  };

  const verifyOtp = async () => {
    const lat = Number(agentLatitude);
    const lon = Number(agentLongitude);
    const collection = Number(collectionAmount);
    const otpId = Number(lastGeneratedOtpId ?? otp?.otpId ?? 0);

    if (!otpId || otpId <= 0) {
      setVerifyError("OTP ID is missing. Please generate OTP again.");
      return;
    }
    if (otpInput.length !== 6) {
      setVerifyError("Please enter a valid 6-digit OTP.");
      return;
    }
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) {
      setVerifyError("Valid GPS coordinates are required.");
      return;
    }
    if (taskIdFromQuery <= 0) {
      setVerifyError("Task ID is missing.");
      return;
    }
    if (!Number.isFinite(collection) || collection <= 0) {
      setVerifyError("Collection amount must be greater than 0.");
      return;
    }

    setVerifyError("");
    await verifyMutation.mutateAsync({
      otpId,
      taskId: taskIdFromQuery,
      collectionAmount: collection,
      otp: otpInput,
      agentLatitude: lat,
      agentLongitude: lon,
    });

    await Promise.all([
      emisQuery.refetch(),
      taskDetailQuery.refetch(),
    ]);

    setVerifySuccess(true);
  };

  return (
    <Card className="py-0">
      <CardHeader className="border-b px-4 py-3"><CardTitle>Generate Collection OTP</CardTitle></CardHeader>
      <CardContent className="space-y-3 px-4 py-4">
        <p className="text-sm text-muted-foreground">Task ID: {taskIdFromQuery || "-"}</p>
        <p className="text-xs text-muted-foreground">Task status: {task?.taskStatus ?? "-"}</p>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>User</Label>
            <Input readOnly value={task?.userName ?? "-"} />
          </div>
          <div className="space-y-2">
            <Label>Loan</Label>
            <Input readOnly value={task?.loanNumber ?? "-"} />
          </div>
          <div className="space-y-2">
            <Label>EMI Row</Label>
            <Select value={emiScheduleId} onValueChange={setEmiScheduleId}>
              <SelectTrigger>
                <SelectValue placeholder={selectedLoanId ? "Select EMI" : "Waiting for task loan"} />
              </SelectTrigger>
              <SelectContent>
                {emiRows.map((emi) => (
                  <SelectItem key={emi.emiScheduleId} value={String(emi.emiScheduleId)}>
                    EMI {emi.emiNumber ?? "-"} | {emi.emiStatus} | Due {emi.dueDate ?? "-"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Collection Amount</Label><Input type="number" value={collectionAmount} onChange={(e) => setCollectionAmount(e.target.value)} /></div>
          <div className="space-y-2"><Label>Planned At</Label><Input type="datetime-local" value={collectionPlannedAt} onChange={(e) => setCollectionPlannedAt(e.target.value)} /></div>
          <div className="space-y-2"><Label>Latitude</Label><Input value={agentLatitude} readOnly /></div>
          <div className="space-y-2"><Label>Longitude</Label><Input value={agentLongitude} readOnly /></div>
        </div>

        <Button variant="outline" onClick={getGps}>Get Current Location</Button>
        {collectionAmount ? <p className="text-sm">Amount: {formatIndianCurrency(Number(collectionAmount))}</p> : null}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}

        <Button
          onClick={submit}
          disabled={
            mutation.isPending ||
            startTaskMutation.isPending ||
            taskDetailQuery.isLoading ||
            emisQuery.isLoading ||
            !task ||
            !task.loanId
          }
        >
          {mutation.isPending || startTaskMutation.isPending ? "Generating..." : "Take EMI (Generate OTP)"}
        </Button>

        {otp?.otpId ? (
          <div className="rounded-md border p-3">
            <p>OTP ID: {lastGeneratedOtpId ?? otp.otpId}</p>
            <p>Expires in: {seconds}s</p>
            <p>Max Attempts: {otp.maxAttempts ?? "-"}</p>
            <Button variant="outline" onClick={() => setOtpModalOpen(true)}>Enter OTP</Button>
          </div>
        ) : null}

        <Dialog open={otpModalOpen} onOpenChange={setOtpModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Collection OTP</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">OTP ID: {lastGeneratedOtpId ?? otp?.otpId ?? "-"}</p>
              <OtpInput6 value={otpInput} onChange={setOtpInput} />
              <p className="text-sm">Amount: {formatIndianCurrency(Number(collectionAmount || 0))}</p>
              {verifyError ? <p className="text-xs text-destructive">{verifyError}</p> : null}
              <Button onClick={verifyOtp} disabled={verifyMutation.isPending || otpInput.length !== 6}>
                {verifyMutation.isPending ? "Verifying..." : "Verify OTP & Post Payment"}
              </Button>
              {verifySuccess ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 text-xs">
                  <p>Payment posted successfully.</p>
                  <p>Task Status: {taskDetailQuery.data?.taskStatus ?? "-"}</p>
                  <p>Completed At: {taskDetailQuery.data?.completedAt ?? "-"}</p>
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
