import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-2rem)] w-full items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card/85 p-3 backdrop-blur">
        {children}
      </div>
    </div>
  );
}
