import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Mail, Building2, DollarSign, Clock, MessageSquare } from "lucide-react";
import { Lead, Stage, FunnelType } from "@/types/lead";
import { db } from "@/lib/supabase";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoreHorizontal, AlertCircle } from "lucide-react";

interface LeadKanbanProps {
  leads: Lead[];
  funnelType?: "follow_up" | "broadcast";
  brandId?: string;
  funnelId?: string;
  stages: Stage[];
}

export default function LeadKanban({ leads, funnelType, brandId, funnelId, stages }: LeadKanbanProps) {
  // Filter stages by funnel if needed
  const filteredStages = funnelType && funnelType !== "follow_up" && funnelType !== "broadcast" // handle 'all' or undefined
    ? stages 
    : stages.filter(s => !funnelType || s.funnel_type === funnelType);

  const getLeadsByStage = (stageId: string) => {
    return leads.filter(lead => lead.current_stage_id === stageId);
  };

  const getStageColor = (stageNumber: number) => {
    if (stageNumber <= 3) return "from-blue-500 to-blue-600";
    if (stageNumber <= 6) return "from-indigo-500 to-indigo-600";
    if (stageNumber <= 9) return "from-purple-500 to-purple-600";
    return "from-green-500 to-green-600";
  };

  const handleLeadClick = (lead: Lead) => {
    // TODO: Open lead detail modal
    console.log("Lead clicked:", lead);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {filteredStages.map((stage) => {
        const stageLeads = getLeadsByStage(stage.id);
        return (
          <div key={stage.id} className="flex-shrink-0 w-80">
            <div className={`bg-gradient-to-br ${getStageColor(stage.stage_number)} rounded-t-lg p-4 text-white`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium opacity-90">Stage {stage.stage_number}</div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {stageLeads.length}
                </Badge>
              </div>
              <h3 className="font-bold text-lg">{stage.stage_name}</h3>
              <p className="text-sm opacity-80 mt-1">{stage.description}</p>
            </div>

            <div className="space-y-3 p-3 bg-slate-50 rounded-b-lg min-h-[200px]">
              {stageLeads.map((lead) => (
                <Card
                  key={lead.id}
                  className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-slate-200"
                  onClick={() => handleLeadClick(lead)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">{lead.name}</h4>
                        {lead.company && (
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Building2 className="w-3 h-3" />
                            {lead.company}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </div>
                      )}
                      {lead.email && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </div>
                      )}
                    </div>

                    {lead.last_response_date && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          Last response: {new Date(lead.last_response_date).toLocaleDateString()}
                        </div>
                        {lead.last_response_note && (
                          <div className="flex items-start gap-2 mt-1 text-xs text-slate-600">
                            <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{lead.last_response_note}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {lead.source && (
                      <div className="mt-3">
                        <Badge variant="outline" className="text-xs">
                          {lead.source.name}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {stageLeads.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <div className="text-sm">No leads in this stage</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}