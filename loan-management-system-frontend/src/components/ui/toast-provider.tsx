"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster position="top-right" richColors closeButton duration={3500} />
    </>
  );
}
