export const AgentAvailability = {
  AVAILABLE: "AVAILABLE",
  BUSY: "BUSY",
} as const;

export const TaskStatus = {
  ASSIGNED: "ASSIGNED",
  ACCEPTED: "ACCEPTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  DECLINED: "DECLINED",
} as const;

export const TaskType = {
  VERIFICATION: "VERIFICATION",
  LOAN_VERIFICATION: "LOAN_VERIFICATION",
  CASH_DISBURSAL: "CASH_DISBURSAL",
  CASH_COLLECTION: "CASH_COLLECTION",
  DOCUMENT_PICKUP: "DOCUMENT_PICKUP",
  FOLLOW_UP: "FOLLOW_UP",
} as const;

export const TaskPriority = {
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
} as const;

export const LeadStatus = {
  NEW: "NEW",
  PROFILE_CAPTURED: "PROFILE_CAPTURED",
  KYC_UPLOADED: "KYC_UPLOADED",
  SUBMITTED_TO_OFFICER: "SUBMITTED_TO_OFFICER",
  OFFICER_APPROVED: "OFFICER_APPROVED",
  REVERIFY_REQUIRED: "REVERIFY_REQUIRED",
  CONVERTED_TO_USER: "CONVERTED_TO_USER",
  REJECTED: "REJECTED",
} as const;

export const ConsentMode = {
  SELF_OTP: "SELF_OTP",
  WITNESS: "WITNESS",
  AGENT_ASSISTED: "AGENT_ASSISTED",
} as const;

export const CashOtpStatus = {
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  EXPIRED: "EXPIRED",
  FAILED: "FAILED",
} as const;

export const VerificationStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  ESCALATED: "ESCALATED",
} as const;

export type AgentAvailability = (typeof AgentAvailability)[keyof typeof AgentAvailability];
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
export type TaskType = (typeof TaskType)[keyof typeof TaskType];
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];
export type ConsentMode = (typeof ConsentMode)[keyof typeof ConsentMode];
export type CashOtpStatus = (typeof CashOtpStatus)[keyof typeof CashOtpStatus];
export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus];

export type AgentProfile = {
  userId: number;
  name: string;
  email: string;
  phone: string;
  isHome: boolean;
  agentCode: string | null;
  designation: string | null;
  department: string | null;
  branchCode: string | null;
  branchName: string | null;
  regionCode: string | null;
  agentStatus: string | null;
  agentAvailability: AgentAvailability;
  fatherName: string | null;
  motherName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  maritalStatus: string | null;
  aadhaarNumber: string | null;
  panNumber: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  totalCollectedCash: number;
  totalSettledCash: number;
  totalUnsettledCash: number;
  lastLocationUpdatedAt: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type AgentDashboardData = {
  isHome: boolean;
  availability: AgentAvailability;
  agentAvailability?: AgentAvailability;
  lastLocationUpdatedAt: string | null;
  totalAssignedTasks: number;
  assignedTasks: number;
  acceptedTasks: number;
  inProgressTasks: number;
  pendingVerificationTasks: number;
  pendingCashCollectionTasks: number;
  cashCollectionsInProgress: number;
  completedToday: number;
  totalCollectedCash: number;
  totalSettledCash: number;
  totalUnsettledCash: number;
};

export type AgentTask = {
  taskId: number;
  taskCode: string;
  loanApplicationId: number | null;
  applicationNumber: string | null;
  userId?: number | null;
  userName?: string | null;
  userPhone?: string | null;
  loanId: number | null;
  loanNumber: string | null;
  loanStatus?: string | null;
  loanEmiAmount?: number | null;
  nextEmiDueDate?: string | null;
  nextEmiScheduleId?: number | null;
  nextEmiOutstandingAmount?: number | null;
  leadId: number | null;
  leadCode: string | null;
  taskType: TaskType;
  taskStatus: TaskStatus;
  priorityLevel: TaskPriority;
  description: string | null;
  taskDescription?: string | null;
  otpRequired?: boolean;
  otpVerified?: boolean;
  otpRequestedAt?: string | null;
  otpVerifiedAt?: string | null;
  deadline: string | null;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  collectionPlannedAt?: string | null;
  collectionStartedAt?: string | null;
  collectionStartedLat?: number | null;
  collectionStartedLng?: number | null;
  collectionVerifiedAt?: string | null;
  collectionVerifiedLat?: number | null;
  collectionVerifiedLng?: number | null;
};

export type GetTasksParams = {
  status?: TaskStatus | "ALL";
  taskType?: TaskType | "ALL";
};

export type AcceptTaskResponse = AgentTask;
export type StartTaskResponse = AgentTask;
export type CompleteTaskResponse = AgentTask;
export type DeclineTaskResponse = AgentTask;

export type CashDisbursalOtpRequest = {
  taskId: number;
};

export type CashDisbursalOtpVerifyRequest = {
  taskId: number;
  otp: string;
};

export type CashDisbursalOtpResponse = {
  otpId: number;
  otpCode?: string;
  loanApplicationId: number;
  otpStatus: CashOtpStatus;
  attempts: number;
  maxAttempts: number;
  expiresAt: string;
};

export type CashCollectionOtpRequest = {
  taskId?: number;
  loanId: number;
  emiScheduleId: number;
  collectionAmount: number;
  collectionPlannedAt: string;
  agentLatitude: number;
  agentLongitude: number;
};

export type CashCollectionOtpResponse = {
  otpId: number;
  otpCode?: string;
  taskId: number | null;
  loanId: number;
  emiScheduleId: number;
  collectionAmount: number;
  otpStatus: CashOtpStatus;
  attemptCount: number;
  maxAttempts: number;
  expiresAt: string;
};

export type LeadSummary = {
  leadId: number;
  leadCode: string;
  fullName: string;
  phone: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
};

export type LeadDetails = {
  leadId: number;
  leadCode: string;
  status: LeadStatus;
  fullName: string;
  phone: string;
  guardianPhone: string | null;
  email: string | null;
  village: string | null;
  address: string | null;
  branchCode: string | null;
  consentMode: ConsentMode | null;
  consentText: string | null;
  consentProofUrl: string | null;
  witnessName: string | null;
  witnessPhone: string | null;
  fatherName: string | null;
  motherName: string | null;
  dateOfBirth: string | null;
  maritalStatus: string | null;
  occupation: string | null;
  monthlyIncome: number | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  aadhaarNumber: string | null;
  panNumber: string | null;
  aadhaarFileUrl: string | null;
  panFileUrl: string | null;
  requestedAmount: number | null;
  tenureMonths: number | null;
  loanPurpose: string | null;
  disbursalMode: "BANK_TRANSFER" | "CASH" | null;
  disbursalBankName: string | null;
  disbursalBankAccount: string | null;
  disbursalIfscCode: string | null;
  officerRemarks: string | null;
};

export type CreateLeadRequest = {
  fullName: string;
  phone: string;
  guardianPhone?: string;
  email?: string;
  village?: string;
  address: string;
  branchCode: string;
  consentMode: ConsentMode;
  consentText: string;
};

export type UpdateLeadProfileRequest = {
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  maritalStatus: string;
  occupation: string;
  monthlyIncome: number;
  address: string;
  village: string;
  city: string;
  state: string;
  pinCode: string;
  aadhaarNumber: string;
  panNumber: string;
};

export type CaptureConsentRequest = {
  consentMode: ConsentMode;
  consentText: string;
  consentProofUrl?: string;
  witnessName?: string;
  witnessPhone?: string;
};

export type CreateLoanDraftRequest = {
  requestedAmount: number;
  tenureMonths: number;
  loanPurpose: string;
  disbursalMode: "BANK_TRANSFER" | "CASH";
  disbursalBankName?: string;
  disbursalBankAccount?: string;
  disbursalIfscCode?: string;
};

export type SubmitToOfficerRequest = {
  officerUserId?: number;
  remarks?: string;
};

export type ApplyLoanForUserRequest = {
  userId: number;
  requestedAmount: number;
  tenureMonths: number;
  loanPurpose: string;
  loanPurposeDescription?: string;
  userRemarks: string;
  disbursalMode: "BANK_TRANSFER" | "CASH";
  disbursalBankName?: string;
  disbursalBankAccount?: string;
  disbursalIfscCode?: string;
  disbursalBankProofUrl?: string;
  disbursalBankProofFileName?: string;
};

export type ApplyLoanForUserResponse = {
  loanApplicationId: number;
  applicationNumber: string;
  originChannel: string;
  status: string;
  requestedAmount: number;
};

export type AgentAssignedLoan = {
  loanApplicationId: number;
  applicationNumber: string;
  applicationStatus: string;
  requestedAmount: number | null;
  approvedAmount: number | null;
  tenureMonths: number | null;
  loanPurpose: string | null;
  disbursalMode: string | null;
  userId: number | null;
  userName: string | null;
  userPhone: string | null;
  userEmail: string | null;
  loanId: number | null;
  loanNumber: string | null;
  loanStatus: string | null;
  emiAmount: number | null;
  totalEmis: number | null;
  emisPending: number | null;
  emisOverdue: number | null;
  totalPaidAmount: number | null;
  outstandingPrincipal: number | null;
  nextDueDate: string | null;
  appliedAt: string | null;
  updatedAt: string | null;
};

export type AgentEmiSchedule = {
  emiScheduleId: number;
  emiNumber: number | null;
  dueDate: string | null;
  emiStatus: string;
  emiAmount: number | null;
  principalComponent: number | null;
  interestComponent: number | null;
  penaltyAmount: number | null;
  partialPaidAmount: number | null;
  remainingAmount: number | null;
  outstandingDueAmount: number | null;
  paidAmount: number | null;
  paidDate: string | null;
  paymentReference: string | null;
};

export type VerificationReport = {
  reportId: number;
  taskId: number;
  taskType: TaskType;
  reportSummary: string;
  residenceRemarks: string | null;
  businessRemarks: string | null;
  documentsMatched: boolean;
  applicantAvailable: boolean;
  addressVerified: boolean;
  incomeVerified: boolean;
  suspiciousActivity: boolean;
  riskNotes: string | null;
  visitAddress: string | null;
  visitLatitude: number | null;
  visitLongitude: number | null;
  cashCollectedAmount: number | null;
  cashCollectionRemarks: string | null;
  verificationStatus: VerificationStatus;
  imageCount: number;
  updatedAt: string | null;
};

export type SubmitVerificationReportRequest = {
  reportSummary: string;
  residenceRemarks?: string;
  businessRemarks?: string;
  documentsMatched: boolean;
  applicantAvailable: boolean;
  addressVerified: boolean;
  incomeVerified: boolean;
  suspiciousActivity: boolean;
  riskNotes?: string;
  visitAddress?: string;
  visitLatitude?: number;
  visitLongitude?: number;
  cashCollectedAmount?: number;
  cashCollectionRemarks?: string;
};

export type SubmitFullVerificationImageMeta = {
  imageTag?: string;
  description?: string;
  captureLatitude?: number;
  captureLongitude?: number;
};

export type SubmitFullVerificationRequest = {
  report: SubmitVerificationReportRequest;
  images: SubmitFullVerificationImageMeta[];
  files: File[];
};

export type SubmitFullVerificationResponse = {
  taskId: number;
  taskStatus: string;
  reportId: number;
  verificationStatus: string;
  imageCount: number;
  completedAt: string | null;
};

export type UploadVerificationImageResponse = {
  imageId: number;
  imageUrl: string;
  imageTag: string;
  imageCount: number;
};

export type UpdateAvailabilityRequest = {
  availability: AgentAvailability;
};

export type UpdateLocationRequest = {
  latitude: number;
  longitude: number;
};
