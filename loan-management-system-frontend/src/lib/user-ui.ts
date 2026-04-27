import { formatCurrency, formatDate } from "@/lib/formatters";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";

export type StatusBadgeConfig = {
  variant: BadgeVariant;
  label: string;
  className: string;
};

export function getStatusBadge(status: string | null | undefined): StatusBadgeConfig {
  const normalized = (status ?? "UNKNOWN").toUpperCase();

  const statusMap: Record<string, StatusBadgeConfig> = {
    PENDING: { variant: "secondary", label: "Pending", className: "bg-amber-100 text-amber-800" },
    SUBMITTED: { variant: "secondary", label: "Submitted", className: "bg-blue-100 text-blue-800" },
    APPROVED: { variant: "default", label: "Approved", className: "bg-emerald-100 text-emerald-800" },
    DISBURSED: { variant: "default", label: "Disbursed", className: "bg-green-100 text-green-800" },
    REJECTED: { variant: "destructive", label: "Rejected", className: "bg-red-100 text-red-800" },
    CLOSED: { variant: "outline", label: "Closed", className: "bg-slate-100 text-slate-700" },
    PAID: { variant: "default", label: "Paid", className: "bg-green-100 text-green-800" },
    OVERDUE: { variant: "destructive", label: "Overdue", className: "bg-red-100 text-red-800" },
    SUCCESSFUL: { variant: "default", label: "Successful", className: "bg-green-100 text-green-800" },
    FAILED: { variant: "destructive", label: "Failed", className: "bg-red-100 text-red-800" },
  };

  return (
    statusMap[normalized] ?? {
      variant: "outline",
      label: normalized.replaceAll("_", " "),
      className: "bg-slate-100 text-slate-700",
    }
  );
}

export function formatMoney(value: number | null | undefined): string {
  return formatCurrency(Number(value ?? 0));
}

export function formatDisplayDate(value: string | null | undefined): string {
  return formatDate(value);
}

export function maskDocumentNumber(documentNumber: string): string {
  const trimmed = documentNumber.trim();
  if (trimmed.length <= 4) {
    return trimmed;
  }

  const visible = trimmed.slice(-4);
  return `${"*".repeat(trimmed.length - 4)}${visible}`;
}

export function maskBankAccount(accountNumber: string | null | undefined): string {
  if (!accountNumber) {
    return "-";
  }

  const visible = accountNumber.slice(-4);
  return `${"*".repeat(Math.max(0, accountNumber.length - 4))}${visible}`;
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let index = 0;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }

  return `${size.toFixed(size < 10 && index > 0 ? 1 : 0)} ${units[index]}`;
}
