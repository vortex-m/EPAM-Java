"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { userApi } from "@/api/endpoints/user.api";
import type { KycDocument, KycStatusResponse } from "@/types/user.types";

import { getApiErrorMessage, getApiMessage, unwrapApiData } from "./userQuery.utils";

const kycQueryKey: string[] = ["user", "kyc"];
const dashboardQueryKey: string[] = ["user", "dashboard"];

export type UploadKycInput = {
  documentType: string;
  documentNumber: string;
  file: File;
};

export type UpdateKycInput = {
  docId: string;
  documentNumber?: string;
  file?: File;
};

export function useKycStatusQuery() {
  return useQuery({
    queryKey: kycQueryKey,
    queryFn: async () => {
      const response = await userApi.getKycStatus();
      const data = unwrapApiData<KycStatusResponse & { overallKycStatus?: string; documents?: Array<Record<string, unknown>> }>(response);

      const normalizedDocuments: KycDocument[] = (Array.isArray(data.documents) ? data.documents : []).map((rawDoc) => {
        const doc = rawDoc as Record<string, unknown>;
        const documentId = String(doc.documentId ?? doc.id ?? "");
        const documentType = String(doc.documentType ?? "UNKNOWN");
        const documentNumber = String(doc.documentNumber ?? "");
        const status = String(doc.status ?? doc.verificationStatus ?? "UNKNOWN").toUpperCase() as KycDocument["status"];
        const uploadedAt = (doc.uploadedAt ?? doc.createdAt ?? null) as string | null;
        const officerRemarks = (doc.officerRemarks ?? null) as string | null;
        const rejectionReason = (doc.rejectionReason ?? null) as string | null;
        const fileName = (doc.fileName ?? doc.originalFileName ?? null) as string | null;
        const fileUrl = (doc.fileUrl ?? doc.url ?? null) as string | null;

        return {
          documentId,
          documentType,
          documentNumber,
          status,
          uploadedAt,
          officerRemarks,
          rejectionReason,
          fileName,
          fileUrl,
        };
      });

      return {
        kycStatus: (data.kycStatus ?? data.overallKycStatus ?? "UNKNOWN") as KycStatusResponse["kycStatus"],
        documents: normalizedDocuments,
      };
    },
  });
}

export function useUploadKycMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadKycInput) => {
      const formData = new FormData();
      formData.append("documentType", data.documentType);
      formData.append("documentNumber", data.documentNumber);
      formData.append("file", data.file);
      return userApi.uploadKycDocument(formData);
    },
    onSuccess: async (response) => {
      toast.success(getApiMessage(response, "Document uploaded successfully."));
      await queryClient.invalidateQueries({ queryKey: kycQueryKey });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to upload document."));
    },
  });
}

export function useSubmitKycMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => userApi.submitKyc(),
    onSuccess: async (response) => {
      toast.success(getApiMessage(response, "KYC submitted for review."));
      await queryClient.invalidateQueries({ queryKey: kycQueryKey });
      await queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to submit KYC."));
    },
  });
}

export function useDeleteKycMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (docId: string) => userApi.deleteKycDocument(docId),
    onSuccess: async (response) => {
      toast.success(getApiMessage(response, "Document deleted successfully."));
      await queryClient.invalidateQueries({ queryKey: kycQueryKey });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to delete document."));
    },
  });
}

export function useUpdateKycMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateKycInput) => {
      const formData = new FormData();
      if (data.documentNumber) {
        formData.append("documentNumber", data.documentNumber);
      }
      if (data.file) {
        formData.append("file", data.file);
      }

      return userApi.updateKycDocument(data.docId, formData);
    },
    onSuccess: async (response) => {
      toast.success(getApiMessage(response, "Document updated successfully."));
      await queryClient.invalidateQueries({ queryKey: kycQueryKey });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update document."));
    },
  });
}
