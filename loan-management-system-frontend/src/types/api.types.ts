export type ApiEnvelope<T> = {
	success?: boolean;
	message?: string;
	timestamp?: string;
	data: T;
};

export type UserDashboardData = {
	userId: number;
	isHome: boolean;
	kycStatus: string;
	totalApplications: number;
	pendingApplications: number;
	approvedApplications: number;
	disbursedApplications: number;
	totalLoans: number;
	totalEmis: number;
	paidEmis: number;
	overdueEmis: number;
	totalOutstandingPrincipal: number;
};

export type UserProfileData = {
	userId: number;
	name: string;
	email: string;
	phone: string;
	role: string;
	status: string;
	isHome: boolean;
	fatherName: string | null;
	motherName: string | null;
	wifeName: string | null;
	husbandName: string | null;
	dateOfBirth: string | null;
	gender: string | null;
	occupation: string | null;
	maritalStatus: string | null;
	monthlyIncome: number | null;
	bankName: string | null;
	bankAccountNumber: string | null;
	ifscCode: string | null;
	branchCode: string | null;
	branchName: string | null;
	regionCode: string | null;
	aadhaarNumber: string | null;
	panNumber: string | null;
	kycStatus: string | null;
	street: string | null;
	city: string | null;
	state: string | null;
	pinCode: string | null;
	creditScore: number | null;
	riskScore: number | null;
	scoreUpdatedAt: string | null;
	createdAt: string | null;
	updatedAt: string | null;
};
