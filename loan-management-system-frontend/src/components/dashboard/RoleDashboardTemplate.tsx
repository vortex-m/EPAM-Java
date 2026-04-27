"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownIcon, ArrowUpIcon, EyeIcon, UsersIcon } from "lucide-react";

type RoleDashboardTemplateProps = {
  role: "ADMIN" | "MANAGER" | "OFFICER" | "AGENT" | "USER";
};

const titles: Record<RoleDashboardTemplateProps["role"], string> = {
  ADMIN: "Admin Dashboard",
  MANAGER: "Manager Dashboard",
  OFFICER: "Officer Dashboard",
  AGENT: "Agent Dashboard",
  USER: "User Dashboard",
};

const metrics = [
  { title: "Total Leads", value: "12,486", delta: "+15.2%", up: true, tone: "bg-blue-500/20 text-blue-500" },
  { title: "Conversion Rate", value: "24.8%", delta: "+3.1%", up: true, tone: "bg-emerald-500/20 text-emerald-500" },
  { title: "Total Customers", value: "3,092", delta: "+8.7%", up: true, tone: "bg-amber-500/20 text-amber-500" },
  { title: "Monthly Revenue", value: "$48,392", delta: "-2.4%", up: false, tone: "bg-violet-500/20 text-violet-500" },
];

const leadRows = [
  { status: "Qualified", email: "mark.ward@lms.com", source: "Email" },
  { status: "Pending", email: "kriti121232@google.com", source: "Call" },
  { status: "Approved", email: "rohit.kumar@mail.com", source: "Social" },
  { status: "Review", email: "ops.branch@lms.com", source: "Referral" },
];

export function RoleDashboardTemplate({ role }: RoleDashboardTemplateProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{titles[role]}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Performance overview, trends, and module-level summaries for {role.toLowerCase()} operations.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="py-0">
            <CardHeader className="border-b px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className={`rounded-lg p-2 ${metric.tone}`}>
                  <UsersIcon className="size-4" />
                </div>
                <Badge variant="outline" className="font-normal">
                  {metric.up ? <ArrowUpIcon className="mr-1 size-3.5 text-emerald-500" /> : <ArrowDownIcon className="mr-1 size-3.5 text-rose-500" />}
                  {metric.delta}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{metric.title}</p>
              <p className="text-2xl font-semibold text-foreground">{metric.value}</p>
              <button className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                <EyeIcon className="size-3.5" /> View all
              </button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="py-0">
          <CardHeader className="border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue</CardTitle>
                <p className="text-xs text-muted-foreground">Showing total visitors for the last 30 days</p>
              </div>
              <Tabs defaultValue="month" className="w-auto">
                <TabsList>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="px-4 py-4">
            <div className="h-70 rounded-xl border border-dashed border-border bg-linear-to-b from-primary/5 to-transparent p-4">
              <svg viewBox="0 0 700 220" className="h-full w-full">
                <path d="M20 170 C90 40,130 40,180 120 C230 190,280 80,330 100 C380 120,430 40,490 60 C540 80,600 150,680 110" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary" />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardHeader className="border-b px-4 py-3">
            <CardTitle>Leads by Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-4 py-4">
            <div className="mx-auto grid size-44 place-content-center rounded-full bg-[conic-gradient(var(--color-primary)_0_40%,oklch(0.72_0.13_85)_40%_65%,oklch(0.68_0.12_150)_65%_85%,oklch(0.82_0.01_255)_85%_100%)]">
              <div className="grid size-28 place-content-center rounded-full bg-card">
                <p className="text-center text-3xl font-semibold text-foreground">935</p>
                <p className="text-center text-xs text-muted-foreground">Leads</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Social</p>
                <p className="font-semibold text-foreground">275</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-semibold text-foreground">200</p>
              </div>
              <div>
                <p className="text-muted-foreground">Call</p>
                <p className="font-semibold text-foreground">287</p>
              </div>
              <div>
                <p className="text-muted-foreground">Others</p>
                <p className="font-semibold text-foreground">173</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
