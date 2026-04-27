export type KycStatus = "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED" | "UNKNOWN";

export type LoanStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "PENDING_MANAGER_APPROVAL"
  | "APPROVED"
  | "DISBURSED"
  | "REJECTED"
  | "CLOSED"
  | "UNKNOWN";

export type PaymentStatus = "SUCCESSFUL" | "PENDING" | "FAILED" | "UNKNOWN";

export type UserProfile = {
  userId: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  isHome: boolean;
  gender: string | null;
  occupation: string | null;
  maritalStatus: string | null;
  fatherName: string | null;
  motherName: string | null;
  wifeName: string | null;
  husbandName: string | null;
  monthlyIncome: number | null;
  dateOfBirth: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  branchCode: string | null;
  branchName: string | null;
  kycStatus: KycStatus | null;
  creditScore: number | null;
  riskScore: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type DashboardData = {
  userId: number;
  isHome: boolean;
  kycStatus: KycStatus;
  totalLoans: number;
  totalEmis: number;
  paidEmis: number;
  overdueEmis: number;
  totalOutstandingPrincipal: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  disbursedApplications: number;
};

export type LoanSummary = {
  loanApplicationId: string;
  loanId: string | null;
  applicationNumber: string;
  loanNumber: string | null;
  status: LoanStatus;
  requestedAmount: number;
  approvedAmount: number | null;
  emiAmount: number | null;
  nextDueDate: string | null;
  outstandingPrincipal: number | null;
};

export type LoanDetails = {
  loanApplicationId: string;
  applicationNumber: string;
  loanId: string | null;
  loanNumber: string | null;
  status: LoanStatus;
  requestedAmount: number;
  approvedAmount: number | null;
  tenureMonths: number;
  interestRate: number | null;
  processingFee: number | null;
  totalInterestPayable: number | null;
  totalAmountPayable: number | null;
  disbursementDate: string | null;
  firstEmiDate: string | null;
  lastEmiDate: string | null;
  emiAmount: number | null;
  totalEmis: number | null;
  emisPaid: number | null;
  emisPending: number | null;
  emisOverdue: number | null;
  nextDueDate: string | null;
  outstandingPrincipal: number | null;
  disbursalMode: "BANK_TRANSFER" | "CASH" | null;
  disbursalBankName: string | null;
  disbursalBankAccountMasked: string | null;
  disbursalIfscCode: string | null;
  assignedAgentName: string | null;
  assignedAgentPhone: string | null;
  assignedOfficerName: string | null;
  assignedOfficerPhone: string | null;
  officerRemarks: string | null;
  rejectionReason: string | null;
  loanPurpose: string | null;
  loanPurposeDescription: string | null;
  userRemarks: string | null;
};

export type KycDocumentStatus = "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED" | "UNKNOWN";

export type KycDocument = {
  documentId: string;
  documentType: "AADHAAR" | "PAN" | "DRIVING_LICENSE" | "PASSPORT" | "VOTER_ID" | string;
  documentNumber: string;
  status: KycDocumentStatus;
  uploadedAt: string | null;
  officerRemarks: string | null;
  rejectionReason: string | null;
  fileName: string | null;
  fileUrl: string | null;
};

export type KycStatusResponse = {
  kycStatus: KycStatus;
  documents: KycDocument[];
};

export type EmiStatus = "PAID" | "PENDING" | "OVERDUE" | "PARTIALLY_PAID" | "UNKNOWN";

export type EmiScheduleEntry = {
  emiScheduleId: string;
  emiNumber: number;
  dueDate: string | null;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  outstandingPrincipal: number;
  emiStatus: EmiStatus;
  paidDate: string | null;
  penaltyAmount: number;
};

export type EmiScheduleResponse = {
  loanId: string;
  loanNumber: string | null;
  principalAmount: number;
  interestRate: number;
  emiAmount: number;
  schedule: EmiScheduleEntry[];
};

export type PaymentRecord = {
  paymentId: string;
  paymentNumber: string;
  loanId: string | null;
  loanNumber: string | null;
  emiNumber: number | null;
  totalPaidAmount: number;
  paymentMode: "BANK_TRANSFER" | "CASH" | "UPI" | string;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
  receiptNumber: string | null;
  cashSettlementStatus: string | null;
  paymentReference: string | null;
};

export type PaymentHistoryResponse = {
  payments: PaymentRecord[];
};

export type ApplyLoanRequest = {
  requestedAmount: number;
  tenureMonths: number;
  loanPurpose: string;
  loanPurposeDescription: string;
  userRemarks: string;
  disbursalMode: "BANK_TRANSFER" | "CASH";
  disbursalBankName?: string;
  disbursalBankAccount?: string;
  disbursalIfscCode?: string;
  disbursalBankProofUrl?: string;
  disbursalBankProofFileName?: string;
};

export type PayEmiRequest = {
  emiScheduleId: string;
  paymentAmount: number;
  paymentMode: "BANK_TRANSFER" | "CASH" | "UPI";
  gatewayOrderId?: string;
  paymentReference?: string;
};

export type OnboardingRequest = {
  occupation: string;
  maritalStatus: string;
  fatherName: string;
  motherName: string;
  wifeName?: string;
  husbandName?: string;
  monthlyIncome: number;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  dateOfBirth: string;
  branchCode: string;
};

export type UploadedFileResponse = {
  fileUrl?: string;
  url?: string;
  path?: string;
  fileName?: string;
  originalFileName?: string;
  size?: number;
};

export type PayEmiReceipt = {
  paymentNumber: string;
  receiptNumber: string | null;
  totalPaidAmount: number;
  paymentStatus: PaymentStatus;
};
