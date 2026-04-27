export type OfficerDashboardData = {
  officerUserId: number;
  officerCode: string;
  branchCode: string;
  pendingKycDocuments: number;
  pendingLoanQueue: number;
  pendingNewLoanQueue: number;
  pendingUnderReviewQueue: number;
  pendingManagerApprovalQueue: number;
  reviewsApproved: number;
  reviewsRejected: number;
  reviewsReverify: number;
  totalCollectedCash: number;
  totalSettledCash: number;
  totalUnsettledCash: number;
};

export type OfficerLeadStatus =
  | "ACTIVE"
  | "APPROVED"
  | "REJECTED"
  | "CONVERTED"
  | "PENDING";

export type OfficerLeadQueueItem = {
  leadId: number;
  leadName: string;
  phone: string;
  loanAmount: number;
  leadStatus: OfficerLeadStatus | string;
  leadSource: string;
  leadScore: number;
  createdAt: string;
};

export type OfficerLeadDecisionRequest = {
  decision: "APPROVED" | "REJECTED";
  remarks: string;
  rejectionReason?: string | null;
};

export type OfficerLeadDecisionResponse = {
  leadId: number;
  leadStatus: string;
};

export type OfficerLeadConvertRequest = {
  loanAmount: number;
  loanPurpose: string;
  disbursalMode: "CASH" | "BANK";
};

export type OfficerLeadConvertResponse = {
  userId: number;
  leadId: number;
  applicationNumber: string;
};

export type OfficerKycDocument = {
  documentId: number;
  userId: number;
  documentType: string;
  documentNumber: string;
  documentStatus: string;
  kycStatus: string;
  fileUrl: string;
  createdAt: string;
};

export type OfficerKycReviewStatus = "APPROVED" | "REJECTED" | "RESUBMIT";

export type OfficerKycReviewRequest = {
  reviewStatus: OfficerKycReviewStatus;
  reviewRemarks: string;
  rejectionReason?: string | null;
  resubmissionRequested?: boolean;
  resubmissionInstructions?: string | null;
};

export type OfficerKycReviewResponse = {
  documentId: number;
  documentStatus: string;
  reviewedAt: string;
};

export type OfficerLoanQueueItem = {
  loanApplicationId: number;
  applicationNumber: string;
  userId: number;
  userName: string;
  requestedAmount: number;
  tenureMonths: number;
  loanPurpose: string;
  disbursalMode: string;
  disbursalBankName: string | null;
  disbursalBankAccount: string | null;
  disbursalIfscCode: string | null;
  status: string;
  appliedAt: string;
  verificationTaskStatus: string | null;
  verificationStatus: string | null;
  verificationEvidenceAvailable: boolean;
};

export type OfficerUserDocument = {
  documentId: number;
  documentType: string;
  documentNumber: string;
  verificationStatus: string;
  fileUrl: string;
  reviewedAt: string | null;
  officerRemarks: string | null;
};

export type OfficerLoanUserProfile = {
  userId: number;
  name: string;
  email: string;
  phone: string;
  fatherName: string | null;
  motherName: string | null;
  wifeName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  occupation: string | null;
  maritalStatus: string | null;
  monthlyIncome: number | null;
  street: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  branchCode: string | null;
  branchName: string | null;
  aadhaarNumber: string | null;
  panNumber: string | null;
  kycStatus: string | null;
  documents: OfficerUserDocument[];
};

export type OfficerVerificationImage = {
  imageUrl: string;
  imageCaption?: string | null;
};

export type OfficerLoanVerificationEvidence = {
  loanApplicationId: number;
  assignedAgentId: number | null;
  assignedAgentName: string | null;
  verificationTaskId: number | null;
  verificationTaskStatus: string | null;
  verificationTaskStartedAt: string | null;
  verificationTaskCompletedAt: string | null;
  verificationStatus: string | null;
  visitedAt: string | null;
  submittedAt: string | null;
  visitLatitude: number | null;
  visitLongitude: number | null;
  visitAddress: string | null;
  reportSummary: string | null;
  riskNotes: string | null;
  imageCount: number;
  images: OfficerVerificationImage[];
  collectionPlannedAt: string | null;
  collectionStartedAt: string | null;
  agentLastLatitude: number | null;
  agentLastLongitude: number | null;
  agentLastLocationUpdatedAt: string | null;
};

export type OfficerAssignAgentRequest = {
  agentUserId: number;
  reason: string;
};

export type OfficerAssignableAgent = {
  agentUserId: number;
  agentCode: string;
  name: string;
  phone: string;
};

export type OfficerAssignAgentResponse = {
  loanApplicationId: number;
  status: string;
  assignedAgentId: number;
};

export type OfficerLoanDecisionValue = "APPROVED" | "REJECTED" | "RE_VERIFY";

export type OfficerLoanDecisionRequest = {
  decision: OfficerLoanDecisionValue;
  officerRemarks: string;
  approvedAmount?: number | null;
  approvedTenureMonths?: number | null;
  rejectionReason?: string | null;
  reVerifyReason?: string | null;
};

export type OfficerLoanDecisionResponse = {
  loanApplicationId: number;
  status: string;
  applicationNumber: string;
};

export type OfficerCashDisbursalQueueItem = {
  taskId: number;
  loanApplicationId: number;
  applicationNumber: string;
  applicantName: string;
  assignedAgentName: string;
  assignedAgentEmail: string;
  loanAmount: number;
  otpStatus: string;
};

export type OfficerHandoverOtpRequest = {
  taskId: number;
};

export type OfficerHandoverOtpVerifyRequest = {
  taskId: number;
  otp: string;
};

export type OfficerHandoverOtpResponse = {
  loanApplicationId: number;
  otpStatus: string;
  attempts: number;
  expiresAt: string;
  verifiedAt?: string | null;
  message: string;
};

export type OfficerUnsettledPayment = {
  paymentId: number;
  paymentCode: string;
  applicationNumber: string;
  agentName: string;
  amount: number;
  collectedAt: string;
};

export type OfficerCashSettlementRequest = {
  paymentIds: number[];
  settlementReference: string;
};

export type OfficerCashSettlementResponse = {
  settledPaymentsCount: number;
  settledAmount: number;
  settlementReference: string;
  settledAt: string;
  settledPaymentIds: number[];
};

export type OfficerSettlementHistoryItem = {
  settledAt: string;
  settledAmount: number;
  settlementReference: string;
};
