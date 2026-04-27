"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownCircle,
  Banknote,
  Bell,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  Loader2,
  MapPin,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgentDashboardQuery } from "@/hooks/agent/useAgentDashboard";
import { useAgentProfileQuery, useUpdateAvailabilityMutation, useUpdateLocationMutation } from "@/hooks/agent/useAgentProfile";
import { formatDateDisplay, formatIndianCurrency, getAvailabilityConfig } from "@/lib/agent.utils";
import { AgentAvailability } from "@/types/agent.types";

const statConfig = [
  { key: "totalAssignedTasks", label: "Total Assigned", Icon: ClipboardList },
  { key: "assignedTasks", label: "New Assigned", Icon: Bell },
  { key: "acceptedTasks", label: "Accepted", Icon: CheckCircle2 },
  { key: "inProgressTasks", label: "In Progress", Icon: Loader2 },
  { key: "pendingVerificationTasks", label: "Pending Verification", Icon: FileSearch },
  { key: "pendingCashCollectionTasks", label: "Pending Collection", Icon: Banknote },
  { key: "cashCollectionsInProgress", label: "Collections In Progress", Icon: ArrowDownCircle },
  { key: "completedToday", label: "Completed Today", Icon: Trophy },
] as const;

export default function AgentDashboardPage() {
  const router = useRouter();
  const dashboardQuery = useAgentDashboardQuery();
  const profileQuery = useAgentProfileQuery();
  const updateAvailabilityMutation = useUpdateAvailabilityMutation();
  const updateLocationMutation = useUpdateLocationMutation();
  const [locationError, setLocationError] = useState("");

  const updateCurrentLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
          setLocationError("Unable to fetch valid location coordinates.");
          return;
        }

        await updateLocationMutation.mutateAsync({ latitude, longitude });
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setLocationError("Location permission denied. Please allow location and retry.");
          return;
        }
        setLocationError("Unable to fetch your location. Please retry.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => {
    const dashboardHome = dashboardQuery.data?.isHome;
    const profileHome = profileQuery.data?.isHome;
    if (dashboardHome === false || profileHome === false) {
      router.replace("/agent/profile");
    }
  }, [dashboardQuery.data?.isHome, profileQuery.data?.isHome, router]);

  const availability = dashboardQuery.data?.availability ?? AgentAvailability.BUSY;
  const availabilityConfig = getAvailabilityConfig(availability);

  if (dashboardQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14 w-full" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-destructive">Unable to load dashboard.</CardContent>
      </Card>
    );
  }

  const d = dashboardQuery.data;

  return (
    <div className="space-y-6">
      <div className="sticky top-2 z-10 rounded-lg border bg-card p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`inline-block size-2.5 rounded-full ${availabilityConfig.color.split(" ")[0]}`} />
            <Select
              value={availability}
              onValueChange={(value) => {
                if (value === availability) return;
                updateAvailabilityMutation.mutate({ availability: value as typeof AgentAvailability[keyof typeof AgentAvailability] });
              }}
              disabled={updateAvailabilityMutation.isPending}
            >
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Set availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AgentAvailability.AVAILABLE}>Available</SelectItem>
                <SelectItem value={AgentAvailability.BUSY}>Busy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Last location update: {formatDateDisplay(d.lastLocationUpdatedAt)}
          </p>
          <Button onClick={updateCurrentLocation} disabled={updateLocationMutation.isPending}>
            {updateLocationMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />} Update Location
          </Button>
        </div>
        {locationError ? <p className="mt-2 text-xs text-destructive">{locationError}</p> : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {statConfig.map(({ key, label, Icon }) => (
          <Card key={key} className="py-0">
            <CardHeader className="border-b px-4 py-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>{label}</span>
                <Icon className="size-5" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-4 text-2xl font-semibold">
              {String(d[key])}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="py-0">
          <CardHeader className="border-b px-4 py-3"><CardTitle className="text-sm">Total Collected</CardTitle></CardHeader>
          <CardContent className="px-4 py-4 text-xl font-semibold text-blue-700">{formatIndianCurrency(d.totalCollectedCash)}</CardContent>
        </Card>
        <Card className="py-0">
          <CardHeader className="border-b px-4 py-3"><CardTitle className="text-sm">Total Settled</CardTitle></CardHeader>
          <CardContent className="px-4 py-4 text-xl font-semibold text-emerald-700">{formatIndianCurrency(d.totalSettledCash)}</CardContent>
        </Card>
        <Card className="py-0">
          <CardHeader className="border-b px-4 py-3"><CardTitle className="text-sm">Total Unsettled</CardTitle></CardHeader>
          <CardContent className="px-4 py-4 text-xl font-semibold text-amber-700">{formatIndianCurrency(d.totalUnsettledCash)}</CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline"><Link href="/agent/tasks">My Tasks</Link></Button>
        <Button asChild variant="outline"><Link href="/agent/leads/mine">My Leads</Link></Button>
        <Button asChild variant="outline"><Link href="/agent/leads/create">Create Lead</Link></Button>
        <Button asChild><Link href="/agent/loan-for-user">Apply Loan for User</Link></Button>
      </div>
    </div>
  );
}
