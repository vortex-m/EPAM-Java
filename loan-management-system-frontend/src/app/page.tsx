import Link from "next/link";
import {
  ArrowRightIcon,
  BadgeDollarSignIcon,
  Building2Icon,
  CheckCircle2Icon,
  HandCoinsIcon,
  ShieldCheckIcon,
  WalletIcon,
} from "lucide-react";

import { ThemeToggle } from "../components/shared/ThemeToggle";

const stats = [
  { label: "Customers Served", value: "24,860" },
  { label: "Loans Disbursed", value: "$8.4M" },
  { label: "Average Approval", value: "< 24 hrs" },
  { label: "Repayment Success", value: "97.2%" },
];

const products = [
  {
    title: "Personal Loans",
    detail: "Transparent terms and quick approvals to handle urgent needs and goals.",
    icon: BadgeDollarSignIcon,
  },
  {
    title: "Business Growth Loans",
    detail: "Flexible repayment options to support inventory, expansion, and operations.",
    icon: HandCoinsIcon,
  },
  {
    title: "Smart Repayment Tracking",
    detail: "View schedules, due dates, and payment history in one secure account.",
    icon: WalletIcon,
  },
];

const highlights = [
  "Built for customers: simple onboarding, clear loan status, and easy tracking",
  "Powered by company-operated workflows and bank-grade security controls",
  "Dedicated support team managing approvals, disbursals, and repayment guidance",
];

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-2rem)] w-full flex-col gap-6">
      <header className="sticky top-3 z-30 rounded-2xl border border-border/80 bg-card/85 px-4 py-3 backdrop-blur-md sm:px-5 sm:py-4">
        <nav className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Building2Icon className="size-4.5" />
            </div>
            <div>
              
              <h1 className="text-base font-semibold text-foreground sm:text-lg">
                Customer Banking Portal
              </h1>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle compact className="shrink-0 rounded-lg border-border/80 bg-background/70" />
            <div className="flex items-center gap-2 rounded-xl border border-border/75 bg-background/60 p-1">
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:px-4 sm:py-2"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:px-4 sm:py-2"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <section className="grid w-full gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className=" p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
            <ShieldCheckIcon className="size-3.5" />
            Trusted by customers, operated by our finance company
          </div>

          <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            Simple, secure loans for everyday people and growing businesses.
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Apply, verify, track approvals, and manage repayments from one account while our company team handles the full process behind the scenes.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Access Dashboard
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link
              href="/register"
              className="rounded-xl border border-border/80 bg-card/75 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Open User Account
            </Link>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="rounded-xl border border-border/80 bg-background/60 p-4">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-7">
          <h3 className="text-lg font-semibold text-foreground">Why Customers Choose Us</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2Icon className="mt-0.5 size-4 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-xl border border-border/80 bg-background/55 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Company Managed Platform</p>
            <p className="mt-1.5 text-sm text-foreground">
              This site is owned and operated by our company. Customers can register a USER account and track their loan journey safely.
            </p>
          </div>
        </div>
      </section>

      <section className=" p-6 sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">Loan Services For You</h3>
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            View your dashboard
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {products.map((product) => {
            const Icon = product.icon;

            return (
              <article key={product.title} className="rounded-xl border border-border/80 bg-background/65 p-5 transition-colors hover:bg-muted/45">
                <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon className="size-4.5" />
                </div>
                <h4 className="text-base font-semibold text-foreground">{product.title}</h4>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{product.detail}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
