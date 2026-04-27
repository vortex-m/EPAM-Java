import api from "../axios.config";

export const officerApi = {
	getDashboard: () => api.get("/officers/dashboard"),

	getLeadQueue: () => api.get("/officers/leads/queue"),
	decideLead: (leadId: number | string, data: unknown) =>
		api.post(`/officers/leads/${leadId}/decision`, data),
	convertLeadToUser: (leadId: number | string, data: unknown) =>
		api.post(`/officers/leads/${leadId}/convert-user`, data),

	getPendingKycDocuments: () => api.get("/officers/kyc/documents/pending"),
	getKycDocumentByUser: (userId: number | string, documentId: number | string) =>
		api.get(`/officers/kyc/users/${userId}/documents/${documentId}`),
	reviewKycDocument: (
		userId: number | string,
		documentId: number | string,
		data: unknown,
	) => api.post(`/officers/kyc/users/${userId}/documents/${documentId}/review`, data),

	getPendingLoans: () => api.get("/officers/loans/pending"),
	getAssignableAgents: (loanApplicationId?: number | string) => {
		if (loanApplicationId) {
			return api
				.get(`/officers/loans/${loanApplicationId}/assignable-agents`)
				.catch(() => api.get("/officers/loans/agents/available"));
		}

		return api.get("/officers/loans/agents/available");
	},
	getLoanUserProfile: (loanApplicationId: number | string) =>
		api.get(`/officers/loans/${loanApplicationId}/user-profile`),
	getVerificationEvidence: (loanApplicationId: number | string) =>
		api.get(`/officers/loans/${loanApplicationId}/verification-evidence`),
	assignAgent: (loanApplicationId: number | string, data: unknown) =>
		api.post(`/officers/loans/${loanApplicationId}/assign-agent`, data),
	decideLoan: (loanApplicationId: number | string, data: unknown) =>
		api.post(`/officers/loans/${loanApplicationId}/decision`, data),

	getCashDisbursalQueue: () => api.get("/officers/loans/cash-disbursal/pending"),
	generateHandoverOtp: (data: unknown) =>
		api.post("/officers/loans/cash-disbursal/otp/generate", data),
	verifyHandoverOtp: (data: unknown) =>
		api.post("/officers/loans/cash-disbursal/otp/verify", data),

	getUnsettledCashPayments: () => api.get("/officers/cash-settlements/unsettled"),
	getSettlementHistory: () => api.get("/officers/cash-settlements/history"),
	settleCash: (data: unknown) => api.post("/officers/cash-settlements", data),
};
