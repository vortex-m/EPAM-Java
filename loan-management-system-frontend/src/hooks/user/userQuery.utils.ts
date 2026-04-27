"use client";

import type { AxiosResponse } from "axios";

import type { ApiEnvelope } from "@/types/api.types";

export function unwrapApiData<T>(response: AxiosResponse<ApiEnvelope<T> | T>): T {
  const payload = response.data;

  if (typeof payload === "object" && payload !== null && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}

export function getApiMessage(response: AxiosResponse<unknown>, fallback: string): string {
  const payload = response.data;

  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string" &&
    payload.message.length > 0
  ) {
    return payload.message;
  }

  return fallback;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== "object" || error === null) {
    return fallback;
  }

  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message ?? err.message ?? fallback;
}
