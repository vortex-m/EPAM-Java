import { Badge } from "@/components/ui/badge";

const emiStatusClassMap: Record<string, string> = {
  PAID: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-slate-100 text-slate-700",
  OVERDUE: "bg-red-100 text-red-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  PARTIALLY_PAID: "bg-amber-100 text-amber-700",
};

type EMIStatusBadgeProps = {
  status?: string | null;
};

export function EMIStatusBadge({ status }: EMIStatusBadgeProps) {
  const normalizedStatus = (status ?? "PENDING").toUpperCase();

  return (
    <Badge variant="secondary" className={emiStatusClassMap[normalizedStatus] ?? "bg-slate-100 text-slate-700"}>
      {normalizedStatus.replaceAll("_", " ")}
    </Badge>
  );
}
