import { Badge } from "@/components/ui/badge";

const statusClassMap: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  PENDING_MANAGER_APPROVAL: "bg-orange-100 text-orange-700",
  APPROVED: "bg-blue-100 text-blue-700",
  DISBURSED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-teal-100 text-teal-700",
  REJECTED: "bg-red-100 text-red-700",
  VERIFIED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
};

type StatusBadgeProps = {
  status?: string | null;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = (status ?? "UNKNOWN").toUpperCase();

  return (
    <Badge variant="secondary" className={statusClassMap[normalizedStatus] ?? "bg-slate-100 text-slate-700"}>
      {normalizedStatus.replaceAll("_", " ")}
    </Badge>
  );
}
