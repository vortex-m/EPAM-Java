"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ComponentType } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  IndianRupee,
  Layers,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardQuery } from "@/hooks/user/useUserDashboard";
import { formatMoney, getStatusBadge } from "@/lib/user-ui";

type StatCardProps = {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
};

function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <Card className="py-0">
      <CardHeader className="border-b px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-4">
        <p className="text-xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function UserDashboardPage() {
  const router = useRouter();
  const dashboardQuery = useDashboardQuery();

  useEffect(() => {
    if (dashboardQuery.data && dashboardQuery.data.isHome === false) {
      router.replace("/user/profile");
    }
  }, [dashboardQuery.data, router]);

  const kycBadge = getStatusBadge(dashboardQuery.data?.kycStatus);
  const showKycNudge = (dashboardQuery.data?.kycStatus ?? "").toUpperCase() !== "APPROVED";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">User Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your loans, EMI progress, KYC status, and repayment activity.
          </p>
        </div>
        <Badge variant={kycBadge.variant} className={kycBadge.className}>
          KYC: {kycBadge.label}
        </Badge>
      </div>

      {showKycNudge ? (
        <Card className="border-amber-200 bg-amber-50 py-0">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-5 w-5 text-amber-700" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Complete your KYC to unlock faster approvals</p>
                <p className="text-xs text-amber-800">
                  Your current KYC status is {kycBadge.label}. Upload pending documents and submit for review.
                </p>
              </div>
            </div>
            <Button asChild size="sm">
              <Link href="/user/kyc">Go to KYC</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/user/loans/apply">Apply Loan</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/user/loans">View Loans</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/user/kyc">KYC</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/user/payments">Payment History</Link>
        </Button>
      </div>

      {dashboardQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
      ) : null}

      {dashboardQuery.isError ? (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">Unable to load dashboard data.</CardContent>
        </Card>
      ) : null}

      {dashboardQuery.data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard title="Total Loans" value={String(dashboardQuery.data.totalLoans)} icon={Layers} />
          <StatCard title="Total EMIs" value={String(dashboardQuery.data.totalEmis)} icon={CreditCard} />
          <StatCard title="Paid EMIs" value={String(dashboardQuery.data.paidEmis)} icon={CheckCircle} />
          <StatCard title="Overdue EMIs" value={String(dashboardQuery.data.overdueEmis)} icon={Clock} />
          <StatCard
            title="Outstanding Principal"
            value={formatMoney(dashboardQuery.data.totalOutstandingPrincipal)}
            icon={IndianRupee}
          />
          <StatCard title="Total Applications" value={String(dashboardQuery.data.totalApplications)} icon={FileText} />
          <StatCard title="Pending" value={String(dashboardQuery.data.pendingApplications)} icon={Clock} />
          <StatCard title="Approved" value={String(dashboardQuery.data.approvedApplications)} icon={ShieldCheck} />
          <StatCard title="Disbursed" value={String(dashboardQuery.data.disbursedApplications)} icon={CheckCircle} />
        </div>
      ) : null}
    </div>
  );
}
