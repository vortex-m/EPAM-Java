// ─── Manager Department / Designation ────────────────────────────────────────

/**
 * All department values the backend may send in the login response or profile.
 * LOAN_OPERATIONS is the combined role (loan approval + staff operations).
 */
export type ManagerDepartment =
	| "LOAN_APPROVAL"
	| "LOAN_OPERATIONS" // combined: loan approval + operations (backend sends this)
	| "OPERATIONS"
	| "COMPLIANCE"
	| "AUDIT"
	| "FRAUD"
	| "FULL"; // super-manager: all modules

// ─── Profile ──────────────────────────────────────────────────────────────────

export type ManagerProfile = {
	userId: number;
	managerCode: string;
	designation: string;
	department: ManagerDepartment | string;
	branch: string;
	branchCode: string;
	region: string;
	regionCode: string;
	email: string;
	phone: string;
};

export type ManagerProfileUpdateRequest = Partial<
	Pick<
		ManagerProfile,
		"designation" | "email" | "phone" | "branch" | "region" | "regionCode"
	>
>;

// ─── Dashboard ────────────────────────────────────────────────────────────────

export type ManagerDashboardData = {
	pendingOfficer: number;
	pendingManager: number;
	approved: number;
	disbursed: number;
	rejected: number;
	closed: number;
	underVerification?: number;
	totalProcessed: number;
	successRate?: number;
	averageProcessingTime?: number;
};

// ─── Loan Management ──────────────────────────────────────────────────────────

export type ManagerLoanResponse = {
	loanId: number;
	loanApplicationId?: number;
	applicationNumber?: string;
	applicantName?: string;
	loanAmount?: number;
	requestedAmount?: number;
	status: string;
	createdAt?: string;
	updatedAt?: string;
	verificationStatus?: string;
	assignedAgentId?: number | null;
	assignedAgentName?: string | null;
};

export type ManagerLoanDecisionRequest = {
	decision: "APPROVED" | "REJECTED";
	remarks: string;
	disbursal_mode?: "BANK_TRANSFER" | "CASH" | "UPI";
	loan_tenure?: number;
	interest_rate?: number;
};

export type ManagerAssignAgentRequest = {
	agentId: number;
	remarks?: string;
};

export type ManagerReassignAgentRequest = {
	agentId: number;
	reason: string;
};

export type VerificationEvidenceImage = {
	fileUrl: string;
	imageTag?: string;
	description?: string;
};

export type VerificationEvidenceResponse = {
	loanId?: number;
	reportSummary?: string;
	verificationStatus?: string;
	addressVerified?: boolean;
	incomeVerified?: boolean;
	agentRemarks?: string;
	imageCount?: number;
	images?: VerificationEvidenceImage[];
};

// ─── Staff Management ─────────────────────────────────────────────────────────

export type StaffCreateRequest = {
	name: string;
	email: string;
	code: string;
	phone: string;
	address: string;
	city: string;
	state: string;
	pinCode: string;
	/** Only required when creating a manager — identifies their department. */
	department?: ManagerDepartment;
};

export type StaffCreateResponse = {
	userId: number;
	role: "AGENT" | "OFFICER" | "MANAGER" | string;
	code: string;
	name: string;
	email: string;
	status?: string;
};

// ─── Audit & Compliance ───────────────────────────────────────────────────────

export type AuditSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AuditCategory =
	| "FRAUD_ALERT"
	| "COMPLIANCE_BREACH"
	| "SUSPICIOUS_ACTIVITY"
	| "DATA_TAMPERING";

export type AssistedAuditResponse = {
	auditId: number;
	loanId?: number;
	action: string;
	performedBy?: string;
	role?: string;
	details?: string;
	severity?: AuditSeverity | string;
	flagged?: boolean;
	createdAt?: string;
};

export type AuditLogResponse = {
	auditId: number;
	loanId?: number;
	action: string;
	details?: string;
	performedBy?: string;
	role?: string;
	flagged?: boolean;
	severity?: AuditSeverity | string;
	createdAt?: string;
};

export type AuditFlagRequest = {
	reason: string;
	severity: AuditSeverity;
	category?: AuditCategory | string;
};

// ─── Fraud ────────────────────────────────────────────────────────────────────

export type FraudAlertStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";

export type FraudAlert = {
	alertId: number;
	loanId?: number;
	applicantName?: string;
	alertType?: string;
	description?: string;
	severity?: AuditSeverity | string;
	status?: FraudAlertStatus | string;
	createdAt?: string;
	updatedAt?: string;
};

export type FraudCaseStatus =
	| "OPEN"
	| "INVESTIGATING"
	| "ESCALATED"
	| "RESOLVED"
	| "CLOSED";

export type FraudCase = {
	caseId: number;
	loanId?: number;
	applicantName?: string;
	caseType?: string;
	description?: string;
	severity?: AuditSeverity | string;
	status?: FraudCaseStatus | string;
	assignedTo?: string;
	createdAt?: string;
	updatedAt?: string;
};

// ─── Reports ──────────────────────────────────────────────────────────────────

export type ManagerReportsParams = {
	type?: string;
	from?: string; // ISO date string
	to?: string;   // ISO date string
	page?: number;
	size?: number;
};

// ─── Pagination ───────────────────────────────────────────────────────────────

/** Generic paginated wrapper — adjust to match your actual backend envelope. */
export type PaginatedResponse<T> = {
	content: T[];
	totalElements: number;
	totalPages: number;
	page: number;
	size: number;
};

// ─── KYC Compliance ───────────────────────────────────────────────────────────

export type KycStatus =
	| "PENDING"
	| "UNDER_REVIEW"
	| "APPROVED"
	| "REJECTED"
	| "RESUBMISSION_REQUIRED";

export type KycRecord = {
	kycId: number;
	userId: number;
	applicantName?: string;
	email?: string;
	phone?: string;
	status: KycStatus | string;
	/** Address, income, identity, etc. */
	documentType?: string;
	submittedAt?: string;
	reviewedAt?: string;
	reviewedBy?: string;
	rejectionReason?: string;
};