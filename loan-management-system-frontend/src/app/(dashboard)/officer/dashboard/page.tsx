"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, CircleDollarSign, Clock3, FileClock, FileSearch, HandCoins, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfficerDashboardQuery } from "@/hooks/officer/useOfficerWorkflow";
import { formatCurrency } from "@/lib/formatters";

export default function OfficerDashboardHomePage() {
  const dashboardQuery = useOfficerDashboardQuery();

  if (dashboardQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-destructive">Unable to load officer dashboard.</CardContent>
      </Card>
    );
  }

  const d = dashboardQuery.data;

  const queueCards = [
    {
      title: "Pending KYC Documents",
      value: d.pendingKycDocuments,
      icon: FileSearch,
      href: "/officer/kyc",
      tone: "text-sky-700",
    },
    {
      title: "Pending Loan Queue",
      value: d.pendingLoanQueue,
      icon: FileClock,
      href: "/officer/loans",
      tone: "text-indigo-700",
    },
    {
      title: "Under Review",
      value: d.pendingUnderReviewQueue,
      icon: Clock3,
      href: "/officer/loans",
      tone: "text-amber-700",
    },
    {
      title: "Manager Approval Pending",
      value: d.pendingManagerApprovalQueue,
      icon: ShieldCheck,
      href: "/officer/loans",
      tone: "text-emerald-700",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card/80 p-5">
        <h1 className="text-2xl font-semibold tracking-tight">Officer Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Officer code: {d.officerCode} | Branch: {d.branchCode}
        </p>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {queueCards.map((item) => (
          <Card key={item.title} className="py-0">
            <CardHeader className="border-b px-4 py-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>{item.title}</span>
                <item.icon className="size-4" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 py-4">
              <p className={`text-2xl font-semibold ${item.tone}`}>{item.value}</p>
              <Button asChild size="sm" variant="outline">
                <Link href={item.href}>Open Queue</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <Card className="py-0">
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm">Review Performance</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3 px-4 py-4">
            <div>
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="mt-1 text-lg font-semibold text-emerald-700">{d.reviewsApproved}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rejected</p>
              <p className="mt-1 text-lg font-semibold text-rose-700">{d.reviewsRejected}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Re-verify</p>
              <p className="mt-1 text-lg font-semibold text-amber-700">{d.reviewsReverify}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm">Cash Tracking</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 px-4 py-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Collected</p>
              <p className="mt-1 text-base font-semibold">{formatCurrency(d.totalCollectedCash)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Settled</p>
              <p className="mt-1 text-base font-semibold text-emerald-700">{formatCurrency(d.totalSettledCash)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unsettled</p>
              <p className="mt-1 text-base font-semibold text-amber-700">{formatCurrency(d.totalUnsettledCash)}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/officer/kyc">View KYC</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/officer/loans">Review Loans</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/officer/cash-disbursal">Cash Disbursal</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/officer/cash/settlements">Settle Cash</Link>
        </Button>
      </div>

      <Card className="border-amber-200 bg-amber-50 py-0">
        <CardContent className="flex items-center gap-2 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="size-4" />
          Approved cash loans require two-stage OTP handover before agent delivery.
          <CheckCircle2 className="ml-auto size-4 text-amber-700" />
        </CardContent>
      </Card>
    </div>
  );
}
