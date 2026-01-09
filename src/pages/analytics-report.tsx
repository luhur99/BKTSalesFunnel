import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "@/lib/supabase";
import { FunnelLeakageStats, StageVelocity, HeatmapDataPoint, BottleneckWarning, VelocityChartData, HeatmapCell } from "@/types/analytics";
import { VelocityChart } from "@/components/analytics/VelocityChart";
import { HeatmapGrid } from "@/components/analytics/HeatmapGrid";
import { FunnelHealthCards } from "@/components/analytics/FunnelHealthCards";
import { BottleneckWarnings } from "@/components/analytics/BottleneckWarnings";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { FollowUpFunnelFlow } from "@/components/analytics/FollowUpFunnelFlow";

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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-20 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <AnalyticsHeader />

        {/* Funnel Health Cards */}
        {leakageStats && (
          <div className="mb-8">
            <FunnelHealthCards leakageStats={leakageStats} />
          </div>
        )}

        {/* Bottleneck Warnings */}
        {bottleneckWarnings.length > 0 && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>⚠️ Bottleneck Alerts</CardTitle>
                <CardDescription>Stages requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <BottleneckWarnings warnings={bottleneckWarnings} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs for Different Analytics Views */}
        <Tabs defaultValue="velocity" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="velocity">Stage Velocity</TabsTrigger>
            <TabsTrigger value="heatmap">Lead Entry Patterns</TabsTrigger>
          </TabsList>

          {/* Stage Velocity Tab */}
          <TabsContent value="velocity">
            <Card>
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
                  <div className="text-center py-12 text-gray-500">
                    No velocity data available yet. Add some leads to see analytics.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Heatmap Tab */}
          <TabsContent value="heatmap">
            <Card>
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
                  <div className="text-center py-12 text-gray-500">
                    No heatmap data available yet. Add some leads to see patterns.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Back to Dashboard Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}