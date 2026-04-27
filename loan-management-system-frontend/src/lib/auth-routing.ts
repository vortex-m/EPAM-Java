import type { AuthPayload } from "@/types/auth.types";

type ManagerDepartment = string | undefined;

function getManagerDepartmentPath(department: ManagerDepartment) {
  switch ((department ?? "").toUpperCase()) {
    case "LOAN_APPROVAL":
      return "/manager/loans/pending";
    case "OPERATIONS":
      return "/manager/staff";
    case "COMPLIANCE":
      return "/manager/audit/logs";
    case "AUDIT":
      return "/manager/audit/assisted-actions";
    case "FRAUD":
      return "/manager/fraud/alerts";
    default:
      return "/manager/dashboard";
  }
}

export function getDefaultPathByRole(role?: string | null) {
  const normalizedRole = (role ?? "").toUpperCase();

  if (normalizedRole === "USER") return "/user";
  if (normalizedRole === "AGENT") return "/agent";
  if (normalizedRole === "OFFICER") return "/officer";
  if (normalizedRole === "MANAGER") return "/manager/dashboard";
  if (normalizedRole === "ADMIN") return "/admin";

  return "/user";
}

export function getRedirectPathFromAuth(authData: Pick<AuthPayload, "role" | "user">) {
  if (authData.role === "MANAGER") {
    return getManagerDepartmentPath(authData.user?.department);
  }

  return getDefaultPathByRole(authData.role);
}

export function getRedirectPathFromState(role?: string | null, department?: string | null) {
  if ((role ?? "").toUpperCase() === "MANAGER") {
    return getManagerDepartmentPath(department ?? undefined);
  }

  return getDefaultPathByRole(role);
}
