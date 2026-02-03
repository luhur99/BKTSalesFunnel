"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Activity } from "lucide-react";
import { FunnelLeakageStats } from "@/types/analytics";

interface FunnelHealthCardsProps {
  funnelStats: Array<FunnelLeakageStats & { funnel_name: string }>;
}

export function FunnelHealthCards({ funnelStats }: FunnelHealthCardsProps) {
  if (!funnelStats || funnelStats.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">No funnel data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {funnelStats.map((funnel) => {
        const retention_percentage = 100 - funnel.leakage_percentage;
        
        return (
          <div key={funnel.funnel_name} className="space-y-4">
            {/* Funnel Name Header */}
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" />
              <h3 className="text-xl font-bold text-gray-900">{funnel.funnel_name}</h3>
            </div>

            {/* Stats Cards for this Funnel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Leads Card */}
              <Card className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{funnel.total_leads}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All leads in this funnel
                  </p>
                </CardContent>
              </Card>

              {/* Leakage Card */}
              <Card className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Funnel Leakage</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {funnel.leakage_percentage.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {funnel.leaked_to_broadcast} leads moved to Broadcast
                  </p>
                </CardContent>
              </Card>

              {/* Retention Card */}
              <Card className="border-slate-200 hover:shadow-lg transition-shadow">
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
          </div>
        );
      })}
    </div>
  );
}