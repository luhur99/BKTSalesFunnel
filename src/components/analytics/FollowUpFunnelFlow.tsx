import { useState, useEffect } from "react";
import { TrendingDown, TrendingUp, Users, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/supabase";
import { FunnelFlowStep } from "@/types/analytics";

export function FollowUpFunnelFlow() {
  const [steps, setSteps] = useState<FunnelFlowStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFunnelFlow();
  }, []);

  const loadFunnelFlow = async () => {
    setLoading(true);
    try {
      const data = await db.analytics.getFollowUpFunnelFlow();
      setSteps(data);
    } catch (error) {
      console.error("Error loading funnel flow:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-slate-200 bg-white/80 backdrop-blur">
        <CardHeader>
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 rounded animate-pulse mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (steps.length === 0) {
    return (
      <Card className="border-slate-200 bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Follow-Up Funnel Flow</CardTitle>
          <CardDescription>No funnel data available yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const maxLeads = Math.max(...steps.map(s => s.leads_entered), 1);
  const totalEntered = steps[0]?.leads_entered || 0;
  const finalProgressed = steps[steps.length - 1]?.leads_progressed || 0;
  const overallConversion = totalEntered > 0 ? ((finalProgressed / totalEntered) * 100).toFixed(1) : "0";

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              Follow-Up Funnel Flow
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Perjalanan lead dari masuk hingga closing - lihat di mana lead paling banyak drop
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-600 mb-1">Overall Conversion</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {overallConversion}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {finalProgressed} of {totalEntered} leads
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, index) => {
          const widthPercent = (step.leads_entered / maxLeads) * 100;
          const isHighDrop = step.drop_rate > 25;
          const isLastStage = index === steps.length - 1;

          return (
            <div key={step.stage_id} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                    ${isHighDrop 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-blue-100 text-blue-700'}
                  `}>
                    {step.stage_number}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">
                      {step.stage_name}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span className="font-medium text-slate-700">{step.leads_entered}</span> masuk
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        <span className="font-medium text-emerald-600">{step.leads_progressed}</span> lanjut
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingDown className="w-3 h-3 text-red-600" />
                        <span className="font-medium text-red-600">{step.leads_dropped}</span> drop
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    isHighDrop ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {step.conversion_rate}%
                  </div>
                  <div className="text-xs text-slate-500">
                    conversion
                  </div>
                </div>
              </div>

              {/* Funnel Bar */}
              <div className="relative">
                <div className="h-12 rounded-lg bg-slate-100 overflow-hidden shadow-inner">
                  <div 
                    className={`
                      h-full transition-all duration-500
                      ${isHighDrop 
                        ? 'bg-gradient-to-r from-red-400 to-red-500' 
                        : 'bg-gradient-to-r from-blue-400 to-indigo-500'}
                    `}
                    style={{ width: `${widthPercent}%` }}
                  >
                    <div className="h-full flex items-center justify-between px-4 text-white text-sm font-medium">
                      <span>{step.leads_entered} leads</span>
                      {step.drop_rate > 0 && (
                        <span className="flex items-center gap-1">
                          <TrendingDown className="w-4 h-4" />
                          {step.drop_rate}% drop
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Arrow to next stage */}
                {!isLastStage && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10">
                    <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center shadow">
                      <ChevronRight className="w-4 h-4 text-slate-600 rotate-90" />
                    </div>
                  </div>
                )}
              </div>

              {/* High drop warning */}
              {isHighDrop && (
                <div className="mt-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  <TrendingDown className="w-3 h-3" />
                  <span className="font-medium">
                    High drop rate detected - {step.drop_rate}% leads tidak lanjut dari stage ini
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Summary Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">{totalEntered}</div>
              <div className="text-xs text-slate-600 mt-1">Total Masuk</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-emerald-600">{finalProgressed}</div>
              <div className="text-xs text-slate-600 mt-1">Berhasil Closing</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-600">{totalEntered - finalProgressed}</div>
              <div className="text-xs text-slate-600 mt-1">Total Drop</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}