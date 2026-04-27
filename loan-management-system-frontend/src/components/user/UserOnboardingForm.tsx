"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import { userApi } from "@/api/endpoints/user.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setIsHome } from "@/store/slices/auth.slice";
import type { ApiEnvelope, UserProfileData } from "@/types/api.types";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "PREFER_NOT_TO_SAY", label: "Preferred not to say" },
] as const;

const MARITAL_STATUS_OPTIONS = [
  { value: "SINGLE", label: "Single" },
  { value: "MARRIED", label: "Married" },
] as const;

function normalizeGenderValue(value?: string | null) {
  const normalized = (value ?? "").trim().toUpperCase();
  if (normalized === "MALE") return "MALE";
  if (normalized === "FEMALE") return "FEMALE";
  if (normalized === "PREFER_NOT_TO_SAY" || normalized === "PREFERRED_NOT_TO_SAY") {
    return "PREFER_NOT_TO_SAY";
  }
  return "";
}

function normalizeMaritalStatusValue(value?: string | null) {
  const normalized = (value ?? "").trim().toUpperCase();
  if (normalized === "MARRIED") return "MARRIED";
  if (normalized === "SINGLE") return "SINGLE";
  return "";
}

type ProfileFormState = {
  fatherName: string;
  motherName: string;
  wifeName: string;
  husbandName: string;
  dateOfBirth: string;
  gender: string;
  occupation: string;
  maritalStatus: string;
  monthlyIncome: string;
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
  aadhaarNumber: string;
  panNumber: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
};

const emptyForm: ProfileFormState = {
  fatherName: "",
  motherName: "",
  wifeName: "",
  husbandName: "",
  dateOfBirth: "",
  gender: "",
  occupation: "",
  maritalStatus: "",
  monthlyIncome: "",
  bankName: "",
  bankAccountNumber: "",
  ifscCode: "",
  aadhaarNumber: "",
  panNumber: "",
  street: "",
  city: "",
  state: "",
  pinCode: "",
};

function toForm(profile: UserProfileData): ProfileFormState {
  return {
    fatherName: profile.fatherName ?? "",
    motherName: profile.motherName ?? "",
    wifeName: profile.wifeName ?? "",
    husbandName: profile.husbandName ?? "",
    dateOfBirth: profile.dateOfBirth ?? "",
    gender: normalizeGenderValue(profile.gender),
    occupation: profile.occupation ?? "",
    maritalStatus: normalizeMaritalStatusValue(profile.maritalStatus),
    monthlyIncome:
      typeof profile.monthlyIncome === "number" ? String(profile.monthlyIncome) : "",
    bankName: profile.bankName ?? "",
    bankAccountNumber: profile.bankAccountNumber ?? "",
    ifscCode: profile.ifscCode ?? "",
    aadhaarNumber: profile.aadhaarNumber ?? "",
    panNumber: profile.panNumber ?? "",
    street: profile.street ?? "",
    city: profile.city ?? "",
    state: profile.state ?? "",
    pinCode: profile.pinCode ?? "",
  };
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null) return fallback;
  const err = error as { response?: { data?: { message?: string } } };
  return err.response?.data?.message ?? fallback;
}

type UserOnboardingFormProps = {
  heading: string;
  description: string;
};

export function UserOnboardingForm({ heading, description }: UserOnboardingFormProps) {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [form, setForm] = useState<ProfileFormState>(emptyForm);

  const showMaritalStatus = form.gender !== "PREFER_NOT_TO_SAY";
  const isMarried = form.maritalStatus === "MARRIED";
  const showWifeField = showMaritalStatus && isMarried && form.gender === "MALE";
  const showHusbandField = showMaritalStatus && isMarried && form.gender === "FEMALE";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userApi.getProfile();
      const payload = response.data as ApiEnvelope<UserProfileData>;
      setProfile(payload.data);
      setForm(toForm(payload.data));
      if (typeof payload.data.isHome === "boolean") {
        dispatch(setIsHome(payload.data.isHome));
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load onboarding data."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, [dispatch]);

  const onChange = (field: keyof ProfileFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onGenderChange = (value: string) => {
    setForm((prev) => {
      if (value === "PREFER_NOT_TO_SAY") {
        return {
          ...prev,
          gender: value,
          maritalStatus: "",
          wifeName: "",
          husbandName: "",
        };
      }
      return { ...prev, gender: value };
    });
  };

  const onMaritalStatusChange = (value: string) => {
    setForm((prev) => {
      if (value !== "MARRIED") {
        return { ...prev, maritalStatus: value, wifeName: "", husbandName: "" };
      }
      return { ...prev, maritalStatus: value };
    });
  };

  const profileMeta = useMemo(() => {
    if (!profile) return null;
    return {
      status: profile.status,
      role: profile.role,
      kycStatus: profile.kycStatus ?? "UNKNOWN",
      isHome: profile.isHome,
      updatedAt: formatDateTime(profile.updatedAt),
    };
  }, [profile]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        fatherName: form.fatherName || null,
        motherName: form.motherName || null,
        wifeName: showWifeField ? form.wifeName || null : null,
        husbandName: showHusbandField ? form.husbandName || null : null,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,
        occupation: form.occupation || null,
        maritalStatus: showMaritalStatus ? form.maritalStatus || null : null,
        monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : null,
        bankName: form.bankName || null,
        bankAccountNumber: form.bankAccountNumber || null,
        ifscCode: form.ifscCode || null,
        aadhaarNumber: form.aadhaarNumber || null,
        panNumber: form.panNumber || null,
        street: form.street || null,
        city: form.city || null,
        state: form.state || null,
        pinCode: form.pinCode || null,
      };

      const response = await userApi.updateOnboarding(payload);
      setSuccess(response.data?.message ?? "Onboarding details saved successfully.");
      await loadProfile();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to save onboarding details."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Loading onboarding data...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">{heading}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        {profileMeta ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{profileMeta.role}</Badge>
            <Badge variant={profileMeta.kycStatus === "VERIFIED" ? "default" : "outline"}>
              KYC: {profileMeta.kycStatus}
            </Badge>
            <Badge variant={profileMeta.isHome ? "default" : "outline"}>
              {profileMeta.isHome ? "Onboarding Complete" : "Onboarding Pending"}
            </Badge>
          </div>
        ) : null}
      </div>

      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle>Basic Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 text-sm md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Name</p>
            <p className="font-medium text-foreground">{profile?.name ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Email</p>
            <p className="font-medium text-foreground">{profile?.email ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Phone</p>
            <p className="font-medium text-foreground">{profile?.phone ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Last Updated</p>
            <p className="font-medium text-foreground">{profileMeta?.updatedAt ?? "-"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle>Onboarding Form</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4">
          <form className="space-y-6" onSubmit={onSubmit}>
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Family Details</h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Input placeholder="Father Name" value={form.fatherName} onChange={(e) => onChange("fatherName", e.target.value)} />
                <Input placeholder="Mother Name" value={form.motherName} onChange={(e) => onChange("motherName", e.target.value)} />
                {showWifeField ? (
                  <Input placeholder="Wife Name" value={form.wifeName} onChange={(e) => onChange("wifeName", e.target.value)} />
                ) : null}
                {showHusbandField ? (
                  <Input placeholder="Husband Name" value={form.husbandName} onChange={(e) => onChange("husbandName", e.target.value)} />
                ) : null}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Personal and Occupation</h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Input type="date" value={form.dateOfBirth} onChange={(e) => onChange("dateOfBirth", e.target.value)} />
                <Select value={form.gender} onValueChange={onGenderChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Occupation" value={form.occupation} onChange={(e) => onChange("occupation", e.target.value)} />
                {showMaritalStatus ? (
                  <Select value={form.maritalStatus} onValueChange={onMaritalStatusChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      {MARITAL_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Financial and Banking</h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Input placeholder="Monthly Income" type="number" value={form.monthlyIncome} onChange={(e) => onChange("monthlyIncome", e.target.value)} />
                <Input placeholder="Bank Name" value={form.bankName} onChange={(e) => onChange("bankName", e.target.value)} />
                <Input placeholder="Bank Account Number" value={form.bankAccountNumber} onChange={(e) => onChange("bankAccountNumber", e.target.value)} />
                <Input placeholder="IFSC Code" value={form.ifscCode} onChange={(e) => onChange("ifscCode", e.target.value.toUpperCase())} />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Identity and Address</h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Input placeholder="Aadhaar Number" value={form.aadhaarNumber} onChange={(e) => onChange("aadhaarNumber", e.target.value)} />
                <Input placeholder="PAN Number" value={form.panNumber} onChange={(e) => onChange("panNumber", e.target.value.toUpperCase())} />
                <Input placeholder="Street" value={form.street} onChange={(e) => onChange("street", e.target.value)} />
                <Input placeholder="City" value={form.city} onChange={(e) => onChange("city", e.target.value)} />
                <Input placeholder="State" value={form.state} onChange={(e) => onChange("state", e.target.value)} />
                <Input placeholder="Pin Code" value={form.pinCode} onChange={(e) => onChange("pinCode", e.target.value)} />
              </div>
            </section>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Onboarding"}
              </Button>
              <Button type="button" variant="outline" onClick={() => profile && setForm(toForm(profile))}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {success ? (
        <Card>
          <CardContent className="p-4 text-sm text-emerald-600">{success}</CardContent>
        </Card>
      ) : null}

      {error ? (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}
    </div>
  );
}
