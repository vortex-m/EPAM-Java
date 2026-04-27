"use client";

import { Activity, UserCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgentProfileQuery, useUpdateAvailabilityMutation } from "@/hooks/agent/useAgentProfile";
import { getAvailabilityConfig } from "@/lib/agent.utils";
import { AgentAvailability, type AgentAvailability as AgentAvailabilityType } from "@/types/agent.types";

const items: Array<{ value: AgentAvailabilityType; Icon: typeof Activity }> = [
  { value: AgentAvailability.AVAILABLE, Icon: UserCheck },
  { value: AgentAvailability.BUSY, Icon: Activity },
];

export default function AgentAvailabilityPage() {
  const profileQuery = useAgentProfileQuery();
  const updateMutation = useUpdateAvailabilityMutation();

  if (profileQuery.isLoading) {
    return <Skeleton className="h-72" />;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return <Card><CardContent className="p-4 text-sm text-destructive">Unable to load availability.</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">Availability</h1>
        <Badge className={getAvailabilityConfig(profileQuery.data.agentAvailability).color}>
          {getAvailabilityConfig(profileQuery.data.agentAvailability).label}
        </Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map(({ value, Icon }) => {
          const config = getAvailabilityConfig(value);
          const active = profileQuery.data?.agentAvailability === value;
          return (
            <Card key={value} className={`py-0 ${active ? "border-2 border-primary" : ""}`}>
              <CardHeader className="border-b px-4 py-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="size-5" /> {config.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 py-4">
                <p className="text-sm text-muted-foreground">{config.description}</p>
                <Button
                  variant={active ? "secondary" : "outline"}
                  disabled={active || updateMutation.isPending}
                  onClick={() => updateMutation.mutate({ availability: value })}
                >
                  {active ? "Current" : "Set Status"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
