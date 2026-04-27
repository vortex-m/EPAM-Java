import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  UserPlus,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
  {
    title: "Create Field Agent",
    description:
      "Add a new agent profile for field verification, cash distribution, and collections support.",
    href: "/manager/staff/agents/create",
    icon: UserPlus,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    title: "Create Loan Officer",
    description:
      "Provision an officer account for lead management, KYC review, and loan processing.",
    href: "/manager/staff/officers/create",
    icon: Briefcase,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-50 dark:bg-sky-950/40",
  },
  {
    title: "Create Manager",
    description:
      "Create a manager user and assign them to a specific department such as Compliance or Audit.",
    href: "/manager/staff/managers/create",
    icon: Building2,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50 dark:bg-violet-950/40",
  },
];

export default function ManagerStaffPage() {
  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────── */}
      <div className="rounded-xl border border-border/80 bg-fintech-surface bg-fintech-glow p-5">
        <div className="flex items-center gap-3">
          <Users className="size-5 text-primary" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Staff Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Operations control panel for creating and managing branch workforce.
            </p>
          </div>
        </div>
      </div>

      {/* ── Role cards ───────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.href}
              className="group border-border/80 bg-card/85 py-0 shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader className="border-b border-border/60 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className={`rounded-xl p-2.5 ${card.iconBg}`}>
                    <Icon className={`size-5 ${card.iconColor}`} />
                  </span>
                  <CardTitle className="text-base">{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 px-5 py-4">
                <p className="flex-1 text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
                <Button asChild className="w-full sm:w-auto">
                  <Link href={card.href}>
                    Get Started
                    <ArrowRight className="ml-1.5 size-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
