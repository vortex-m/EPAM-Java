"use client";

import { FormEvent, useState } from "react";

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
import type { ManagerDepartment, StaffCreateRequest } from "@/types/manager.types";

type ManagerStaffCreateFormProps = {
  title: string;
  description: string;
  roleHint: "AGENT" | "OFFICER" | "MANAGER";
  includeDepartment?: boolean;
  onSubmit: (payload: StaffCreateRequest) => Promise<unknown>;
  loading?: boolean;
};

const initialState: StaffCreateRequest = {
  name: "",
  email: "",
  code: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
};

export function ManagerStaffCreateForm({
  title,
  description,
  roleHint,
  includeDepartment = false,
  onSubmit,
  loading = false,
}: ManagerStaffCreateFormProps) {
  const [form, setForm] = useState<StaffCreateRequest>(initialState);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(form);
    setForm(initialState);
  };

  return (
    <Card className="border-border/80 bg-card/85 py-0 shadow-sm">
      <CardHeader className="border-b border-border/70 px-4 py-4">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="px-4 py-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">{roleHint} Code</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={form.state}
                onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pinCode">Pin Code</Label>
              <Input
                id="pinCode"
                value={form.pinCode}
                onChange={(event) => setForm((prev) => ({ ...prev, pinCode: event.target.value }))}
                required
              />
            </div>
            {includeDepartment ? (
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={form.department ?? ""}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, department: value as ManagerDepartment }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select manager department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOAN_APPROVAL">Loan Approval</SelectItem>
                    <SelectItem value="OPERATIONS">Operations</SelectItem>
                    <SelectItem value="COMPLIANCE">Compliance</SelectItem>
                    <SelectItem value="AUDIT">Audit</SelectItem>
                    <SelectItem value="FRAUD">Fraud</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : `Create ${roleHint}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
