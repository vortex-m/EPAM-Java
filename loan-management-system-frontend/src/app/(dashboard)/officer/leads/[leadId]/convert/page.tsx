"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useOfficerLeadConvertMutation } from "@/hooks/officer/useOfficerWorkflow";

export default function OfficerLeadConvertPage() {
  const params = useParams<{ leadId: string }>();
  const leadId = Number(params.leadId ?? 0);

  const [loanAmount, setLoanAmount] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [disbursalMode, setDisbursalMode] = useState<"CASH" | "BANK">("CASH");

  const convertMutation = useOfficerLeadConvertMutation();

  const onSubmit = () => {
    convertMutation.mutate({
      leadId,
      payload: {
        loanAmount: Number(loanAmount),
        loanPurpose,
        disbursalMode,
      },
    });
  };

  return (
    <div className="space-y-5">
      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-lg">Convert Lead to Loan Application</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 py-4">
          <div className="text-sm text-muted-foreground">
            Lead ID: <Badge variant="outline">{leadId}</Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="loanAmount">Loan Amount</Label>
              <Input
                id="loanAmount"
                type="number"
                value={loanAmount}
                onChange={(event) => setLoanAmount(event.target.value)}
                placeholder="50000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disbursalMode">Disbursal Mode</Label>
              <Select
                value={disbursalMode}
                onValueChange={(value) => setDisbursalMode(value as "CASH" | "BANK")}
              >
                <SelectTrigger id="disbursalMode">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">CASH</SelectItem>
                  <SelectItem value="BANK">BANK</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanPurpose">Loan Purpose</Label>
            <Textarea
              id="loanPurpose"
              value={loanPurpose}
              onChange={(event) => setLoanPurpose(event.target.value)}
              placeholder="Personal expenses"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onSubmit}
              disabled={
                convertMutation.isPending ||
                !loanPurpose.trim() ||
                !loanAmount ||
                Number(loanAmount) <= 0
              }
            >
              Convert Lead
            </Button>
            <Button asChild variant="outline">
              <Link href={`/officer/leads/${leadId}`}>Back to Lead</Link>
            </Button>
          </div>

          {convertMutation.data?.data ? (
            <Card className="border-emerald-200 bg-emerald-50 py-0">
              <CardContent className="px-4 py-3 text-sm text-emerald-900">
                Loan application created: {convertMutation.data.data.applicationNumber} (User ID: {convertMutation.data.data.userId})
              </CardContent>
            </Card>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
