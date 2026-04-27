"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import type { RootState } from "@/store";

const roleRedirect: Record<string, string> = {
  USER: "/user",
  AGENT: "/agent",
  OFFICER: "/officer",
  MANAGER: "/manager",
  ADMIN: "/admin",
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useAuth();
  const { token, role } = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canSubmit = useMemo(
    () =>
      form.name.trim().length > 0 &&
      form.email.trim().length > 0 &&
      form.password.trim().length > 0 &&
      form.phone.trim().length > 0 &&
      form.address.trim().length > 0,
    [form.name, form.email, form.password, form.phone, form.address]
  );

  useEffect(() => {
    if (token) {
      router.replace(roleRedirect[role ?? ""] ?? "/user");
    }
  }, [token, role, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      setFieldError("Name, email, password, phone, and address are required.");
      return;
    }

    setFieldError(null);
    setSuccessMessage(null);

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        address: form.address.trim(),
        role: "USER",
      });

      setSuccessMessage("Registration successful. Redirecting to login...");
      router.replace("/login");
    } catch {
      // Hook already exposes the API error message.
    }
  };

  return (
    <Card className="border-0 bg-transparent shadow-none p-3">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-semibold">Create Account</CardTitle>
        <CardDescription>Register to access role-based loan operations.</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" type="text" value="USER" disabled readOnly />
            <p className="text-xs text-muted-foreground">Signup is available for USER only.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="9876500003"
              value={form.phone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, phone: event.target.value }))
              }
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              type="text"
              placeholder="City / Area"
              value={form.address}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, address: event.target.value }))
              }
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
              disabled={loading}
              required
            />
          </div>

          {fieldError ? <p className="text-sm text-destructive">{fieldError}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {successMessage ? <p className="text-sm text-emerald-500">{successMessage}</p> : null}

          <Button type="submit" className="h-9 w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
