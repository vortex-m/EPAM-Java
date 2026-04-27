"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useManagerProfileQuery,
  useManagerProfileUpdateMutation,
} from "@/hooks/manager/useManagerWorkflow";
import type { ManagerProfileUpdateRequest } from "@/types/manager.types";
import { cn } from "@/lib/utils";

const deptColor: Record<string, string> = {
  LOAN_APPROVAL: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  LOAN_OPERATIONS: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
  OPERATIONS: "bg-violet-500/10 text-violet-700 border-violet-500/20",
  COMPLIANCE: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  AUDIT: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  FRAUD: "bg-rose-500/10 text-rose-700 border-rose-500/20",
};

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value ?? "—"}</p>
    </div>
  );
}

function getInitials(name?: string) {
  return (name ?? "M")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function ManagerProfilePage() {
  const profileQuery = useManagerProfileQuery();
  const updateMutation = useManagerProfileUpdateMutation();
  const [form, setForm] = useState<ManagerProfileUpdateRequest>({});

  useEffect(() => {
    if (!profileQuery.data) return;
    setForm({
      designation: profileQuery.data.designation,
      email: profileQuery.data.email,
      phone: profileQuery.data.phone,
      branch: profileQuery.data.branch,
      region: profileQuery.data.region,
      regionCode: profileQuery.data.regionCode,
    });
  }, [profileQuery.data]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updateMutation.mutateAsync(form);
  };

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          Unable to load manager profile. Please refresh the page.
        </CardContent>
      </Card>
    );
  }

  const profile = profileQuery.data;
  const deptKey = (profile.department ?? "").toUpperCase();

  return (
    <div className="space-y-5">
      {/* ── Identity card ────────────────────────────── */}
      <Card className="border-border/80 bg-card/85 py-0 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-5 px-5 py-5">
          {/* Avatar */}
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary/15 text-xl font-bold text-primary">
            {getInitials(profile.designation ?? "Manager")}
          </div>
          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight">
                {profile.designation ?? "Manager"}
              </h1>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                  deptColor[deptKey] ?? "bg-primary/10 text-primary border-primary/20",
                )}
              >
                {profile.department}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="size-3.5" />
                ID: {profile.userId}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="size-3.5" />
                {profile.managerCode}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {profile.branchCode} · {profile.branch}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Read-only details ─────────────────────────── */}
      <Card className="border-border/80 bg-card/85 py-0 shadow-sm">
        <CardHeader className="border-b border-border/60 px-5 py-3">
          <CardTitle className="text-sm">Branch &amp; Region</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoRow label="Branch" value={profile.branch} />
          <InfoRow label="Branch Code" value={profile.branchCode} />
          <InfoRow label="Region" value={profile.region} />
          <InfoRow label="Region Code" value={profile.regionCode} />
        </CardContent>
      </Card>

      {/* ── Editable fields ──────────────────────────── */}
      <Card className="border-border/80 bg-card/85 py-0 shadow-sm">
        <CardHeader className="border-b border-border/60 px-5 py-3">
          <CardTitle className="text-sm">Update Profile</CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-5">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    id="designation"
                    className="pl-9"
                    value={form.designation ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        designation: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-9"
                    value={form.email ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    id="phone"
                    className="pl-9"
                    value={form.phone ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    id="branch"
                    className="pl-9"
                    value={form.branch ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, branch: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    id="region"
                    className="pl-9"
                    value={form.region ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, region: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="regionCode">Region Code</Label>
                <Input
                  id="regionCode"
                  value={form.regionCode ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, regionCode: e.target.value }))
                  }
                />
              </div>
            </div>

            <Button type="submit" disabled={updateMutation.isPending}>
              <Save className="mr-1.5 size-4" />
              {updateMutation.isPending ? "Saving…" : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
