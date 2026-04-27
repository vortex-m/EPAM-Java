import { Card, CardContent } from "@/components/ui/card";

import { formatCurrency } from "@/lib/formatters";

type PaymentBreakdownProps = {
  principal?: number;
  interest?: number;
  penalty?: number;
};

export function PaymentBreakdown({ principal = 0, interest = 0, penalty = 0 }: PaymentBreakdownProps) {
  const total = principal + interest + penalty;

  return (
    <Card className="py-0">
      <CardContent className="space-y-2 px-4 py-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Principal</span>
          <span className="font-medium text-foreground">{formatCurrency(principal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Interest</span>
          <span className="font-medium text-foreground">{formatCurrency(interest)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Penalty</span>
          <span className="font-medium text-foreground">{formatCurrency(penalty)}</span>
        </div>
        <div className="border-t pt-2">
          <div className="flex items-center justify-between text-base">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-semibold text-foreground">{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
