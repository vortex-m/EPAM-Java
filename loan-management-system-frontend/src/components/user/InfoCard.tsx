import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type InfoCardProps = {
  title: string;
  value: string;
  helperText?: string;
};

export function InfoCard({ title, value, helperText }: InfoCardProps) {
  return (
    <Card className="py-0">
      <CardHeader className="border-b px-4 py-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 px-4 py-4">
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
      </CardContent>
    </Card>
  );
}
