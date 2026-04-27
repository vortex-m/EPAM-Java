import Link from "next/link";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { canAccessRepaymentActions } from "@/hooks/useLoanActions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { LoanListItem } from "@/types/loan.types";

type LoanCardProps = {
  loan: LoanListItem;
};

export function LoanCard({ loan }: LoanCardProps) {
  const repaymentActionsEnabled = canAccessRepaymentActions(loan);

  return (
    <Card className="py-0">
      <CardContent className="space-y-3 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{loan.applicationNumber}</p>
            <p className="text-xs text-muted-foreground">Loan: {loan.loanNumber || "Not assigned yet"}</p>
          </div>
          <StatusBadge status={loan.status} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Requested</p>
            <p className="font-medium text-foreground">{formatCurrency(loan.requestedAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Approved</p>
            <p className="font-medium text-foreground">{formatCurrency(loan.approvedAmount ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">EMI</p>
            <p className="font-medium text-foreground">{formatCurrency(loan.emiAmount ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Next Due</p>
            <p className="font-medium text-foreground">{formatDate(loan.nextDueDate)}</p>
          </div>
        </div>

        {!repaymentActionsEnabled ? (
          <p className="text-xs text-muted-foreground">
            EMI actions will unlock once this loan is disbursed.
          </p>
        ) : null}

        <Button asChild className="w-full">
          <Link href={`/user/loans/${loan.loanApplicationId}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
