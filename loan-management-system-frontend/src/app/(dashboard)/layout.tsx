"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import { DashboardShell } from "@/components/shared/DashboardShell";
import type { RootState } from "@/store";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (!token) {
      router.replace("/");
    }
  }, [token, router]);

  return <DashboardShell>{children}</DashboardShell>;
}