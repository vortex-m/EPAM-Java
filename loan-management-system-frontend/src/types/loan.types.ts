export type LoanLifecycleStatus =
	| "PENDING"
	| "UNDER_REVIEW"
	| "PENDING_MANAGER_APPROVAL"
	| "APPROVED"
	| "DISBURSED"
	| "CLOSED"
	| "REJECTED"
	| "UNKNOWN";

export type DisbursalMode = "BANK_TRANSFER" | "CASH";

export type LoanListItem = {
	loanApplicationId: string;
	applicationNumber: string;
	loanId?: string;
	loanNumber?: string;
	requestedAmount: number;
	approvedAmount?: number;
	tenureMonths: number;
	loanPurpose?: string;
	disbursalMode?: DisbursalMode;
	status: LoanLifecycleStatus;
	emiAmount?: number;
	totalPaidAmount?: number;
	outstandingPrincipal?: number;
	nextDueDate?: string;
	rejectionReason?: string;
	appliedAt?: string;
	updatedAt?: string;
};

export type LoanStatusResponse = {
	loans: LoanListItem[];
};

export type LoanDetailResponse = {
	loanApplicationId: string;
	applicationNumber: string;
	status: LoanLifecycleStatus;
	requestedAmount: number;
	tenureMonths: number;
	loanPurpose?: string;
	loanPurposeDescription?: string;
	userRemarks?: string;
	disbursalMode?: DisbursalMode;
	disbursalBankName?: string;
	disbursalBankAccountMasked?: string;
	disbursalIfscCode?: string;
	loanId?: string;
	loanNumber?: string;
	approvedAmount?: number;
	interestRate?: number;
	interestType?: string;
	emiAmount?: number;
	processingFee?: number;
	totalInterestPayable?: number;
	totalAmountPayable?: number;
	totalEmis?: number;
	emisPaid?: number;
	emisPending?: number;
	emisOverdue?: number;
	outstandingPrincipal?: number;
	totalPaidAmount?: number;
	pendingAmount?: number;
	nextDueDate?: string;
	disbursementDate?: string;
	firstEmiDate?: string;
	lastEmiDate?: string;
	disbursedAt?: string;
	assignedAgentName?: string;
	assignedAgentPhone?: string;
	assignedOfficerName?: string;
	assignedOfficerPhone?: string;
	officerRemarks?: string;
	rejectionReason?: string;
};

export type EmiStatus = "PENDING" | "PAID" | "OVERDUE" | "PARTIALLY_PAID";

export type EmiScheduleItem = {
	emiScheduleId: string;
	emiNumber: number;
	dueDate?: string;
	emiAmount: number;
	principalComponent: number;
	interestComponent: number;
	outstandingPrincipal: number;
	emiStatus: EmiStatus;
	paidAmount: number;
	paidDate?: string;
	penaltyAmount: number;
	daysOverdue: number;
};

export type EmiScheduleResponse = {
	loanId: string;
	loanNumber?: string;
	principalAmount: number;
	interestRate: number;
	totalEmis: number;
	emiAmount: number;
	schedule: EmiScheduleItem[];
};

export type PaymentItem = {
	paymentId: string;
	paymentNumber: string;
	loanId?: string;
	loanNumber?: string;
	emiScheduleId?: string;
	emiNumber?: number;
	totalPaidAmount: number;
	principalPaid: number;
	interestPaid: number;
	penaltyPaid: number;
	paymentMode?: string;
	paymentStatus?: string;
	paymentReference?: string;
	gatewayTransactionId?: string;
	cashSettlementStatus?: string;
	cashVerifiedAt?: string;
	settledAt?: string;
	paidAt?: string;
	receiptNumber?: string;
};

export type PaymentHistoryResponse = {
	payments: PaymentItem[];
};

export type LoanApplyRequest = {
	requestedAmount: number;
	tenureMonths: number;
	loanPurpose: string;
	loanPurposeDescription?: string;
	userRemarks: string;
	disbursalMode: DisbursalMode;
	disbursalBankName?: string;
	disbursalBankAccount?: string;
	disbursalIfscCode?: string;
	disbursalBankProofUrl?: string;
	disbursalBankProofFileName?: string;
};

export type LoanApplyResponse = {
	loanApplicationId: string;
	applicationNumber: string;
	status: LoanLifecycleStatus;
	originChannel?: string;
	requestedAmount: number;
	tenureMonths: number;
	loanPurpose?: string;
	disbursalMode?: DisbursalMode;
	assignedAgentId?: string;
	assignedOfficerId?: string;
	appliedAt?: string;
};

export type EmiPayRequest = {
	emiScheduleId: string;
	paymentAmount: number;
	paymentMode: "BANK_TRANSFER" | "UPI" | "NET_BANKING";
	gatewayOrderId?: string;
	paymentReference?: string;
};
