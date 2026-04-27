"use client";

import { Briefcase } from "lucide-react";

import { ManagerStaffCreateForm } from "@/components/manager/ManagerStaffCreateForm";
import { useCreateOfficerStaffMutation } from "@/hooks/manager/useManagerWorkflow";

export default function ManagerCreateOfficerPage() {
  const mutation = useCreateOfficerStaffMutation();

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border/80 bg-fintech-surface bg-fintech-glow p-5">
        <div className="flex items-center gap-3">
          <Briefcase className="size-5 text-sky-600" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Create Loan Officer</h1>
            <p className="text-sm text-muted-foreground">
              Provision an officer account for KYC review and first-level loan processing.
            </p>
          </div>
        </div>
      </div>

      <ManagerStaffCreateForm
        title="Officer Details"
        description="Fill in the officer's personal and contact information."
        roleHint="OFFICER"
        loading={mutation.isPending}
        onSubmit={(payload) => mutation.mutateAsync(payload)}
      />
    </div>
  );
}
