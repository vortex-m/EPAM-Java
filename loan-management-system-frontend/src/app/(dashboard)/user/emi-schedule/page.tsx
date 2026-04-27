import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/user/SectionContainer";

export default function EmiScheduleLandingPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <SectionContainer title="EMI Schedule" description="Open a disbursed loan first to view installment schedule.">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Select a loan from My Loans, then use View EMI Schedule action.</p>
          <Button asChild>
            <Link href="/user/loans">Go to My Loans</Link>
          </Button>
        </div>
      </SectionContainer>
    </div>
  );
}
