import api from "../axios.config";

export const agentApi = {
  getProfile: () => api.get("/agents/profile"),
  completeOnboarding: (data: unknown) => api.put("/agents/onboarding", data),
  updateAvailability: (data: unknown) =>
    api.patch("/agents/availability", data),
  updateLocation: (data: unknown) => api.patch("/agents/location", data),

  getDashboard: () => api.get("/agents/dashboard"),

  getTasks: (params?: { status?: string; taskType?: string }) =>
    api.get("/agents/tasks", { params }),
  getTaskDetail: (taskId: number | string) =>
    api.get(`/agents/tasks/${taskId}`),
  acceptTask: (taskId: number | string) =>
    api.post(`/agents/tasks/${taskId}/accept`),
  startTask: (taskId: number | string) =>
    api.post(`/agents/tasks/${taskId}/start`),
  completeTask: (taskId: number | string) =>
    api.post(`/agents/tasks/${taskId}/complete`),
  declineTask: (taskId: number | string, data: unknown) =>
    api.post(`/agents/tasks/${taskId}/decline`, data),

  generateDisbursalOtp: (data: unknown) =>
    api.post("/agents/cash-disbursal/otp/generate", data),
  verifyDisbursalOtp: (data: unknown) =>
    api.post("/agents/cash-disbursal/otp/verify", data),
  generateCollectionOtp: (data: unknown) =>
    api.post("/agents/cash-collection/otp/generate", data),
  verifyCollectionOtp: (data: unknown) =>
    api.post("/agents/cash-collection/otp/verify", data),

  createLead: (data: unknown) => api.post("/agents/leads", data),
  getMyLeads: () => api.get("/agents/leads/mine"),
  getLeadDetails: (leadId: number | string) =>
    api.get(`/agents/leads/${leadId}`),
  updateLeadProfile: (leadId: number | string, data: unknown) =>
    api.put(`/agents/leads/${leadId}/profile`, data),
  uploadLeadKyc: (leadId: number | string, formData: FormData) =>
    api.post(`/agents/leads/${leadId}/kyc/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  captureConsent: (leadId: number | string, data: unknown) =>
    api.post(`/agents/leads/${leadId}/consent`, data),
  createLoanDraft: (leadId: number | string, data: unknown) =>
    api.post(`/agents/leads/${leadId}/loan-draft`, data),
  submitToOfficer: (leadId: number | string, data: unknown) =>
    api.post(`/agents/leads/${leadId}/submit-to-officer`, data),

  applyLoanForUser: (data: unknown) =>
    api.post("/agents/loans/apply-for-user", data),
  getAssignedUsersAndLoans: () => api.get("/agents/loans/assigned-users"),
  getLoanEmis: (loanId: number | string) =>
    api.get(`/agents/loans/${loanId}/emis`),

  submitVerificationReport: (taskId: number | string, data: unknown) =>
    api.post(`/agents/tasks/${taskId}/report`, data),
  submitFullVerification: (
    taskId: number | string,
    data: { report: unknown; images: unknown[]; files: File[] },
  ) => {
    const formData = new FormData();
    formData.append(
      "payload",
      new Blob(
        [
          JSON.stringify({
            report: data.report,
            images: data.images,
          }),
        ],
        { type: "application/json" },
      ),
    );
    data.files.forEach((file) => formData.append("files", file));

    return api.post(`/agents/tasks/${taskId}/verification/submit`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getVerificationReport: (taskId: number | string) =>
    api.get(`/agents/tasks/${taskId}/report`),
  uploadVerificationImage: (taskId: number | string, formData: FormData) =>
    api.post(`/agents/tasks/${taskId}/report/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
