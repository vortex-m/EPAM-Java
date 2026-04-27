import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/user/SectionContainer";

export default function LoanDetailsLandingPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <SectionContainer title="Loan Details" description="Select a loan application to open detailed application and assignment information.">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>This section requires a selected loan application.</p>
          <Button asChild>
            <Link href="/user/loans">Go to My Loans</Link>
          </Button>
        </div>
      </SectionContainer>
    </div>
  );
}
