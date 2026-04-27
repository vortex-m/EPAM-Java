import { 
  LeadStatus,
  type AgentAvailability as AgentAvailabilityType,
  type LeadStatus as LeadStatusType,
  type TaskStatus as TaskStatusType,
  type TaskType as TaskTypeType,
} from "@/types/agent.types";

export function getTaskStatusBadgeVariant(status: TaskStatusType) {
  const map: Record<
    TaskStatusType,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
      color: string;
    }
  > = {
    ASSIGNED: {
      variant: "secondary",
      label: "Assigned",
      color: "bg-slate-100 text-slate-800",
    },
    ACCEPTED: {
      variant: "outline",
      label: "Accepted",
      color: "bg-blue-100 text-blue-800",
    },
    IN_PROGRESS: {
      variant: "outline",
      label: "In Progress",
      color: "bg-amber-100 text-amber-800",
    },
    COMPLETED: {
      variant: "default",
      label: "Completed",
      color: "bg-emerald-100 text-emerald-800",
    },
    DECLINED: {
      variant: "destructive",
      label: "Declined",
      color: "bg-red-100 text-red-800",
    },
  };
  return map[status];
}

export function getTaskTypeBadgeVariant(type: TaskTypeType) {
  const map: Record<
    TaskTypeType,
    {
      variant: "default" | "secondary" | "outline";
      label: string;
      icon: "FileSearch" | "ArrowUpCircle" | "ArrowDownCircle";
    }
  > = {
    VERIFICATION: {
      variant: "secondary",
      label: "Verification",
      icon: "FileSearch",
    },
    LOAN_VERIFICATION: {
      variant: "secondary",
      label: "Loan Verification",
      icon: "FileSearch",
    },
    CASH_DISBURSAL: {
      variant: "outline",
      label: "Cash Disbursal",
      icon: "ArrowUpCircle",
    },
    CASH_COLLECTION: {
      variant: "default",
      label: "Cash Collection",
      icon: "ArrowDownCircle",
    },
    DOCUMENT_PICKUP: {
      variant: "outline",
      label: "Document Pickup",
      icon: "FileSearch",
    },
    FOLLOW_UP: { variant: "outline", label: "Follow Up", icon: "FileSearch" },
  };
  return (
    map[type] ?? { variant: "outline", label: String(type), icon: "FileSearch" }
  );
}

export function getLeadStatusConfig(status: LeadStatusType) {
  const map: Record<
    LeadStatusType,
    { label: string; color: string; nextStep: string; nextStepPath: string }
  > = {
    NEW: {
      label: "New",
      color: "bg-slate-100 text-slate-700",
      nextStep: "Update Profile",
      nextStepPath: "details",
    },
    PROFILE_CAPTURED: {
      label: "Profile Captured",
      color: "bg-blue-100 text-blue-700",
      nextStep: "Upload KYC",
      nextStepPath: "kyc-upload",
    },
    KYC_UPLOADED: {
      label: "KYC Uploaded",
      color: "bg-purple-100 text-purple-700",
      nextStep: "Capture Consent",
      nextStepPath: "consent",
    },
    SUBMITTED_TO_OFFICER: {
      label: "Submitted",
      color: "bg-green-100 text-green-700",
      nextStep: "View",
      nextStepPath: "details",
    },
    OFFICER_APPROVED: {
      label: "Officer Approved",
      color: "bg-emerald-100 text-emerald-700",
      nextStep: "View",
      nextStepPath: "details",
    },
    REVERIFY_REQUIRED: {
      label: "Reverify Required",
      color: "bg-amber-100 text-amber-700",
      nextStep: "Update Profile",
      nextStepPath: "details",
    },
    CONVERTED_TO_USER: {
      label: "Converted",
      color: "bg-emerald-100 text-emerald-700",
      nextStep: "View",
      nextStepPath: "details",
    },
    REJECTED: {
      label: "Rejected",
      color: "bg-red-100 text-red-700",
      nextStep: "View",
      nextStepPath: "details",
    },
  };

  return map[status];
}

export function getAvailabilityConfig(a: AgentAvailabilityType) {
  const map: Record<
    AgentAvailabilityType,
    { label: string; color: string; description: string }
  > = {
    AVAILABLE: {
      label: "Available",
      color: "bg-emerald-100 text-emerald-700",
      description: "Ready to accept new tasks.",
    },
    BUSY: {
      label: "Busy",
      color: "bg-red-100 text-red-700",
      description: "Currently busy and not available for new assignments.",
    },
  };

  return map[a];
}

export function formatIndianCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDateDisplay(iso: string | null | undefined) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function isTaskOverdue(deadline: string | null | undefined) {
  if (!deadline) return false;
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
}

export function getLeadNextStepPath(leadId: number, status: LeadStatusType) {
  if (status === LeadStatus.NEW || status === LeadStatus.REVERIFY_REQUIRED)
    return `/agent/leads/${leadId}`;
  if (status === LeadStatus.PROFILE_CAPTURED)
    return `/agent/leads/kyc-upload?leadId=${leadId}`;
  if (status === LeadStatus.KYC_UPLOADED)
    return `/agent/leads/consent?leadId=${leadId}`;
  return `/agent/leads/${leadId}`;
}
