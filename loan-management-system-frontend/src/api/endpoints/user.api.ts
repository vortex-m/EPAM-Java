import api from "../axios.config";

export const userApi = {
  getProfile: () => api.get("/users/profile"),
  completeOnboarding: (data: unknown) => api.put("/users/onboarding", data),

  getDashboard: () => api.get("/users/dashboard"),

  getAllLoans: () => api.get("/users/loans"),
  getLoanDetails: (loanId: string) => api.get(`/users/loans/${loanId}`),
  uploadBankProof: (file: File | FormData) => {
    const formData = file instanceof FormData ? file : new FormData();
    if (!(file instanceof FormData)) {
      formData.append("file", file);
    }

    return api.post("/users/loans/bank-proof/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  applyForLoan: (data: unknown) => api.post("/users/loans/apply", data),

  getKycStatus: () => api.get("/users/kyc"),
  uploadKycDocument: (data: FormData) =>
    api.post("/users/kyc/upload", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  submitKyc: () => api.post("/users/kyc/submit"),
  deleteKycDocument: (docId: number | string) => api.delete(`/users/kyc/${docId}`),
  updateKycDocument: (docId: number | string, data: FormData) =>
    api.put(`/users/kyc/${docId}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getEmiSchedule: (loanId: string) => api.get(`/users/payments/loans/${loanId}/schedule`),
  payEmi: (loanIdOrData: string | unknown, body?: unknown) => {
    if (typeof loanIdOrData === "string" && body !== undefined) {
      return api.post("/users/payments/emi/pay", { ...((body as object) ?? {}), loanId: loanIdOrData });
    }

    return api.post("/users/payments/emi/pay", loanIdOrData);
  },
  getPaymentHistory: () => api.get("/users/payments/history"),
  getLoanPaymentHistory: (loanId: string) => api.get(`/users/payments/loans/${loanId}/history`),

  // Backward-compatible aliases for existing modules.
  updateOnboarding: (body: unknown) => api.put("/users/onboarding", body),
  uploadKycDoc: (form: FormData) =>
    api.post("/users/kyc/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateKycDoc: (documentId: number | string, form: FormData) =>
    api.put(`/users/kyc/${documentId}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteKycDoc: (documentId: number | string) => api.delete(`/users/kyc/${documentId}`),
  applyLoan: (body: unknown) => api.post("/users/loans/apply", body),
  getLoans: () => api.get("/users/loans"),
  getLoanDetail: (loanApplicationId: string) => api.get(`/users/loans/${loanApplicationId}`),
  getLoanPayments: (loanId: string) => api.get(`/users/payments/loans/${loanId}/history`),
  getAllLoanPayments: () => api.get("/users/payments/history"),
};