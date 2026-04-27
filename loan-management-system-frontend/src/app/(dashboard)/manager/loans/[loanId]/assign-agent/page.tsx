"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, RefreshCw, UserCheck, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useManagerAssignAgentMutation,
  useManagerReassignAgentMutation,
} from "@/hooks/manager/useManagerWorkflow";

export default function ManagerAssignAgentPage() {
  const params = useParams<{ loanId: string }>();
  const loanId = Number(params.loanId);

  const assignMutation = useManagerAssignAgentMutation();
  const reassignMutation = useManagerReassignAgentMutation();

  const [assignForm, setAssignForm] = useState({ agentId: "", remarks: "" });
  const [reassignForm, setReassignForm] = useState({ agentId: "", reason: "" });

  const handleAssign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await assignMutation.mutateAsync({
      loanId,
      payload: { agentId: Number(assignForm.agentId), remarks: assignForm.remarks },
    });
    setAssignForm({ agentId: "", remarks: "" });
  };

  const handleReassign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await reassignMutation.mutateAsync({
      loanId,
      payload: { agentId: Number(reassignForm.agentId), reason: reassignForm.reason },
    });
    setReassignForm({ agentId: "", reason: "" });
  };

  return (
    <div className="space-y-5">
      {/* ── Page header ──────────────────────────────── */}
      <div className="rounded-xl border border-border/80 bg-fintech-surface bg-fintech-glow p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <UserCheck className="size-5 text-primary" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Agent Assignment
              </h1>
              <p className="text-sm text-muted-foreground">
                Loan #{loanId} · Assign or reassign a field agent.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/manager/loans/${loanId}/review`}>
              <ArrowLeft className="mr-1.5 size-3.5" />
              Back to Review
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ── Assign agent ────────────────────────────── */}
        <Card className="border-border/80 bg-card/85 py-0 shadow-sm">
          <CardHeader className="border-b border-border/60 px-4 py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="size-4 text-emerald-600" />
              Assign Agent
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Assign a field agent for fresh verification.
            </p>
          </CardHeader>
          <CardContent className="px-4 py-4">
            <form className="space-y-4" onSubmit={handleAssign}>
              <div className="space-y-2">
                <Label htmlFor="assignAgentId">Agent ID</Label>
                <Input
                  id="assignAgentId"
                  type="number"
                  min={1}
                  placeholder="Enter agent's user ID"
                  value={assignForm.agentId}
                  onChange={(e) =>
                    setAssignForm((prev) => ({
                      ...prev,
                      agentId: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignRemarks">Remarks (optional)</Label>
                <Textarea
                  id="assignRemarks"
                  rows={3}
                  value={assignForm.remarks}
                  onChange={(e) =>
                    setAssignForm((prev) => ({
                      ...prev,
                      remarks: e.target.value,
                    }))
                  }
                  placeholder="Assigning due to pending address verification."
                />
              </div>
              <Button
                type="submit"
                disabled={assignMutation.isPending}
                className="w-full sm:w-auto"
              >
                <UserPlus className="mr-1.5 size-4" />
                {assignMutation.isPending ? "Assigning…" : "Assign Agent"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Reassign agent ───────────────────────────── */}
        <Card className="border-border/80 bg-card/85 py-0 shadow-sm">
          <CardHeader className="border-b border-border/60 px-4 py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCw className="size-4 text-amber-600" />
              Reassign Agent
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Move this task to a different agent with a documented reason.
            </p>
          </CardHeader>
          <CardContent className="px-4 py-4">
            <form className="space-y-4" onSubmit={handleReassign}>
              <div className="space-y-2">
                <Label htmlFor="reassignAgentId">New Agent ID</Label>
                <Input
                  id="reassignAgentId"
                  type="number"
                  min={1}
                  placeholder="Enter new agent's user ID"
                  value={reassignForm.agentId}
                  onChange={(e) =>
                    setReassignForm((prev) => ({
                      ...prev,
                      agentId: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reassignReason">Reason *</Label>
                <Textarea
                  id="reassignReason"
                  rows={3}
                  value={reassignForm.reason}
                  onChange={(e) =>
                    setReassignForm((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  placeholder="Current agent is unavailable in the assigned region."
                  required
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                disabled={reassignMutation.isPending}
                className="w-full border-amber-500/30 text-amber-700 hover:bg-amber-50 dark:text-amber-400 sm:w-auto"
              >
                <RefreshCw className="mr-1.5 size-4" />
                {reassignMutation.isPending ? "Reassigning…" : "Reassign Agent"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
