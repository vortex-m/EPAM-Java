import { ReactNode } from "react";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex h-[calc(100vh-2rem)] w-full overflow-hidden rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-h-0 flex-1 overflow-y-auto bg-background/30 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}