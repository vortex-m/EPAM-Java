"use client";

import { useMemo, useState } from "react";
import { UserCircle2 } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompleteOnboardingMutation, useProfileQuery } from "@/hooks/user/useUserProfile";
import { formatDisplayDate, formatMoney, getStatusBadge } from "@/lib/user-ui";
import type { OnboardingRequest } from "@/types/user.types";

type OnboardingFormState = {
  occupation: string;
  maritalStatus: string;
  fatherName: string;
  motherName: string;
  wifeName: string;
  husbandName: string;
  monthlyIncome: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  dateOfBirth: string;
  branchCode: string;
};

const maritalOptions = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"];

function getInitialForm(): OnboardingFormState {
  return {
    occupation: "",
    maritalStatus: "SINGLE",
    fatherName: "",
    motherName: "",
    wifeName: "",
    husbandName: "",
    monthlyIncome: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
    dateOfBirth: "",
    branchCode: "",
  };
}

function validateForm(form: OnboardingFormState, gender: string | null): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.occupation.trim()) errors.occupation = "Occupation is required.";
  if (!form.maritalStatus.trim()) errors.maritalStatus = "Marital status is required.";
  if (!form.fatherName.trim()) errors.fatherName = "Father name is required.";
  if (!form.motherName.trim()) errors.motherName = "Mother name is required.";
  if (!form.monthlyIncome.trim() || Number(form.monthlyIncome) <= 0) {
    errors.monthlyIncome = "Monthly income must be greater than 0.";
  }
  if (!form.street.trim()) errors.street = "Street is required.";
  if (!form.city.trim()) errors.city = "City is required.";
  if (!form.state.trim()) errors.state = "State is required.";
  if (!/^\d{6}$/.test(form.pinCode.trim())) errors.pinCode = "Pin code must be 6 digits.";
  if (!form.dateOfBirth) errors.dateOfBirth = "Date of birth is required.";
  if (!form.branchCode.trim()) errors.branchCode = "Branch code is required.";

  const upperGender = (gender ?? "").toUpperCase();
  const isMarried = form.maritalStatus === "MARRIED";

  if (isMarried && upperGender === "MALE" && !form.wifeName.trim()) {
    errors.wifeName = "Wife name is required for married male profile.";
  }

  if (isMarried && upperGender === "FEMALE" && !form.husbandName.trim()) {
    errors.husbandName = "Husband name is required for married female profile.";
  }

  return errors;
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value || "-"}</p>
    </div>
  );
}

export default function UserProfilePage() {
  const profileQuery = useProfileQuery();
  const completeOnboardingMutation = useCompleteOnboardingMutation();

  const [form, setForm] = useState<OnboardingFormState>(getInitialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const profile = profileQuery.data;

  const isProfileComplete = useMemo(() => {
    return Boolean(profile?.occupation);
  }, [profile?.occupation]);

  const kycBadge = getStatusBadge(profile?.kycStatus ?? "UNKNOWN");
  const creditBadge = getStatusBadge((profile?.creditScore ?? 0) >= 700 ? "APPROVED" : "PENDING");
  const riskBadge = getStatusBadge((profile?.riskScore ?? 0) <= 40 ? "APPROVED" : "PENDING");

  const shouldShowWifeName = form.maritalStatus === "MARRIED" && (profile?.gender ?? "").toUpperCase() === "MALE";
  const shouldShowHusbandName = form.maritalStatus === "MARRIED" && (profile?.gender ?? "").toUpperCase() === "FEMALE";

  const setField = (field: keyof OnboardingFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const submitOnboarding = async () => {
    if (!profile) {
      return;
    }

    const validationErrors = validateForm(form, profile.gender);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload: OnboardingRequest = {
      occupation: form.occupation.trim(),
      maritalStatus: form.maritalStatus,
      fatherName: form.fatherName.trim(),
      motherName: form.motherName.trim(),
      wifeName: shouldShowWifeName ? form.wifeName.trim() : undefined,
      husbandName: shouldShowHusbandName ? form.husbandName.trim() : undefined,
      monthlyIncome: Number(form.monthlyIncome),
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pinCode: form.pinCode.trim(),
      dateOfBirth: form.dateOfBirth,
      branchCode: form.branchCode.trim(),
    };

    await completeOnboardingMutation.mutateAsync(payload);
    await profileQuery.refetch();
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex items-start gap-3">
        <UserCircle2 className="mt-0.5 h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete onboarding details to continue loan onboarding and verification.
          </p>
        </div>
      </div>

      {profileQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-72" />
        </div>
      ) : null}

      {profileQuery.isError ? (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">Unable to load profile details.</CardContent>
        </Card>
      ) : null}

      {!profileQuery.isLoading && !profile ? (
        <EmptyState title="Profile not found" description="We could not find your profile data." />
      ) : null}

      {profile && !isProfileComplete ? (
        <Card className="py-0">
          <CardHeader className="border-b px-4 py-3">
            <CardTitle>Onboarding Form</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-4 py-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input id="occupation" value={form.occupation} onChange={(event) => setField("occupation", event.target.value)} />
                {errors.occupation ? <p className="text-xs text-destructive">{errors.occupation}</p> : null}
              </div>

              <div className="space-y-2">
                <Label>Marital Status</Label>
                <Select value={form.maritalStatus} onValueChange={(value) => setField("maritalStatus", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    {maritalOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.maritalStatus ? <p className="text-xs text-destructive">{errors.maritalStatus}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherName">Father Name</Label>
                <Input id="fatherName" value={form.fatherName} onChange={(event) => setField("fatherName", event.target.value)} />
                {errors.fatherName ? <p className="text-xs text-destructive">{errors.fatherName}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherName">Mother Name</Label>
                <Input id="motherName" value={form.motherName} onChange={(event) => setField("motherName", event.target.value)} />
                {errors.motherName ? <p className="text-xs text-destructive">{errors.motherName}</p> : null}
              </div>

              {shouldShowWifeName ? (
                <div className="space-y-2">
                  <Label htmlFor="wifeName">Wife Name</Label>
                  <Input id="wifeName" value={form.wifeName} onChange={(event) => setField("wifeName", event.target.value)} />
                  {errors.wifeName ? <p className="text-xs text-destructive">{errors.wifeName}</p> : null}
                </div>
              ) : null}

              {shouldShowHusbandName ? (
                <div className="space-y-2">
                  <Label htmlFor="husbandName">Husband Name</Label>
                  <Input id="husbandName" value={form.husbandName} onChange={(event) => setField("husbandName", event.target.value)} />
                  {errors.husbandName ? <p className="text-xs text-destructive">{errors.husbandName}</p> : null}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Monthly Income</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  value={form.monthlyIncome}
                  onChange={(event) => setField("monthlyIncome", event.target.value)}
                />
                {errors.monthlyIncome ? <p className="text-xs text-destructive">{errors.monthlyIncome}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street</Label>
                <Input id="street" value={form.street} onChange={(event) => setField("street", event.target.value)} />
                {errors.street ? <p className="text-xs text-destructive">{errors.street}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city} onChange={(event) => setField("city", event.target.value)} />
                {errors.city ? <p className="text-xs text-destructive">{errors.city}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={form.state} onChange={(event) => setField("state", event.target.value)} />
                {errors.state ? <p className="text-xs text-destructive">{errors.state}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pinCode">Pin Code</Label>
                <Input id="pinCode" value={form.pinCode} onChange={(event) => setField("pinCode", event.target.value)} maxLength={6} />
                {errors.pinCode ? <p className="text-xs text-destructive">{errors.pinCode}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" value={form.dateOfBirth} onChange={(event) => setField("dateOfBirth", event.target.value)} />
                {errors.dateOfBirth ? <p className="text-xs text-destructive">{errors.dateOfBirth}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchCode">Branch Code</Label>
                <Input id="branchCode" value={form.branchCode} onChange={(event) => setField("branchCode", event.target.value)} />
                {errors.branchCode ? <p className="text-xs text-destructive">{errors.branchCode}</p> : null}
              </div>
            </div>

            <Button onClick={submitOnboarding} disabled={completeOnboardingMutation.isPending}>
              {completeOnboardingMutation.isPending ? "Submitting..." : "Complete Onboarding"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {profile && isProfileComplete ? (
        <Card className="py-0">
          <CardHeader className="border-b px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Profile Details</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={kycBadge.variant} className={kycBadge.className}>
                  KYC: {kycBadge.label}
                </Badge>
                <Badge variant={creditBadge.variant} className={creditBadge.className}>
                  Credit: {profile.creditScore ?? "-"}
                </Badge>
                <Badge variant={riskBadge.variant} className={riskBadge.className}>
                  Risk: {profile.riskScore ?? "-"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 px-4 py-4 md:grid-cols-2">
            <ProfileField label="Name" value={profile.name} />
            <ProfileField label="Email" value={profile.email} />
            <ProfileField label="Phone" value={profile.phone} />
            <ProfileField label="Gender" value={profile.gender ?? "-"} />
            <ProfileField label="Occupation" value={profile.occupation ?? "-"} />
            <ProfileField label="Marital Status" value={profile.maritalStatus ?? "-"} />
            <ProfileField label="Father Name" value={profile.fatherName ?? "-"} />
            <ProfileField label="Mother Name" value={profile.motherName ?? "-"} />
            <ProfileField label="Wife Name" value={profile.wifeName ?? "-"} />
            <ProfileField label="Husband Name" value={profile.husbandName ?? "-"} />
            <ProfileField label="Monthly Income" value={formatMoney(profile.monthlyIncome)} />
            <ProfileField label="Date of Birth" value={formatDisplayDate(profile.dateOfBirth)} />
            <ProfileField label="Street" value={profile.street ?? "-"} />
            <ProfileField label="City" value={profile.city ?? "-"} />
            <ProfileField label="State" value={profile.state ?? "-"} />
            <ProfileField label="Pin Code" value={profile.pinCode ?? "-"} />
            <ProfileField label="Branch Code" value={profile.branchCode ?? "-"} />
            <ProfileField label="Updated At" value={formatDisplayDate(profile.updatedAt)} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
