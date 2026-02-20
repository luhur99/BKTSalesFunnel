import { ArrowRight, ArrowLeft, Trophy, XCircle, Clock, Users, Radio, GitMerge } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FunnelDualFlowData, FunnelFlowStep } from "@/types/analytics";

interface FunnelDualTrackFlowProps {
  funnelName: string;
  data: FunnelDualFlowData;
}

function StageBar({ step, color, maxLeads }: { step: FunnelFlowStep; color: "blue" | "purple"; maxLeads: number }) {
  const isHighDrop = step.drop_rate > 25;
  // Bar width shows funnel narrowing: widest = most leads (first stage), narrows as leads drop
  const widthPct = Math.max((step.leads_entered / maxLeads) * 100, 4);

  const barClass = isHighDrop
    ? "bg-gradient-to-r from-red-400 to-red-500"
    : color === "blue"
      ? "bg-gradient-to-r from-blue-400 to-indigo-500"
      : "bg-gradient-to-r from-purple-400 to-violet-500";

  const badgeClass = isHighDrop
    ? "bg-red-100 text-red-700"
    : color === "blue"
      ? "bg-blue-100 text-blue-700"
      : "bg-purple-100 text-purple-700";

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${badgeClass}`}>
          {step.stage_number}
        </div>
        <span className="text-xs font-medium text-slate-700 truncate flex-1">{step.stage_name}</span>
      </div>
      {/* Bar: width = leads_entered / maxLeads (funnel narrowing) */}
      <div className="h-6 rounded bg-slate-100 overflow-hidden ml-8">
        <div
          className={`h-full ${barClass} flex items-center px-2`}
          style={{ width: `${widthPct}%` }}
        >
          <span className="text-[9px] text-white font-semibold whitespace-nowrap">
            {step.leads_entered} leads
            {widthPct > 25 && ` · ${step.conversion_rate}% lanjut`}
          </span>
        </div>
      </div>
      {/* Always show conversion stats below bar */}
      <div className="ml-8 flex items-center gap-3 text-[10px]">
        <span className={isHighDrop ? "text-red-600 font-semibold" : "text-emerald-600 font-medium"}>
          {isHighDrop ? `⚠ ${step.drop_rate}% drop — ${step.leads_dropped} leads tidak lanjut` : `✓ ${step.conversion_rate}% lanjut (${step.leads_progressed} leads)`}
        </span>
        {color === "purple" && (step.leads_returned_to_followup ?? 0) > 0 && (
          <span className="flex items-center gap-1 text-blue-600 font-semibold bg-blue-50 rounded px-1.5 py-0.5 border border-blue-100">
            ↩ {step.leads_returned_to_followup} kembali ke FU
          </span>
        )}
        {color === "blue" && (step.leads_switched_to_broadcast ?? 0) > 0 && (
          <span className="flex items-center gap-1 text-purple-600 font-semibold bg-purple-50 rounded px-1.5 py-0.5 border border-purple-100">
            → {step.leads_switched_to_broadcast} pindah ke BC
          </span>
        )}
      </div>
    </div>
  );
}

export function FunnelDualTrackFlow({ funnelName, data }: FunnelDualTrackFlowProps) {
  const fuToBcPct = data.totalLeads > 0
    ? ((data.switchesToBroadcast / data.totalLeads) * 100).toFixed(1)
    : "0";
  const bcToFuPct = data.switchesToBroadcast > 0
    ? ((data.switchesToFollowup / data.switchesToBroadcast) * 100).toFixed(1)
    : "0";
  const conversionPct = data.totalLeads > 0
    ? ((data.wonCount / data.totalLeads) * 100).toFixed(1)
    : "0";

  const hasBroadcast = data.broadcastStages.length > 0;
  const hasNoLeads = data.totalLeads === 0;
  const maxFuLeads = Math.max(...data.followUpStages.map(s => s.leads_entered), 1);
  const maxBcLeads = Math.max(...data.broadcastStages.map(s => s.leads_entered), 1);

  return (
    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Card Header */}
      <CardHeader className="pb-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{funnelName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Lead journey: Follow Up ↔ Broadcast flow</p>
          </div>
          {/* Metric Pills */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 bg-slate-100 rounded-full px-2.5 py-1">
              <Users className="w-3 h-3 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">{data.totalLeads} leads</span>
            </div>
            <div className="flex items-center gap-1 bg-emerald-100 rounded-full px-2.5 py-1">
              <Trophy className="w-3 h-3 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">{data.wonCount} won</span>
            </div>
            <div className="flex items-center gap-1 bg-red-100 rounded-full px-2.5 py-1">
              <XCircle className="w-3 h-3 text-red-500" />
              <span className="text-xs font-semibold text-red-700">{data.lostCount} lost</span>
            </div>
            <div className="flex items-center gap-1 bg-blue-100 rounded-full px-2.5 py-1">
              <Clock className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-semibold text-blue-700">{data.activeLeads} active</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Empty state when no leads */}
        {hasNoLeads && (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">
            Belum ada leads di funnel ini. Tambahkan leads untuk melihat funnel flow.
          </div>
        )}

        {/* Switch Summary Bar */}
        {!hasNoLeads && hasBroadcast && (
          <div className="flex items-center justify-center gap-4 px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-1.5 bg-white border border-blue-200 rounded-full px-3 py-1 shadow-sm">
              <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">FU → BC</span>
              <Badge className="text-[10px] px-1.5 py-0 h-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
                {data.switchesToBroadcast} leads · {fuToBcPct}%
              </Badge>
            </div>
            <div className="text-xs text-slate-400 font-medium">⇄</div>
            <div className="flex items-center gap-1.5 bg-white border border-purple-200 rounded-full px-3 py-1 shadow-sm">
              <ArrowLeft className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-xs font-semibold text-purple-700">BC → FU</span>
              <Badge className="text-[10px] px-1.5 py-0 h-4 bg-purple-100 text-purple-700 hover:bg-purple-100">
                {data.switchesToFollowup} leads · {bcToFuPct}%
              </Badge>
            </div>
          </div>
        )}

        {/* Two-column stage tracks */}
        {!hasNoLeads && <div className={`grid ${hasBroadcast ? "grid-cols-2 divide-x divide-slate-100" : "grid-cols-1"}`}>
          {/* Follow Up Track */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                <GitMerge className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="text-sm font-bold text-blue-700">Follow Up</span>
              <span className="text-xs text-slate-500 ml-auto">{data.followupActive} active</span>
            </div>

            {data.followUpStages.length > 0 ? (
              <div className="space-y-3">
                {data.followUpStages.map(step => (
                  <StageBar key={step.stage_id} step={step} color="blue" maxLeads={maxFuLeads} />
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center">No Follow Up stages</div>
            )}
          </div>

          {/* Broadcast Track */}
          {hasBroadcast && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Radio className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <span className="text-sm font-bold text-purple-700">Broadcast</span>
                <span className="text-xs text-slate-500 ml-auto">{data.broadcastActive} active</span>
              </div>

              <div className="space-y-3">
                {data.broadcastStages.map(step => (
                  <StageBar key={step.stage_id} step={step} color="purple" maxLeads={maxBcLeads} />
                ))}
              </div>
            </div>
          )}
        </div>}

        {/* Footer: Final outcomes */}
        {!hasNoLeads && <div className="border-t border-slate-100 px-4 py-3 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <Trophy className="w-3.5 h-3.5" /> {conversionPct}% conversion rate
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">{data.wonCount} won / {data.lostCount} lost / {data.activeLeads} still active</span>
            </div>
            {hasBroadcast && data.switchesToFollowup > 0 && (
              <span className="text-[10px] text-purple-600 bg-purple-50 rounded-full px-2 py-0.5 border border-purple-100">
                {data.switchesToFollowup} leads cycled back to FU
              </span>
            )}
          </div>
        </div>}
      </CardContent>
    </Card>
  );
}
