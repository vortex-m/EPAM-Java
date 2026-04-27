import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    id: 1,
    title: "Create Lead",
    description: "Start by creating a new lead with basic details and consent information.",
    href: "/agent/leads/create",
    cta: "Start Step 1",
  },
  {
    id: 2,
    title: "Open My Leads",
    description: "View all leads and pick the lead you want to process next.",
    href: "/agent/leads/mine",
    cta: "Go to Step 2",
  },
  {
    id: 3,
    title: "Complete Lead Workflow",
    description: "From selected lead page, complete profile update, KYC upload, consent, loan draft, and submit to officer in sequence.",
    href: "/agent/leads/mine",
    cta: "Continue Steps 3-7",
  },
];

export default function AgentLeadsPage() {
  return (
    <div className="space-y-4">
      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle>Lead Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 py-4 text-sm text-muted-foreground">
          <p>Use this single Leads section to complete the entire lead process step by step.</p>
          <p>The lead details page guides you through profile, KYC, consent, loan draft, and final submission.</p>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.id} className="py-0">
            <CardHeader className="border-b px-4 py-3">
              <CardTitle className="text-base">Step {step.id}: {step.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 py-4">
              <p className="text-sm text-muted-foreground">{step.description}</p>
              <Button asChild>
                <Link href={step.href}>{step.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
