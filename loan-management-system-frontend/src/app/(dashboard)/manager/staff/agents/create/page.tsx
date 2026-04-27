"use client";

import { UserPlus } from "lucide-react";

import { ManagerStaffCreateForm } from "@/components/manager/ManagerStaffCreateForm";
import { useCreateAgentStaffMutation } from "@/hooks/manager/useManagerWorkflow";

export default function ManagerCreateAgentPage() {
  const mutation = useCreateAgentStaffMutation();

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border/80 bg-fintech-surface bg-fintech-glow p-5">
        <div className="flex items-center gap-3">
          <UserPlus className="size-5 text-emerald-600" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Create Field Agent</h1>
            <p className="text-sm text-muted-foreground">
              Register a new agent for field verification and collections.
            </p>
          </div>
        </div>
      </div>

      <ManagerStaffCreateForm
        title="Agent Details"
        description="Fill in the agent's personal and location information."
        roleHint="AGENT"
        loading={mutation.isPending}
        onSubmit={(payload) => mutation.mutateAsync(payload)}
      />
    </div>
  );
}
