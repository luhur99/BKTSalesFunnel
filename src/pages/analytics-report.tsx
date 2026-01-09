import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "@/lib/supabase";
import { FunnelLeakageStats, StageVelocity, HeatmapDataPoint, BottleneckWarning, VelocityChartData, HeatmapCell } from "@/types/analytics";
import { VelocityChart } from "@/components/analytics/VelocityChart";
import { HeatmapGrid } from "@/components/analytics/HeatmapGrid";
import { FunnelHealthCards } from "@/components/analytics/FunnelHealthCards";
import { BottleneckWarnings } from "@/components/analytics/BottleneckWarnings";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { FollowUpFunnelFlow } from "@/components/analytics/FollowUpFunnelFlow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, TrendingUp } from "lucide-react";

export default function AnalyticsReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leakageStats, setLeakageStats] = useState<FunnelLeakageStats | null>(null);
  const [stageVelocity, setStageVelocity] = useState<StageVelocity[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapDataPoint[]>([]);
  const [bottleneckWarnings, setBottleneckWarnings] = useState<BottleneckWarning[]>([]);

  useEffect(() => {
    // Check authentication
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/");
      return;
    }

    // Load analytics data
    loadAnalyticsData();
  }, [router]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all analytics data in parallel with error handling
      const [leakage, velocity, heatmap, warnings] = await Promise.allSettled([
        db.analytics.getFunnelLeakageStats(),
        db.analytics.getStageVelocity(),
        db.analytics.getHeatmapAnalytics("all"),
        db.analytics.getBottleneckWarnings()
      ]);

      // Process leakage stats
      if (leakage.status === "fulfilled" && leakage.value) {
        setLeakageStats(leakage.value);
      }

      // Process stage velocity
      if (velocity.status === "fulfilled" && Array.isArray(velocity.value)) {
        setStageVelocity(velocity.value);
      }

      // Process heatmap data
      if (heatmap.status === "fulfilled" && Array.isArray(heatmap.value)) {
        setHeatmapData(heatmap.value);
      }

      // Process bottleneck warnings
      if (warnings.status === "fulfilled" && Array.isArray(warnings.value)) {
        setBottleneckWarnings(warnings.value);
      }

    } catch (error) {
      console.error("Error loading analytics:", error);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Transform stage velocity data for chart with safety checks
  const velocityChartData: VelocityChartData[] = Array.isArray(stageVelocity) 
    ? stageVelocity.map(stage => ({
        stage: stage.stage_name_out || "Unknown",
        hours: parseFloat(stage.avg_hours || "0"),
        leads: Number(stage.total_leads_passed || 0)
      }))
    : [];

  // Transform heatmap data for grid with safety checks
  const heatmapCells: HeatmapCell[] = Array.isArray(heatmapData)
    ? heatmapData.map(point => {
        const value = Number(point.count || 0);
        let intensity: "low" | "medium" | "high" | "none" = "none";
        
        if (value > 0 && value <= 5) intensity = "low";
        else if (value > 5 && value <= 10) intensity = "medium";
        else if (value > 10) intensity = "high";

        return {
          day: (point.day_name || "").trim(),
          hour: point.hour_of_day || 0,
          value,
          intensity
        };
      })
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-24 w-full mb-8 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
          <Skeleton className="h-96 w-full mb-8 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Default leakage stats if not available
  const displayLeakageStats = leakageStats || {
    total_leads: 0,
    leaked_to_broadcast: 0,
    leakage_percentage: 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <AnalyticsHeader />

        {/* Funnel Health Cards */}
        <section>
          <FunnelHealthCards leakageStats={displayLeakageStats} />
        </section>

        <Separator className="my-8" />

        {/* Follow-Up Funnel Flow - FEATURED SECTION */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Follow-Up Funnel Flow</h2>
              <p className="text-sm text-gray-600">Visualisasi perjalanan lead dari masuk hingga closing</p>
            </div>
          </div>
          <FollowUpFunnelFlow />
        </section>

        <Separator className="my-8" />

        {/* Bottleneck Warnings */}
        {bottleneckWarnings.length > 0 && (
          <section>
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50 backdrop-blur shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <AlertCircle className="w-5 h-5" />
                  Bottleneck Alerts
                </CardTitle>
                <CardDescription>Stages requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <BottleneckWarnings warnings={bottleneckWarnings} />
              </CardContent>
            </Card>
          </section>
        )}

        {bottleneckWarnings.length > 0 && <Separator className="my-8" />}

        {/* Detailed Analytics Tabs */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Detailed Analytics</h2>
            <p className="text-sm text-gray-600">Deep dive into stage performance and lead patterns</p>
          </div>

          <Tabs defaultValue="velocity" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/80 backdrop-blur border border-slate-200 p-1 rounded-xl shadow-sm">
              <TabsTrigger 
                value="velocity"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all"
              >
                📊 Stage Velocity
              </TabsTrigger>
              <TabsTrigger 
                value="heatmap"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all"
              >
                🔥 Lead Entry Patterns
              </TabsTrigger>
            </TabsList>

            {/* Stage Velocity Tab */}
            <TabsContent value="velocity">
              <Card className="border-slate-200 bg-white/80 backdrop-blur shadow-lg">
                <CardHeader>
                  <CardTitle>📊 Stage Velocity Analysis</CardTitle>
                  <CardDescription>
                    Average time leads spend in each stage and total leads processed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {velocityChartData.length > 0 ? (
                    <VelocityChart data={velocityChartData} />
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-600 font-medium mb-2">No velocity data available yet</p>
                      <p className="text-sm text-slate-500">Add some leads and move them through stages to see analytics</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Heatmap Tab */}
            <TabsContent value="heatmap">
              <Card className="border-slate-200 bg-white/80 backdrop-blur shadow-lg">
                <CardHeader>
                  <CardTitle>🔥 Lead Entry Heatmap</CardTitle>
                  <CardDescription>
                    Identify peak times when leads enter your funnel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {heatmapCells.length > 0 ? (
                    <HeatmapGrid data={heatmapCells} />
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-600 font-medium mb-2">No heatmap data available yet</p>
                      <p className="text-sm text-slate-500">Add some leads to see entry patterns</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        <Separator className="my-8" />

        {/* Back to Dashboard Button */}
        <section className="text-center pb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            ← Back to Dashboard
          </button>
        </section>
      </div>
    </div>
  );
}