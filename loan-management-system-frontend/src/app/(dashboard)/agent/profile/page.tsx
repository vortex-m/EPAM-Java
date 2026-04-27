"use client";

import { useMemo, useState } from "react";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgentProfileQuery, useCompleteAgentOnboardingMutation } from "@/hooks/agent/useAgentProfile";
import { formatIndianCurrency, getAvailabilityConfig } from "@/lib/agent.utils";

const schema = z.object({
  fatherName: z.string().min(2),
  motherName: z.string().min(2),
  dateOfBirth: z.string().min(1),
  gender: z.string().min(1),
  maritalStatus: z.string().min(1),
  aadhaarNumber: z.string().regex(/^\d{12}$/),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/),
  street: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  pinCode: z.string().regex(/^\d{6}$/),
});

type FormState = z.infer<typeof schema>;

export default function AgentProfilePage() {
  const profileQuery = useAgentProfileQuery();
  const onboardingMutation = useCompleteAgentOnboardingMutation();

  const profile = profileQuery.data;

  const [form, setForm] = useState<FormState>({
    fatherName: "",
    motherName: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    aadhaarNumber: "",
    panNumber: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const isComplete = useMemo(() => Boolean(profile?.fatherName), [profile?.fatherName]);

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <Card><CardContent className="p-4 text-sm text-destructive">Unable to load profile.</CardContent></Card>
    );
  }

  const availabilityConfig = getAvailabilityConfig(profile.agentAvailability);

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof FormState, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormState;
        if (!nextErrors[field]) nextErrors[field] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await onboardingMutation.mutateAsync(parsed.data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-blue-100 text-blue-800">{profile.agentCode ?? "-"}</Badge>
        <Badge className={availabilityConfig.color}>{availabilityConfig.label}</Badge>
        <Badge className="bg-emerald-100 text-emerald-800">{profile.agentStatus ?? "ACTIVE"}</Badge>
      </div>

      {!isComplete ? (
        <Card className="py-0">
          <CardHeader className="border-b px-4 py-3"><CardTitle>Complete Onboarding</CardTitle></CardHeader>
          <CardContent className="grid gap-4 px-4 py-4 md:grid-cols-2">
            {[
              ["fatherName", "Father Name"],
              ["motherName", "Mother Name"],
              ["dateOfBirth", "Date Of Birth"],
              ["aadhaarNumber", "Aadhaar Number"],
              ["panNumber", "PAN Number"],
              ["street", "Street"],
              ["city", "City"],
              ["state", "State"],
              ["pinCode", "Pincode"],
            ].map(([field, label]) => (
              <div key={field} className="space-y-2">
                <Label>{label}</Label>
                <Input
                  type={field === "dateOfBirth" ? "date" : "text"}
                  value={form[field as keyof FormState]}
                  onChange={(event) => setForm((s) => ({ ...s, [field]: event.target.value }))}
                />
                {errors[field as keyof FormState] ? <p className="text-xs text-destructive">{errors[field as keyof FormState]}</p> : null}
              </div>
            ))}
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(value) => setForm((s) => ({ ...s, gender: value }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender ? <p className="text-xs text-destructive">{errors.gender}</p> : null}
            </div>
            <div className="space-y-2">
              <Label>Marital Status</Label>
              <Select value={form.maritalStatus} onValueChange={(value) => setForm((s) => ({ ...s, maritalStatus: value }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE">Single</SelectItem>
                  <SelectItem value="MARRIED">Married</SelectItem>
                  <SelectItem value="DIVORCED">Divorced</SelectItem>
                </SelectContent>
              </Select>
              {errors.maritalStatus ? <p className="text-xs text-destructive">{errors.maritalStatus}</p> : null}
            </div>
            <div className="md:col-span-2">
              <Button onClick={submit} disabled={onboardingMutation.isPending}>
                {onboardingMutation.isPending ? "Saving..." : "Complete Onboarding"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0">
          <CardHeader className="border-b px-4 py-3"><CardTitle>Agent Profile</CardTitle></CardHeader>
          <CardContent className="grid gap-4 px-4 py-4 md:grid-cols-2">
            <p><span className="text-muted-foreground">Name:</span> {profile.name}</p>
            <p><span className="text-muted-foreground">Email:</span> {profile.email}</p>
            <p><span className="text-muted-foreground">Phone:</span> {profile.phone}</p>
            <p><span className="text-muted-foreground">Designation:</span> {profile.designation ?? "-"}</p>
            <p><span className="text-muted-foreground">Department:</span> {profile.department ?? "-"}</p>
            <p><span className="text-muted-foreground">Branch:</span> {profile.branchName ?? profile.branchCode ?? "-"}</p>
            <p><span className="text-muted-foreground">Region:</span> {profile.regionCode ?? "-"}</p>
            <p><span className="text-muted-foreground">DOB:</span> {profile.dateOfBirth ?? "-"}</p>
            <p><span className="text-muted-foreground">Gender:</span> {profile.gender ?? "-"}</p>
            <p><span className="text-muted-foreground">Marital:</span> {profile.maritalStatus ?? "-"}</p>
            <p><span className="text-muted-foreground">Aadhaar:</span> {profile.aadhaarNumber ? `********${profile.aadhaarNumber.slice(-4)}` : "-"}</p>
            <p><span className="text-muted-foreground">PAN:</span> {profile.panNumber ?? "-"}</p>
            <p><span className="text-muted-foreground">Street:</span> {profile.street ?? "-"}</p>
            <p><span className="text-muted-foreground">City:</span> {profile.city ?? "-"}</p>
            <p><span className="text-muted-foreground">State:</span> {profile.state ?? "-"}</p>
            <p><span className="text-muted-foreground">Pincode:</span> {profile.pinCode ?? "-"}</p>
            <p><span className="text-muted-foreground">Total Collected:</span> {formatIndianCurrency(profile.totalCollectedCash)}</p>
            <p><span className="text-muted-foreground">Total Settled:</span> {formatIndianCurrency(profile.totalSettledCash)}</p>
            <p><span className="text-muted-foreground">Total Unsettled:</span> {formatIndianCurrency(profile.totalUnsettledCash)}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
