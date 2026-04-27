"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import type { RootState } from "@/store";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = useSelector((state: RootState) => state.auth.isHome);

  useEffect(() => {
    if (isHome === false && pathname !== "/user/onboarding") {
      router.replace("/user/onboarding");
      return;
    }

    if (isHome === true && pathname === "/user/onboarding") {
      router.replace("/user/dashboard");
    }
  }, [isHome, pathname, router]);

  return <>{children}</>;
}
