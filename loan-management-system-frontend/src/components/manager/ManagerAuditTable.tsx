"use client";

import { AlertTriangle, Clock3, Flag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssistedAuditResponse } from "@/types/manager.types";
import { formatDateTime } from "@/lib/formatters";

type ManagerAuditTableProps = {
  title: string;
  description: string;
  rows: AssistedAuditResponse[];
  onFlag?: (auditId: number) => void;
  busyAuditId?: number | null;
};

function severityTone(severity?: string) {
  const normalized = (severity ?? "").toUpperCase();
  if (normalized === "CRITICAL") return "destructive" as const;
  if (normalized === "HIGH") return "secondary" as const;
  if (normalized === "MEDIUM") return "outline" as const;
  return "outline" as const;
}

export function ManagerAuditTable({
  title,
  description,
  rows,
  onFlag,
  busyAuditId,
}: ManagerAuditTableProps) {
  return (
    <Card className="border-border/80 bg-card/85 py-0 shadow-sm">
      <CardHeader className="border-b border-border/60 px-4 py-4">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="px-0 py-0">
        {rows.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No audit records available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-205">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  <th className="px-4 py-3">Audit ID</th>
                  <th className="px-4 py-3">Loan</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Flag</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.auditId} className="border-b border-border/50 align-top text-sm">
                    <td className="px-4 py-3 font-medium">#{row.auditId}</td>
                    <td className="px-4 py-3">{row.loanId ? `#${row.loanId}` : "-"}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{row.action}</p>
                      <p className="mt-0.5 max-w-70 text-xs text-muted-foreground">{row.details ?? "No details"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{row.performedBy ?? "System"}</p>
                      <p className="text-xs text-muted-foreground">{row.role ?? "-"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={severityTone(row.severity)}>{row.severity ?? "LOW"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div className="inline-flex items-center gap-1">
                        <Clock3 className="size-3.5" />
                        {formatDateTime(row.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {row.flagged ? (
                        <Badge variant="destructive" className="inline-flex items-center gap-1">
                          <AlertTriangle className="size-3.5" />
                          Flagged
                        </Badge>
                      ) : onFlag ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyAuditId === row.auditId}
                          onClick={() => onFlag(row.auditId)}
                        >
                          <Flag className="size-4" />
                          {busyAuditId === row.auditId ? "Flagging..." : "Flag"}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
