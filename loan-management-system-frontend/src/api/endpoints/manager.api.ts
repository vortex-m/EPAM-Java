// import api from "../axios.config";

// export const managerApi = {
// 	getProfile: () => api.get("/manager/profile"),
// 	updateProfile: (data: unknown) => api.put("/manager/profile", data),

// 	getDashboard: () => api.get("/manager/dashboard"),
// 	getDashboardSummary: () => api.get("/manager/dashboard/summary"),

// 	getPendingLoans: (params?: { status?: string; page?: number; size?: number }) =>
// 		api.get("/manager/loans/pending", { params }),
// 	decideLoan: (loanId: number | string, data: unknown) =>
// 		api.post(`/manager/loans/${loanId}/decision`, data),
// 	getVerificationEvidence: (loanId: number | string) =>
// 		api.get(`/manager/loans/${loanId}/verification-evidence`),
// 	assignAgent: (loanId: number | string, data: unknown) =>
// 		api.post(`/manager/loans/${loanId}/assign-agent`, data),
// 	reassignAgent: (loanId: number | string, data: unknown) =>
// 		api.post(`/manager/loans/${loanId}/reassign-agent`, data),
// 	disburseByBank: (loanId: number | string, transactionReference: string) =>
// 		api.post(`/manager/loans/${loanId}/disbursal/bank`, null, {
// 			params: { transactionReference },
// 		}),

// 	createAgentStaff: (data: unknown) => api.post("/manager/staff/create/agent", data),
// 	createOfficerStaff: (data: unknown) => api.post("/manager/staff/create/officer", data),
// 	createManagerStaff: (data: unknown) => api.post("/manager/staff/create/manager", data),

// 	getAssistedAuditActions: () => api.get("/manager/audit/assisted-actions"),
// 	getLoanAuditLogs: (loanId: number | string) => api.get(`/manager/audit/loan/${loanId}`),
// 	flagAuditEntry: (auditId: number | string, data: unknown) =>
// 		api.post(`/manager/audit/${auditId}/flag`, data),
// };


import api from "../axios.config";
import type {
	ManagerProfileUpdateRequest,
	ManagerLoanDecisionRequest,
	ManagerAssignAgentRequest,
	ManagerReassignAgentRequest,
	StaffCreateRequest,
	AuditFlagRequest,
	ManagerReportsParams,
} from "@/types/manager.types";

// ─── Query param shapes ───────────────────────────────────────────────────────

interface PaginationParams {
	page?: number;
	size?: number;
}

interface PendingLoansParams extends PaginationParams {
	status?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const managerApi = {
	// ── Profile ───────────────────────────────────────────────────────────────
	getProfile: () =>
		api.get("/manager/profile"),
	updateProfile: (data: ManagerProfileUpdateRequest) =>
		api.put("/manager/profile", data),

	// ── Dashboard ─────────────────────────────────────────────────────────────
	getDashboard: () =>
		api.get("/manager/dashboard"),
	getDashboardSummary: () =>
		api.get("/manager/dashboard/summary"),

	// ── Loan Management (LOAN_APPROVAL / LOAN_OPERATIONS) ────────────────────
	getPendingLoans: (params?: PendingLoansParams) =>
		api.get("/manager/loans/pending", { params }),
	decideLoan: (loanId: number | string, data: ManagerLoanDecisionRequest) =>
		api.post(`/manager/loans/${loanId}/decision`, data),
	getVerificationEvidence: (loanId: number | string) =>
		api.get(`/manager/loans/${loanId}/verification-evidence`),
	assignAgent: (loanId: number | string, data: ManagerAssignAgentRequest) =>
		api.post(`/manager/loans/${loanId}/assign-agent`, data),
	reassignAgent: (loanId: number | string, data: ManagerReassignAgentRequest) =>
		api.post(`/manager/loans/${loanId}/reassign-agent`, data),
	disburseByBank: (loanId: number | string, transactionReference: string) =>
		api.post(`/manager/loans/${loanId}/disbursal/bank`, null, {
			params: { transactionReference },
		}),

	// ── Staff Management (OPERATIONS / LOAN_OPERATIONS) ──────────────────────
	createAgentStaff: (data: StaffCreateRequest) =>
		api.post("/manager/staff/create/agent", data),
	createOfficerStaff: (data: StaffCreateRequest) =>
		api.post("/manager/staff/create/officer", data),
	createManagerStaff: (data: StaffCreateRequest) =>
		api.post("/manager/staff/create/manager", data),

	// ── Audit & Compliance (COMPLIANCE / AUDIT / FRAUD / LOAN_OPERATIONS) ────
	/** Paginated audit log entries across all loans */
	getAuditLogs: (params?: PaginationParams) =>
		api.get("/manager/audit/logs", { params }),
	/** Flagged / suspicious audit entries */
	getAuditFlags: (params?: PaginationParams) =>
		api.get("/manager/audit/flags", { params }),
	/** All assisted (on-behalf) actions taken by staff */
	getAssistedAuditActions: (params?: PaginationParams) =>
		api.get("/manager/audit/assisted-actions", { params }),
	/** Full chronological audit trail */
	getAuditTrail: (params?: PaginationParams) =>
		api.get("/manager/audit/trail", { params }),
	/** Per-loan audit timeline */
	getLoanAuditLogs: (loanId: number | string) =>
		api.get(`/manager/audit/loan/${loanId}`),
	/** Flag a specific audit entry as suspicious / non-compliant */
	flagAuditEntry: (auditId: number | string, data: AuditFlagRequest) =>
		api.post(`/manager/audit/${auditId}/flag`, data),

	// ── Fraud Management (FRAUD / LOAN_OPERATIONS) ───────────────────────────
	/** Active fraud alerts raised by the system */
	getFraudAlerts: (params?: PaginationParams) =>
		api.get("/manager/fraud/alerts", { params }),
	/** Opened fraud investigation cases */
	getFraudCases: (params?: PaginationParams) =>
		api.get("/manager/fraud/cases", { params }),
	/** Audit logs specific to the fraud investigation workflow */
	getFraudAuditLogs: (params?: PaginationParams) =>
		api.get("/manager/fraud/audit-logs", { params }),

	// ── Reports (all manager types) ───────────────────────────────────────────
	getReports: (params?: ManagerReportsParams) =>
		api.get("/manager/reports", { params }),

	// ── KYC Compliance ────────────────────────────────────────────────────────
	/** KYC records visible to KYC_COMPLIANCE managers */
	getKycRecords: (params?: { page?: number; size?: number; status?: string }) =>
		api.get("/manager/kyc/records", { params }),
};