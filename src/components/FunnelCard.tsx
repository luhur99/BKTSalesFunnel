/**
 * Funnel Card Component
 * Display funnel with stats and actions
 */

import { ArrowRight, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Funnel } from "@/types/brand";

interface FunnelCardProps {
  funnel: Funnel;
  brandColor: string;
  onSelect: (funnelId: string) => void;
}

export function FunnelCard({ funnel, brandColor, onSelect }: FunnelCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-slate-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1">{funnel.name}</CardTitle>
            {funnel.description && (
              <CardDescription className="line-clamp-2">
                {funnel.description}
              </CardDescription>
            )}
          </div>
          <div 
            className="w-3 h-3 rounded-full ml-2 mt-1 flex-shrink-0"
            style={{ backgroundColor: brandColor }}
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
              <Users className="w-4 h-4" />
              <span>Total Leads</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {funnel.total_leads_count || 0}
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Active</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {funnel.is_active ? "Yes" : "No"}
            </div>
          </div>
        </div>

        <Button 
          onClick={() => onSelect(funnel.id)}
          className="w-full gap-2"
          style={{ backgroundColor: brandColor }}
        >
          Manage Leads
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}