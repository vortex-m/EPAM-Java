"use client";

import { Building2 } from "lucide-react";

import { ManagerStaffCreateForm } from "@/components/manager/ManagerStaffCreateForm";
import { useCreateManagerStaffMutation } from "@/hooks/manager/useManagerWorkflow";

export default function ManagerCreateManagerPage() {
  const mutation = useCreateManagerStaffMutation();

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border/80 bg-fintech-surface bg-fintech-glow p-5">
        <div className="flex items-center gap-3">
          <Building2 className="size-5 text-violet-600" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Create Manager</h1>
            <p className="text-sm text-muted-foreground">
              Create a manager user and assign them to a department (Compliance, Audit, Fraud, etc.).
            </p>
          </div>
        </div>
      </div>

      <ManagerStaffCreateForm
        title="Manager Details"
        description="Fill in the manager's personal information and select their department."
        roleHint="MANAGER"
        includeDepartment
        loading={mutation.isPending}
        onSubmit={(payload) => mutation.mutateAsync(payload)}
      />
    </div>
  );
}
