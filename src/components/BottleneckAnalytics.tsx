import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { BottleneckAnalytics as BottleneckData } from "@/types/lead";
import { db } from "@/lib/supabase";

export function BottleneckAnalytics() {
  const [analytics, setAnalytics] = useState<BottleneckData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await db.analytics.getBottleneckAnalytics();
      setAnalytics(data || []);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 70) return "text-green-600";
    if (rate >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getConversionIcon = (rate: number) => {
    if (rate >= 70) return CheckCircle2;
    if (rate >= 50) return TrendingDown;
    return AlertTriangle;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const followUpAnalytics = analytics.filter(a => a.funnel_type === "follow_up");
  const broadcastAnalytics = analytics.filter(a => a.funnel_type === "broadcast");

  return (
    <div className="space-y-8">
      {/* Follow Up Funnel Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Follow Up Funnel - Conversion Analysis</CardTitle>
          <CardDescription>Track conversion rates and bottlenecks across all stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {followUpAnalytics.map((stage) => {
              const Icon = getConversionIcon(stage.conversion_rate);
              return (
                <div key={stage.stage_id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white font-bold">
                        {stage.stage_number}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{stage.stage_name}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                          <span>Entered: <strong>{stage.leads_entered}</strong></span>
                          <span>Progressed: <strong>{stage.leads_progressed}</strong></span>
                          <span>Stuck: <strong className="text-red-600">{stage.leads_stuck}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-2 ${getConversionColor(stage.conversion_rate)}`}>
                        <Icon className="w-5 h-5" />
                        <span className="text-2xl font-bold">{stage.conversion_rate.toFixed(1)}%</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Conversion Rate</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Progress to Next Stage</span>
                      <span className="font-medium">{stage.conversion_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={stage.conversion_rate} className="h-2" />
                  </div>

                  {stage.leads_stuck > 5 && (
                    <div className="mt-3 flex items-start gap-2 p-2 bg-amber-50 rounded border border-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800">
                        <strong>Bottleneck Alert:</strong> {stage.leads_stuck} leads are stuck at this stage. Consider reviewing your approach or scripts.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Broadcast Funnel Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Broadcast Funnel - Re-engagement Analysis</CardTitle>
          <CardDescription>Monitor re-engagement effectiveness across broadcast stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {broadcastAnalytics.map((stage) => {
              const Icon = getConversionIcon(stage.conversion_rate);
              return (
                <div key={stage.stage_id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg text-white font-bold">
                        {stage.stage_number}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{stage.stage_name}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                          <span>Entered: <strong>{stage.leads_entered}</strong></span>
                          <span>Re-engaged: <strong>{stage.leads_progressed}</strong></span>
                          <span>Lost: <strong className="text-red-600">{stage.leads_stuck}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-2 ${getConversionColor(stage.conversion_rate)}`}>
                        <Icon className="w-5 h-5" />
                        <span className="text-2xl font-bold">{stage.conversion_rate.toFixed(1)}%</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Re-engagement Rate</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Success Rate</span>
                      <span className="font-medium">{stage.conversion_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={stage.conversion_rate} className="h-2" />
                  </div>

                  {stage.stage_number === 10 && (
                    <div className="mt-3 flex items-start gap-2 p-2 bg-red-50 rounded border border-red-200">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-800">
                        <strong>Final Stage:</strong> Leads here will be automatically marked as LOST if no response is received.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Follow Up Conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {followUpAnalytics.length > 0
                ? (followUpAnalytics.reduce((sum, s) => sum + s.conversion_rate, 0) / followUpAnalytics.length).toFixed(1)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Broadcast Re-engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {broadcastAnalytics.length > 0
                ? (broadcastAnalytics.reduce((sum, s) => sum + s.conversion_rate, 0) / broadcastAnalytics.length).toFixed(1)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Biggest Bottleneck</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.length > 0 ? (
              <>
                <div className="text-xl font-bold text-red-600 mb-1">
                  {analytics.reduce((max, s) => s.leads_stuck > max.leads_stuck ? s : max, analytics[0]).stage_name}
                </div>
                <div className="text-sm text-slate-600">
                  {analytics.reduce((max, s) => s.leads_stuck > max.leads_stuck ? s : max, analytics[0]).leads_stuck} leads stuck
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}