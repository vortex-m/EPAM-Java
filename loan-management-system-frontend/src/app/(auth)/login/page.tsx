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
import { getRedirectPathFromAuth, getRedirectPathFromState } from "@/lib/auth-routing";
import type { RootState } from "@/store";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const { token, role, user } = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState({ loginId: "", password: "" });
  const [fieldError, setFieldError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => form.loginId.trim().length > 0 && form.password.trim().length > 0,
    [form.loginId, form.password]
  );

  useEffect(() => {
    if (token) {
      router.replace(getRedirectPathFromState(role, user?.department));
    }
  }, [token, role, user?.department, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      setFieldError("Login ID and password are required.");
      return;
    }

    setFieldError(null);

    try {
      const authData = await login({
        loginId: form.loginId.trim(),
        password: form.password,
      });

      router.replace(getRedirectPathFromAuth(authData));
    } catch {
      // Hook already exposes the API error message.
    }
  };

  return (
    <Card className="border-0 bg-transparent shadow-none p-3">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
        <CardDescription>Access your microfinance workspace securely.</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="loginId">Login ID</Label>
            <Input
              id="loginId"
              type="text"
              placeholder="Email or role code (e.g. BOM001)"
              value={form.loginId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, loginId: event.target.value }))
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
              placeholder="Enter your password"
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

          <Button type="submit" className="h-9 w-full shadow-none" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          New to the system?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create USER account
          </Link>
        </p>

        {/* <div className="mt-4 rounded-lg border border-border/70 bg-background/50 p-3 text-xs text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">Login examples:</p>
          <p>Admin: mail.mayank001@gmail.com</p>
          <p>Manager: BOM001 (or other manager code)</p>
          <p>Officer: officer code (OFF001...)</p>
          <p>Agent/User: registered login id (email/code)</p>
        </div> */}
      </CardContent>
    </Card>
  );
}
