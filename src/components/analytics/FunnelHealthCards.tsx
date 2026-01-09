"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Activity } from "lucide-react";
import { FunnelLeakageStats } from "@/types/analytics";

interface FunnelHealthCardsProps {
  leakageStats: FunnelLeakageStats;
}

export function FunnelHealthCards({ leakageStats }: FunnelHealthCardsProps) {
  const { total_leads, leaked_to_broadcast, leakage_percentage } = leakageStats;
  const retention_percentage = 100 - leakage_percentage;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Leads Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total_leads}</div>
          <p className="text-xs text-muted-foreground mt-1">
            All leads in system
          </p>
        </CardContent>
      </Card>

      {/* Leakage Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Funnel Leakage</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {leakage_percentage.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {leaked_to_broadcast} leads moved to Broadcast
          </p>
        </CardContent>
      </Card>

      {/* Retention Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Follow Up Retention</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {retention_percentage.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Leads staying in Follow Up funnel
          </p>
        </CardContent>
      </Card>
    </div>
  );
}